const Notification = require('../models/Notification');
const User = require('../models/User');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Enrollment = require('../models/Enrollment');

class NotificationService {
  // Create enrollment confirmation notification
  static async createEnrollmentNotification(studentUserId, course) {
    try {
      const notification = new Notification({
        recipient: studentUserId,
        title: 'Course Enrollment Confirmed',
        message: `You have successfully enrolled in ${course.courseCode} - ${course.title}`,
        type: 'enrollment_confirmation',
        priority: 'medium',
        category: 'academic',
        relatedEntity: {
          entityType: 'course',
          entityId: course._id
        },
        actionUrl: `/courses`,
        metadata: {
          course: course._id
        }
      });
      
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating enrollment notification:', error);
    }
  }

  // Create assignment due reminder notifications
  static async createAssignmentDueReminders() {
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);

      // Find assignments due tomorrow or in a week
      const upcomingAssignments = await Assignment.find({
        dueDate: {
          $gte: now,
          $lte: nextWeek
        }
      }).populate('course', 'courseCode title enrolledStudents');

      for (const assignment of upcomingAssignments) {
        const dueDate = new Date(assignment.dueDate);
        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        
        let priority = 'medium';
        let title = '';
        
        if (daysUntilDue <= 1) {
          priority = 'urgent';
          title = 'Assignment Due Tomorrow!';
        } else if (daysUntilDue <= 3) {
          priority = 'high';
          title = 'Assignment Due Soon';
        } else {
          priority = 'medium';
          title = 'Upcoming Assignment Reminder';
        }

        // Get enrolled students for this course
        const enrolledStudents = await Student.find({
          _id: { $in: assignment.course.enrolledStudents }
        });

        // Create notifications for each enrolled student
        const notifications = enrolledStudents.map(student => ({
          recipient: student.user,
          title,
          message: `${assignment.title} for ${assignment.course.courseCode} is due on ${dueDate.toLocaleDateString()}`,
          type: 'assignment_due',
          priority,
          category: 'academic',
          relatedEntity: {
            entityType: 'assignment',
            entityId: assignment._id
          },
          actionUrl: `/assignments`,
          metadata: {
            course: assignment.course._id,
            assignment: assignment._id,
            dueDate: assignment.dueDate
          },
          expiresAt: new Date(dueDate.getTime() + 24 * 60 * 60 * 1000) // Expire 1 day after due date
        }));

        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
      }
    } catch (error) {
      console.error('Error creating assignment due reminders:', error);
    }
  }

  // Create registration period reminders
  static async createRegistrationReminders() {
    try {
      const AcademicCalendar = require('../models/AcademicCalendar');
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);

      const calendars = await AcademicCalendar.find({ isActive: true });
      
      for (const calendar of calendars) {
        const registrationPeriods = calendar.registrationPeriods;
        
        // Check each registration period
        for (const [periodType, period] of Object.entries(registrationPeriods)) {
          if (period.startDate) {
            const startDate = new Date(period.startDate);
            const daysUntilStart = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
            
            // Send reminder 7 days before registration opens
            if (daysUntilStart === 7) {
              const students = await Student.find({ status: 'active' });
              
              const notifications = students.map(student => ({
                recipient: student.user,
                title: 'Course Registration Opening Soon',
                message: `${periodType.charAt(0).toUpperCase() + periodType.slice(1)} registration for ${calendar.semester} ${calendar.academicYear} opens in 7 days`,
                type: 'registration_reminder',
                priority: 'high',
                category: 'administrative',
                actionUrl: `/courses`,
                expiresAt: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
              }));

              if (notifications.length > 0) {
                await Notification.insertMany(notifications);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error creating registration reminders:', error);
    }
  }

  // Create grade posted notifications
  static async createGradeNotification(studentUserId, assignment, grade) {
    try {
      const notification = new Notification({
        recipient: studentUserId,
        title: 'New Grade Posted',
        message: `Your grade for "${assignment.title}" has been posted: ${grade.percentage}%`,
        type: 'grade_posted',
        priority: 'medium',
        category: 'academic',
        relatedEntity: {
          entityType: 'assignment',
          entityId: assignment._id
        },
        actionUrl: `/grades`,
        metadata: {
          course: assignment.course,
          assignment: assignment._id,
          additionalData: {
            grade: grade.percentage,
            letterGrade: grade.letterGrade
          }
        }
      });
      
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating grade notification:', error);
    }
  }

  // Create course update notifications
  static async createCourseUpdateNotification(courseId, title, message, updateType = 'general') {
    try {
      const course = await Course.findById(courseId).populate('enrolledStudents');
      
      if (!course) {
        throw new Error('Course not found');
      }

      const students = await Student.find({
        _id: { $in: course.enrolledStudents }
      });

      const notifications = students.map(student => ({
        recipient: student.user,
        title: `Course Update: ${course.courseCode}`,
        message: `${title}: ${message}`,
        type: 'course_update',
        priority: updateType === 'urgent' ? 'urgent' : 'medium',
        category: 'academic',
        relatedEntity: {
          entityType: 'course',
          entityId: courseId
        },
        actionUrl: `/courses`,
        metadata: {
          course: courseId,
          additionalData: {
            updateType
          }
        }
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      return notifications;
    } catch (error) {
      console.error('Error creating course update notifications:', error);
    }
  }

  // Clean up expired notifications
  static async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      console.log(`Cleaned up ${result.deletedCount} expired notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
    }
  }

  // Get notification preferences for a user (placeholder for future implementation)
  static async getUserNotificationPreferences(userId) {
    // This would typically come from a UserPreferences model
    return {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      notificationTypes: {
        assignment_due: true,
        grade_posted: true,
        enrollment_confirmation: true,
        course_update: true,
        registration_reminder: true
      }
    };
  }

  // Send immediate notification (for real-time features)
  static async sendImmediateNotification(userId, title, message, type = 'general', priority = 'medium') {
    try {
      const notification = new Notification({
        recipient: userId,
        title,
        message,
        type,
        priority,
        category: 'system'
      });
      
      await notification.save();
      
      // Here you would integrate with real-time notification services
      // like Socket.IO, Firebase Cloud Messaging, etc.
      
      return notification;
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  }
}

module.exports = NotificationService;