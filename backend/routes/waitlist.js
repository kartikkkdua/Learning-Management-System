const express = require('express');
const router = express.Router();
const Waitlist = require('../models/Waitlist');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const NotificationService = require('../services/notificationService');

// Join waitlist for a course
router.post('/join', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    
    if (!studentId || !courseId) {
      return res.status(400).json({ message: 'Student ID and Course ID are required' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Find student using the same logic as enrollment
    let student;
    let studentObjectId = studentId;
    
    student = await Student.findById(studentId);
    if (!student) {
      student = await Student.findOne({ user: studentId });
      if (student) {
        studentObjectId = student._id;
      }
    }
    
    if (!student) {
      const User = require('../models/User');
      const user = await User.findById(studentId);
      if (user && user.email) {
        student = await Student.findOne({ email: user.email });
        if (student) {
          studentObjectId = student._id;
          if (!student.user) {
            student.user = user._id;
            await student.save();
          }
        }
      }
    }
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentObjectId,
      course: courseId,
      status: 'enrolled'
    });
    
    if (existingEnrollment || course.enrolledStudents.includes(studentObjectId)) {
      return res.status(400).json({ message: 'Student is already enrolled in this course' });
    }
    
    // Check if student is already on waitlist
    const existingWaitlist = await Waitlist.findOne({
      student: studentObjectId,
      course: courseId,
      status: 'waiting'
    });
    
    if (existingWaitlist) {
      return res.status(400).json({ message: 'Student is already on the waitlist for this course' });
    }
    
    // Get next position in waitlist
    const lastPosition = await Waitlist.findOne({
      course: courseId,
      status: 'waiting'
    }).sort({ position: -1 });
    
    const nextPosition = lastPosition ? lastPosition.position + 1 : 1;
    
    // Determine priority based on student year
    let priority = 'normal';
    if (student.year === 4) priority = 'senior';
    
    const waitlistEntry = new Waitlist({
      course: courseId,
      student: studentObjectId,
      position: nextPosition,
      priority,
      semester: course.semester,
      year: course.year
    });
    
    await waitlistEntry.save();
    
    // Create notification
    if (student.user) {
      await NotificationService.sendImmediateNotification(
        student.user,
        'Added to Course Waitlist',
        `You have been added to the waitlist for ${course.courseCode} - ${course.title}. Your position is #${nextPosition}.`,
        'enrollment_confirmation',
        'medium'
      );
    }
    
    const populatedWaitlist = await Waitlist.findById(waitlistEntry._id)
      .populate('course', 'courseCode title capacity')
      .populate('student', 'firstName lastName studentId');
    
    res.status(201).json({
      message: 'Successfully added to waitlist',
      waitlist: populatedWaitlist
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Leave waitlist
router.post('/leave', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    
    // Find student
    let student;
    let studentObjectId = studentId;
    
    student = await Student.findById(studentId);
    if (!student) {
      student = await Student.findOne({ user: studentId });
      if (student) {
        studentObjectId = student._id;
      }
    }
    
    if (!student) {
      const User = require('../models/User');
      const user = await User.findById(studentId);
      if (user && user.email) {
        student = await Student.findOne({ email: user.email });
        if (student) {
          studentObjectId = student._id;
        }
      }
    }
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const waitlistEntry = await Waitlist.findOne({
      student: studentObjectId,
      course: courseId,
      status: 'waiting'
    });
    
    if (!waitlistEntry) {
      return res.status(404).json({ message: 'Student not found on waitlist' });
    }
    
    const removedPosition = waitlistEntry.position;
    
    // Remove from waitlist
    waitlistEntry.status = 'removed';
    await waitlistEntry.save();
    
    // Update positions of students behind in line
    await Waitlist.updateMany(
      {
        course: courseId,
        status: 'waiting',
        position: { $gt: removedPosition }
      },
      { $inc: { position: -1 } }
    );
    
    res.json({ message: 'Successfully removed from waitlist' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get waitlist for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const waitlist = await Waitlist.find({
      course: req.params.courseId,
      status: 'waiting'
    })
    .populate('student', 'firstName lastName studentId email')
    .sort({ position: 1 });
    
    res.json(waitlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's waitlist entries
router.get('/student/:studentId', async (req, res) => {
  try {
    // Find student
    let student;
    let studentObjectId = req.params.studentId;
    
    student = await Student.findById(req.params.studentId);
    if (!student) {
      student = await Student.findOne({ user: req.params.studentId });
      if (student) {
        studentObjectId = student._id;
      }
    }
    
    if (!student) {
      const User = require('../models/User');
      const user = await User.findById(req.params.studentId);
      if (user && user.email) {
        student = await Student.findOne({ email: user.email });
        if (student) {
          studentObjectId = student._id;
        }
      }
    }
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const waitlistEntries = await Waitlist.find({
      student: studentObjectId,
      status: { $in: ['waiting', 'notified'] }
    })
    .populate('course', 'courseCode title capacity semester year')
    .sort({ position: 1 });
    
    res.json(waitlistEntries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process waitlist when spot opens (internal function)
router.post('/process/:courseId', async (req, res) => {
  try {
    const courseId = req.params.courseId;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if there are available spots
    const availableSpots = course.capacity - course.enrolledStudents.length;
    if (availableSpots <= 0) {
      return res.status(400).json({ message: 'No available spots in course' });
    }
    
    // Get next students on waitlist
    const nextStudents = await Waitlist.find({
      course: courseId,
      status: 'waiting'
    })
    .populate('student', 'firstName lastName email user')
    .sort({ priority: -1, position: 1 })
    .limit(availableSpots);
    
    const notifiedStudents = [];
    
    for (const waitlistEntry of nextStudents) {
      // Update waitlist status
      waitlistEntry.status = 'notified';
      waitlistEntry.notifiedAt = new Date();
      waitlistEntry.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours to respond
      await waitlistEntry.save();
      
      // Send notification
      if (waitlistEntry.student.user) {
        await NotificationService.sendImmediateNotification(
          waitlistEntry.student.user,
          'Course Spot Available!',
          `A spot has opened in ${course.courseCode} - ${course.title}. You have 24 hours to enroll.`,
          'enrollment_confirmation',
          'urgent'
        );
      }
      
      notifiedStudents.push(waitlistEntry);
    }
    
    res.json({
      message: `Notified ${notifiedStudents.length} students`,
      notifiedStudents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get waitlist statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Waitlist.aggregate([
      {
        $group: {
          _id: '$course',
          totalWaiting: { $sum: { $cond: [{ $eq: ['$status', 'waiting'] }, 1, 0] } },
          totalNotified: { $sum: { $cond: [{ $eq: ['$status', 'notified'] }, 1, 0] } },
          averagePosition: { $avg: '$position' }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $unwind: '$course'
      },
      {
        $project: {
          courseCode: '$course.courseCode',
          courseTitle: '$course.title',
          totalWaiting: 1,
          totalNotified: 1,
          averagePosition: { $round: ['$averagePosition', 1] }
        }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;