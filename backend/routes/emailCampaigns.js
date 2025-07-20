const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const EmailCampaign = require('../models/EmailCampaign');
const EmailTemplate = require('../models/EmailTemplate');
const EmailLog = require('../models/EmailLog');
const emailService = require('../services/emailService');

// Get all campaigns
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const campaigns = await EmailCampaign.find({ createdBy: req.user.id })
      .populate('template', 'name')
      .populate('courseId', 'name code')
      .sort({ createdAt: -1 });

    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new campaign
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const campaignData = {
      ...req.body,
      createdBy: req.user.id
    };

    const campaign = new EmailCampaign(campaignData);
    await campaign.save();

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get campaign by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id)
      .populate('template')
      .populate('courseId', 'name code')
      .populate('createdBy', 'username email');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if user owns the campaign or is admin
    if (campaign.createdBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update campaign
router.put('/:id', auth, async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if user owns the campaign or is admin
    if (campaign.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedCampaign = await EmailCampaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedCampaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete campaign
router.delete('/:id', auth, async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if user owns the campaign or is admin
    if (campaign.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await EmailCampaign.findByIdAndDelete(req.params.id);
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send campaign immediately
router.post('/:id/send', auth, async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if user owns the campaign or is admin
    if (campaign.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get recipients
    const recipients = await emailService.getCampaignRecipients(campaign);
    
    if (recipients.length === 0) {
      return res.status(400).json({ message: 'No recipients found for this campaign' });
    }

    // Send campaign
    const result = await emailService.sendCampaignEmail(req.params.id, recipients);

    if (result.success) {
      // Update campaign status
      await EmailCampaign.findByIdAndUpdate(req.params.id, {
        status: 'completed'
      });

      res.json({
        message: 'Campaign sent successfully',
        totalSent: result.totalSent,
        totalFailed: result.totalFailed,
        results: result.results
      });
    } else {
      res.status(500).json({ message: 'Failed to send campaign', error: result.error });
    }
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Schedule campaign
router.post('/:id/schedule', auth, async (req, res) => {
  try {
    const { scheduledDate } = req.body;
    const campaign = await EmailCampaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if user owns the campaign or is admin
    if (campaign.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await emailService.scheduleCampaign(req.params.id, scheduledDate);

    if (result.success) {
      res.json({ message: 'Campaign scheduled successfully', scheduledDate });
    } else {
      res.status(500).json({ message: 'Failed to schedule campaign', error: result.error });
    }
  } catch (error) {
    console.error('Error scheduling campaign:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get campaign analytics
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if user owns the campaign or is admin
    if (campaign.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get detailed analytics from email logs
    const emailLogs = await EmailLog.find({ campaign: req.params.id });

    const analytics = {
      basic: campaign.analytics,
      detailed: {
        openRate: campaign.analytics.sent > 0 ? (campaign.analytics.opened / campaign.analytics.sent * 100).toFixed(2) : 0,
        clickRate: campaign.analytics.sent > 0 ? (campaign.analytics.clicked / campaign.analytics.sent * 100).toFixed(2) : 0,
        bounceRate: campaign.analytics.sent > 0 ? (campaign.analytics.bounced / campaign.analytics.sent * 100).toFixed(2) : 0,
        unsubscribeRate: campaign.analytics.sent > 0 ? (campaign.analytics.unsubscribed / campaign.analytics.sent * 100).toFixed(2) : 0
      },
      timeline: emailLogs.map(log => ({
        timestamp: log.sentAt,
        event: 'sent',
        recipient: log.recipients[0]?.email
      }))
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Pause/Resume campaign
router.post('/:id/toggle', auth, async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if user owns the campaign or is admin
    if (campaign.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    
    await EmailCampaign.findByIdAndUpdate(req.params.id, {
      status: newStatus
    });

    res.json({ message: `Campaign ${newStatus}`, status: newStatus });
  } catch (error) {
    console.error('Error toggling campaign:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;