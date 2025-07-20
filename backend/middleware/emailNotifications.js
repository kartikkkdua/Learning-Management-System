const emailService = require('../services/emailService');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');

// Middleware to send email notifications for various events
class EmailNotificationMiddleware {
  
  // Send welcome email when user is created
  static async sendWelcomeEmail(user) {
    try {
      await emailService.sendWelcomeEmail(user);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  // Send assignment notification to students
  static async notifyAssignmentCreated(assignment, courseId) {
    try {
      const course = await Course.findById(courseId).populate({
        path: 'enrolledStudents',
        populate: { path: 'user' }
      });
      
      if (course && course.enrolledStudents.length > 0) {
        const students = course.enrolledStudents.map(enrollment => enrollment.user);
        await emailService.sendAssignmentNotification(students, assignment, course);
      }
    } catch (error) {
      console.error('Failed to send assignment notification:', error);
    }
  }

  // Send announcement notification
  static async notifyAnnouncement(announcement, courseId = null) {
    try {
      let recipients = [];
      let course = null;

      if (courseId) {
        course = await Course.findById(courseId).populate({
          path: 'enrolledStudents',
          populate: { path: 'user' }
        });
        recipients = course.enrolledStudents.map(enrollment => enrollment.user);
      } else {
        // Send to all students if no specific course
        const students = await Student.find({}).populate('user');
        recipients = students.map(student => student.user);
      }

      if (recipients.length > 0) {
        await emailService.sendAnnouncementEmail(recipients, announcement, course);
      }
    } catch (error) {
      console.error('Failed to send announcement notification:', error);
    }
  }

  // Send grade notification to student
  static async notifyGradePosted(studentId, assignment, grade, courseId) {
    try {
      const student = await Student.findById(studentId).populate('user');
      const course = await Course.findById(courseId);
      
      if (student && course) {
        await emailService.sendGradeNotification(student.user, assignment, grade, course);
      }
    } catch (error) {
      console.error('Failed to send grade notification:', error);
    }
  }

  // Send course enrollment confirmation
  static async notifyEnrollment(studentId, courseId) {
    try {
      const student = await Student.findById(studentId).populate('user');
      const course = await Course.findById(courseId);
      
      if (student && course) {
        const subject = `Enrollment Confirmation: ${course.name}`;
        const content = `
          <h2>Enrollment Confirmation</h2>
          <p>Hello ${student.user.name},</p>
          <p>You have been successfully enrolled in <strong>${course.name} (${course.code})</strong>.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Course:</strong> ${course.name}</p>
            <p><strong>Code:</strong> ${course.code}</p>
            <p><strong>Credits:</strong> ${course.credits}</p>
            <p><strong>Instructor:</strong> ${course.instructor}</p>
          </div>
          <p>Please log in to access course materials and assignments.</p>
          <p>Best regards,<br>LMS Team</p>
        `;
        
        await emailService.sendCustomEmail([student.user.email], subject, content);
      }
    } catch (error) {
      console.error('Failed to send enrollment notification:', error);
    }
  }

  // Send assignment due reminder (can be called by a cron job)
  static async sendAssignmentReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const Assignment = require('../models/Assignment');
      const assignments = await Assignment.find({
        dueDate: { $lte: tomorrow, $gte: new Date() },
        status: 'active'
      }).populate('course');

      for (const assignment of assignments) {
        const course = await Course.findById(assignment.course._id).populate({
          path: 'enrolledStudents',
          populate: { path: 'user' }
        });

        if (course && course.enrolledStudents.length > 0) {
          const students = course.enrolledStudents.map(enrollment => enrollment.user);
          const subject = `Assignment Due Tomorrow: ${assignment.title}`;
          const content = `
            <h2>Assignment Due Reminder</h2>
            <p>This is a friendly reminder that your assignment is due tomorrow:</p>
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="margin-top: 0; color: #856404;">${assignment.title}</h3>
              <p><strong>Course:</strong> ${course.name}</p>
              <p><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>
              <p><strong>Description:</strong> ${assignment.description}</p>
            </div>
            <p>Please submit your work on time to avoid late penalties.</p>
            <p>Best regards,<br>LMS Team</p>
          `;
          
          await emailService.sendCustomEmail(
            students.map(s => s.email), 
            subject, 
            content
          );
        }
      }
    } catch (error) {
      console.error('Failed to send assignment reminders:', error);
    }
  }
}

module.exports = EmailNotificationMiddleware;