const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');

// Test email connection
router.get('/test-connection', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await emailService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('Email connection test error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send test email
router.post('/test', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { testEmail } = req.body;
    if (!testEmail) {
      return res.status(400).json({ message: 'Test email address is required' });
    }

    const subject = 'LMS Email Test';
    const content = `
      <h2>Email Test Successful!</h2>
      <p>This is a test email from your LMS platform.</p>
      <p>If you received this email, your email configuration is working correctly.</p>
      <p>Sent at: ${new Date().toLocaleString()}</p>
    `;

    const result = await emailService.sendCustomEmail([testEmail], subject, content);

    if (result.success) {
      res.json({ message: 'Test email sent successfully!', messageId: result.messageId });
    } else {
      res.status(500).json({ message: 'Failed to send test email', error: result.error });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send custom email (Admin/Faculty only)
router.post('/send', auth, async (req, res) => {
  try {
    const { recipients, subject, content, recipientType } = req.body;

    console.log('Email send request:', { recipientType, subject });

    // Check if user has permission to send emails
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    let emailList = [];

    if (recipientType === 'specific') {
      emailList = recipients;
    } else if (recipientType === 'all_students') {
      console.log('Fetching all students...');
      
      // Try to get students from User model first (more reliable)
      const studentUsers = await User.find({ role: 'student' });
      console.log('Found student users:', studentUsers.length);
      
      if (studentUsers.length > 0) {
        emailList = studentUsers.map(user => user.email);
      } else {
        // Fallback to Student model if User approach doesn't work
        const students = await Student.find({}).populate('user');
        console.log('Found students from Student model:', students.length);
        emailList = students.map(student => student.user?.email).filter(email => email);
      }
      
    } else if (recipientType === 'all_faculty') {
      console.log('Fetching all faculty...');
      
      // Try to get faculty from User model first (more reliable)
      const facultyUsers = await User.find({ role: 'faculty' });
      console.log('Found faculty users:', facultyUsers.length);
      
      if (facultyUsers.length > 0) {
        emailList = facultyUsers.map(user => user.email);
      } else {
        // Fallback to Faculty model if User approach doesn't work
        const faculty = await Faculty.find({}).populate('user');
        console.log('Found faculty from Faculty model:', faculty.length);
        emailList = faculty.map(f => f.user?.email).filter(email => email);
      }
      
    } else if (recipientType === 'course_students') {
      const { courseId } = req.body;
      console.log('Fetching course students for course:', courseId);
      
      if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required for course students' });
      }
      
      const course = await Course.findById(courseId).populate({
        path: 'enrolledStudents',
        populate: { path: 'user' }
      });
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      emailList = course.enrolledStudents?.map(student => student.user?.email).filter(email => email) || [];
    }

    console.log('Email list prepared:', emailList.length, 'recipients');

    if (emailList.length === 0) {
      return res.status(400).json({ 
        message: 'No recipients found for the selected recipient type',
        recipientType 
      });
    }

    const result = await emailService.sendCustomEmail(emailList, subject, content);

    if (result.success) {
      res.json({ 
        message: `Email sent successfully to ${emailList.length} recipients`, 
        messageId: result.messageId,
        recipientCount: emailList.length
      });
    } else {
      res.status(500).json({ message: 'Failed to send email', error: result.error });
    }
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get email templates
router.get('/templates', auth, (req, res) => {
  const templates = [
    {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to LMS Platform',
      content: `
        <h2>Welcome to LMS Platform!</h2>
        <p>Hello [NAME],</p>
        <p>Your account has been created successfully.</p>
        <p>Best regards,<br>LMS Team</p>
      `
    },
    {
      id: 'assignment_reminder',
      name: 'Assignment Reminder',
      subject: 'Assignment Due Reminder',
      content: `
        <h2>Assignment Due Reminder</h2>
        <p>Hello [NAME],</p>
        <p>This is a reminder that your assignment "[ASSIGNMENT_TITLE]" is due on [DUE_DATE].</p>
        <p>Please submit your work on time.</p>
        <p>Best regards,<br>LMS Team</p>
      `
    },
    {
      id: 'course_update',
      name: 'Course Update',
      subject: 'Course Update Notification',
      content: `
        <h2>Course Update</h2>
        <p>Hello [NAME],</p>
        <p>There has been an update to your course "[COURSE_NAME]".</p>
        <p>Please check the course page for more details.</p>
        <p>Best regards,<br>LMS Team</p>
      `
    }
  ];

  res.json(templates);
});

// Send bulk emails to course students
router.post('/bulk/course/:courseId', auth, async (req, res) => {
  try {
    const { subject, content } = req.body;
    const { courseId } = req.params;

    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const course = await Course.findById(courseId).populate({
      path: 'enrolledStudents',
      populate: { path: 'user' }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const students = course.enrolledStudents;
    const emails = students.map(student => student.user.email);

    const result = await emailService.sendCustomEmail(emails, subject, content);

    if (result.success) {
      res.json({
        message: `Email sent to ${emails.length} students`,
        messageId: result.messageId
      });
    } else {
      res.status(500).json({ message: 'Failed to send email', error: result.error });
    }
  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get email history (placeholder for future implementation)
router.get('/history', auth, async (req, res) => {
  try {
    // This would typically fetch from a database table storing email history
    res.json({
      message: 'Email history feature coming soon',
      emails: []
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;