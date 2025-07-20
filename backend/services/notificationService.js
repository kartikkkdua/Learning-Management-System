const Notification = require('../models/Notification');

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  // Create a single notification
  async createNotification(data) {
    try {
      return await Notification.createAndEmit(data, this.io);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Broadcast to multiple users
  async broadcastNotification(userIds, data) {
    try {
      return await Notification.broadcastToUsers(userIds, data, this.io);
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      throw error;
    }
  }

  // Send assignment due reminders
  async sendAssignmentReminder(assignment, students) {
    const studentIds = students.map(s => s._id);
    const notificationData = {
      title: 'Assignment Due Soon',
      message: `Assignment "${assignment.title}" is due in 24 hours`,
      type: 'assignment_due',
      priority: 'high',
      category: 'academic',
      actionUrl: `/assignments/${assignment._id}`,
      metadata: {
        assignment: assignment._id,
        course: assignment.course,
        dueDate: assignment.dueDate
      },
      expiresAt: new Date(assignment.dueDate.getTime() + 24 * 60 * 60 * 1000) // Expire 24h after due date
    };

    return await this.broadcastNotification(studentIds, notificationData);
  }

  // Send grade posted notification
  async sendGradeNotification(student, assignment, grade) {
    const notificationData = {
      title: 'New Grade Posted',
      message: `Your grade for "${assignment.title}" has been posted: ${grade.score}/${grade.totalPoints}`,
      type: 'grade_posted',
      priority: 'medium',
      category: 'academic',
      actionUrl: `/grades`,
      metadata: {
        assignment: assignment._id,
        course: assignment.course,
        grade: grade.score,
        totalPoints: grade.totalPoints
      }
    };

    return await this.createNotification({
      ...notificationData,
      recipient: student._id
    });
  }

  // Send enrollment confirmation
  async sendEnrollmentConfirmation(student, course) {
    const notificationData = {
      title: 'Enrollment Confirmed',
      message: `You have been successfully enrolled in "${course.name}"`,
      type: 'enrollment_confirmation',
      priority: 'medium',
      category: 'administrative',
      actionUrl: `/courses/${course._id}`,
      metadata: {
        course: course._id
      }
    };

    return await this.createNotification({
      ...notificationData,
      recipient: student._id
    });
  }

  // Send course announcement
  async sendCourseAnnouncement(announcement, enrolledStudents) {
    const studentIds = enrolledStudents.map(s => s.student);
    const notificationData = {
      title: 'New Course Announcement',
      message: announcement.title,
      type: 'announcement',
      priority: announcement.priority || 'medium',
      category: 'academic',
      actionUrl: `/announcements/${announcement._id}`,
      metadata: {
        course: announcement.course,
        announcement: announcement._id
      }
    };

    return await this.broadcastNotification(studentIds, notificationData);
  }

  // Send system maintenance notification
  async sendSystemNotification(userIds, title, message, priority = 'medium') {
    const notificationData = {
      title,
      message,
      type: 'general',
      priority,
      category: 'system'
    };

    return await this.broadcastNotification(userIds, notificationData);
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      if (notification && this.io) {
        // Emit updated count
        const unreadCount = await Notification.countDocuments({ 
          recipient: userId, 
          isRead: false 
        });
        this.io.to(`user_${userId}`).emit('notificationCount', unreadCount);
      }

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      if (this.io) {
        this.io.to(`user_${userId}`).emit('notificationCount', 0);
      }

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread count for user
  async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({ 
        recipient: userId, 
        isRead: false 
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      console.log(`Cleaned up ${result.deletedCount} expired notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      return 0;
    }
  }
}

module.exports = NotificationService;