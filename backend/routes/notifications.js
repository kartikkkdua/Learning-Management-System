const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const Student = require('../models/Student');
const NotificationService = require('../services/notificationService');
const auth = require('../middleware/auth');

// Get notifications for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false, type } = req.query;
    const userId = req.params.userId;
    
    // Build query
    const query = { recipient: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    if (type) {
      query.type = type;
    }
    
    const notifications = await Notification.find(query)
      .populate('metadata.course', 'courseCode title')
      .populate('metadata.assignment', 'title dueDate')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      isRead: false 
    });
    
    res.json({
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        unreadCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark all notifications as read for a user
router.patch('/user/:userId/read-all', async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.params.userId, isRead: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );
    
    res.json({ 
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create notification with real-time emission
router.post('/', async (req, res) => {
  try {
    const io = req.app.get('io');
    const notificationService = new NotificationService(io);
    
    const notification = await notificationService.createNotification(req.body);
    
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk create notifications with real-time emission
router.post('/bulk', async (req, res) => {
  try {
    const { recipients, title, message, type, priority = 'medium', metadata } = req.body;
    
    if (!recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ message: 'Recipients array is required' });
    }
    
    const io = req.app.get('io');
    const notificationService = new NotificationService(io);
    
    const notificationData = { title, message, type, priority, metadata };
    const notifications = await notificationService.broadcastNotification(recipients, notificationData);
    
    res.status(201).json({
      message: 'Bulk notifications created successfully',
      count: notifications.length,
      notifications
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Enhanced mark as read with real-time updates
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const io = req.app.get('io');
    const notificationService = new NotificationService(io);
    
    const notification = await Notification.findById(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    const updatedNotification = await notificationService.markAsRead(req.params.notificationId, notification.recipient);
    
    res.json(updatedNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Enhanced mark all as read with real-time updates
router.patch('/user/:userId/read-all', async (req, res) => {
  try {
    const io = req.app.get('io');
    const notificationService = new NotificationService(io);
    
    await notificationService.markAllAsRead(req.params.userId);
    
    res.json({ 
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get notification statistics for a user
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const stats = await Notification.aggregate([
      { $match: { recipient: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
          byType: {
            $push: {
              type: '$type',
              isRead: '$isRead'
            }
          },
          byPriority: {
            $push: {
              priority: '$priority',
              isRead: '$isRead'
            }
          }
        }
      }
    ]);
    
    // Process type and priority statistics
    const typeStats = {};
    const priorityStats = {};
    
    if (stats.length > 0) {
      stats[0].byType.forEach(item => {
        if (!typeStats[item.type]) {
          typeStats[item.type] = { total: 0, unread: 0 };
        }
        typeStats[item.type].total++;
        if (!item.isRead) {
          typeStats[item.type].unread++;
        }
      });
      
      stats[0].byPriority.forEach(item => {
        if (!priorityStats[item.priority]) {
          priorityStats[item.priority] = { total: 0, unread: 0 };
        }
        priorityStats[item.priority].total++;
        if (!item.isRead) {
          priorityStats[item.priority].unread++;
        }
      });
    }
    
    res.json({
      total: stats.length > 0 ? stats[0].total : 0,
      unread: stats.length > 0 ? stats[0].unread : 0,
      byType: typeStats,
      byPriority: priorityStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;