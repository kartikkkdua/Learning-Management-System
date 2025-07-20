const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const EmailLog = require('../models/EmailLog');
const EmailCampaign = require('../models/EmailCampaign');

// Get email analytics dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get email logs for the time range
    const emailLogs = await EmailLog.find({
      sender: req.user.id,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Calculate basic metrics
    const totalSent = emailLogs.length;
    const totalDelivered = emailLogs.filter(log => log.status === 'delivered').length;
    const totalOpened = emailLogs.filter(log => log.tracking.opened.count > 0).length;
    const totalClicked = emailLogs.filter(log => log.tracking.clicked.count > 0).length;
    const totalBounced = emailLogs.filter(log => log.status === 'bounced').length;

    // Calculate rates
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent * 100).toFixed(2) : 0;
    const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered * 100).toFixed(2) : 0;
    const clickRate = totalDelivered > 0 ? (totalClicked / totalDelivered * 100).toFixed(2) : 0;
    const bounceRate = totalSent > 0 ? (totalBounced / totalSent * 100).toFixed(2) : 0;

    // Get campaign performance
    const campaigns = await EmailCampaign.find({
      createdBy: req.user.id,
      createdAt: { $gte: startDate, $lte: endDate }
    }).select('name analytics createdAt');

    // Get top performing emails
    const topEmails = emailLogs
      .sort((a, b) => b.tracking.opened.count - a.tracking.opened.count)
      .slice(0, 10)
      .map(log => ({
        subject: log.subject,
        opens: log.tracking.opened.count,
        clicks: log.tracking.clicked.count,
        sentAt: log.sentAt
      }));

    // Get email activity timeline
    const timeline = emailLogs.reduce((acc, log) => {
      const date = log.sentAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { sent: 0, opened: 0, clicked: 0 };
      }
      acc[date].sent++;
      if (log.tracking.opened.count > 0) acc[date].opened++;
      if (log.tracking.clicked.count > 0) acc[date].clicked++;
      return acc;
    }, {});

    const timelineData = Object.keys(timeline)
      .sort()
      .map(date => ({
        date,
        ...timeline[date]
      }));

    res.json({
      overview: {
        totalSent,
        totalDelivered,
        totalOpened,
        totalClicked,
        totalBounced,
        deliveryRate: parseFloat(deliveryRate),
        openRate: parseFloat(openRate),
        clickRate: parseFloat(clickRate),
        bounceRate: parseFloat(bounceRate)
      },
      campaigns: campaigns.map(campaign => ({
        id: campaign._id,
        name: campaign.name,
        sent: campaign.analytics.sent,
        opened: campaign.analytics.opened,
        clicked: campaign.analytics.clicked,
        openRate: campaign.analytics.sent > 0 ? 
          (campaign.analytics.opened / campaign.analytics.sent * 100).toFixed(2) : 0,
        createdAt: campaign.createdAt
      })),
      topEmails,
      timeline: timelineData
    });
  } catch (error) {
    console.error('Error fetching analytics dashboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get detailed email performance
router.get('/emails/:id', auth, async (req, res) => {
  try {
    const emailLog = await EmailLog.findById(req.params.id);

    if (!emailLog) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Check if user owns the email or is admin
    if (emailLog.sender.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      email: emailLog,
      analytics: {
        totalOpens: emailLog.tracking.opened.count,
        totalClicks: emailLog.tracking.clicked.count,
        firstOpened: emailLog.tracking.opened.firstOpenedAt,
        lastOpened: emailLog.tracking.opened.lastOpenedAt,
        firstClicked: emailLog.tracking.clicked.firstClickedAt,
        lastClicked: emailLog.tracking.clicked.lastClickedAt,
        openEvents: emailLog.tracking.opened.openEvents,
        clickEvents: emailLog.tracking.clicked.clickEvents
      }
    });
  } catch (error) {
    console.error('Error fetching email analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Track email opens
router.get('/track/open/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip;

    await EmailLog.findOneAndUpdate(
      { messageId },
      {
        $inc: { 'tracking.opened.count': 1 },
        $set: {
          'tracking.opened.lastOpenedAt': new Date()
        },
        $setOnInsert: {
          'tracking.opened.firstOpenedAt': new Date()
        },
        $push: {
          'tracking.opened.openEvents': {
            timestamp: new Date(),
            userAgent,
            ipAddress
          }
        }
      },
      { upsert: true }
    );

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.send(pixel);
  } catch (error) {
    console.error('Error tracking email open:', error);
    res.status(500).send('Error');
  }
});

// Track email clicks
router.get('/track/click/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { url } = req.query;
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip;

    await EmailLog.findOneAndUpdate(
      { messageId },
      {
        $inc: { 'tracking.clicked.count': 1 },
        $set: {
          'tracking.clicked.lastClickedAt': new Date()
        },
        $setOnInsert: {
          'tracking.clicked.firstClickedAt': new Date()
        },
        $push: {
          'tracking.clicked.clickEvents': {
            timestamp: new Date(),
            url,
            userAgent,
            ipAddress
          }
        }
      },
      { upsert: true }
    );

    // Redirect to the original URL
    res.redirect(url || '/');
  } catch (error) {
    console.error('Error tracking email click:', error);
    res.redirect('/');
  }
});

// Get recipient engagement report
router.get('/engagement', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { limit = 50 } = req.query;

    // Aggregate recipient engagement data
    const engagement = await EmailLog.aggregate([
      {
        $match: {
          sender: req.user.id
        }
      },
      {
        $unwind: '$recipients'
      },
      {
        $group: {
          _id: '$recipients.email',
          name: { $first: '$recipients.name' },
          totalEmails: { $sum: 1 },
          totalOpens: { $sum: '$tracking.opened.count' },
          totalClicks: { $sum: '$tracking.clicked.count' },
          lastEmailSent: { $max: '$sentAt' },
          lastOpened: { $max: '$tracking.opened.lastOpenedAt' },
          lastClicked: { $max: '$tracking.clicked.lastClickedAt' }
        }
      },
      {
        $addFields: {
          openRate: {
            $cond: [
              { $gt: ['$totalEmails', 0] },
              { $multiply: [{ $divide: ['$totalOpens', '$totalEmails'] }, 100] },
              0
            ]
          },
          clickRate: {
            $cond: [
              { $gt: ['$totalEmails', 0] },
              { $multiply: [{ $divide: ['$totalClicks', '$totalEmails'] }, 100] },
              0
            ]
          }
        }
      },
      {
        $sort: { totalOpens: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json(engagement);
  } catch (error) {
    console.error('Error fetching engagement report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Export analytics data
router.get('/export', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { format = 'json', startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const emailLogs = await EmailLog.find({
      sender: req.user.id,
      ...dateFilter
    }).populate('campaign', 'name');

    const exportData = emailLogs.map(log => ({
      subject: log.subject,
      campaign: log.campaign?.name || 'Direct Email',
      recipients: log.recipients.length,
      status: log.status,
      sentAt: log.sentAt,
      opens: log.tracking.opened.count,
      clicks: log.tracking.clicked.count,
      firstOpened: log.tracking.opened.firstOpenedAt,
      lastOpened: log.tracking.opened.lastOpenedAt
    }));

    if (format === 'csv') {
      // Convert to CSV format
      const csv = [
        'Subject,Campaign,Recipients,Status,Sent At,Opens,Clicks,First Opened,Last Opened',
        ...exportData.map(row => 
          `"${row.subject}","${row.campaign}",${row.recipients},"${row.status}","${row.sentAt}",${row.opens},${row.clicks},"${row.firstOpened || ''}","${row.lastOpened || ''}"`
        )
      ].join('\n');

      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="email-analytics.csv"'
      });
      res.send(csv);
    } else {
      res.json(exportData);
    }
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;