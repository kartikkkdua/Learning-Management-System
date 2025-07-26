const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Get notifications for the current user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, unreadOnly = false, type } = req.query;
    
    // Build query
    const query = { recipient: req.user.id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    if (type) {
      query.type = type;
    }
    
    const notifications = await Notification.find(query)
      .populate('metadata.course', 'name code')
      .populate('metadata.assignment', 'title dueDate')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user.id, 
      isRead: false 
    });
    
    res.json({
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.id, 
        recipient: req.user.id 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      const unreadCount = await Notification.countDocuments({ 
        recipient: req.user.id, 
        isRead: false 
      });
      io.to(`user_${req.user.id}`).emit('notificationCount', unreadCount);
    }
    
    res.json({ 
      message: 'Notification marked as read',
      notification 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read for current user
router.put('/read-all', auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${req.user.id}`).emit('notificationCount', 0);
    }
    
    res.json({ 
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      const unreadCount = await Notification.countDocuments({ 
        recipient: req.user.id, 
        isRead: false 
      });
      io.to(`user_${req.user.id}`).emit('notificationCount', unreadCount);
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create notification
router.post('/', auth, async (req, res) => {
  try {
    const { title, message, type, recipient, priority, category, actionUrl, metadata } = req.body;
    
    // Validate required fields
    if (!title || !message || !type) {
      return res.status(400).json({ message: 'Title, message, and type are required' });
    }
    
    // If no recipient specified, send to self (for testing)
    const finalRecipient = recipient || req.user.id;
    
    const io = req.app.get('io');
    const notification = await Notification.createAndEmit({
      title,
      message,
      type,
      recipient: finalRecipient,
      priority: priority || 'medium',
      category: category || 'academic',
      actionUrl,
      metadata: metadata || {}
    }, io);
    
    res.status(201).json({ 
      message: 'Notification created successfully',
      notification 
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: error.message });
  }
});

// Bulk create notifications
router.post('/bulk', auth, async (req, res) => {
  try {
    const { recipients, title, message, type, priority = 'medium', category = 'academic', metadata } = req.body;
    
    if (!recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ message: 'Recipients array is required' });
    }
    
    if (!title || !message || !type) {
      return res.status(400).json({ message: 'Title, message, and type are required' });
    }
    
    const io = req.app.get('io');
    const notifications = await Notification.broadcastToUsers(recipients, {
      title,
      message,
      type,
      priority,
      category,
      metadata: metadata || {}
    }, io);
    
    res.status(201).json({
      message: 'Bulk notifications created successfully',
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    res.status(500).json({ message: error.message });
  }
});



// Get unread notification count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      recipient: req.user.id, 
      isRead: false 
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get only unread notifications
router.get('/unread', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipient: req.user.id, 
      isRead: false 
    })
    .populate('metadata.course', 'name code')
    .populate('metadata.assignment', 'title dueDate')
    .sort({ createdAt: -1 });
    
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get notification stats for current user
router.get('/stats', auth, async (req, res) => {
  try {
    const [unreadCount, totalCount] = await Promise.all([
      Notification.countDocuments({ recipient: req.user.id, isRead: false }),
      Notification.countDocuments({ recipient: req.user.id })
    ]);
    
    res.json({
      success: true,
      data: {
        unreadCount,
        totalCount,
        readCount: totalCount - unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get general notification stats (admin only)
router.get('/admin/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const [totalNotifications, unreadNotifications, todayNotifications] = await Promise.all([
      Notification.countDocuments(),
      Notification.countDocuments({ isRead: false }),
      Notification.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ]);
    
    res.json({
      success: true,
      data: {
        totalNotifications,
        unreadNotifications,
        readNotifications: totalNotifications - unreadNotifications,
        todayNotifications
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;