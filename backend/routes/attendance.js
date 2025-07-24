const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');

// Get attendance records (filtered by faculty access)
router.get('/', auth, async (req, res) => {
  try {
    const { course, date, student } = req.query;
    let filter = {};

    // If user is faculty, only show attendance for courses they teach
    if (req.user.role === 'faculty') {
      // Find faculty member record
      const FacultyMember = require('../models/FacultyMember');
      const facultyMember = await FacultyMember.findOne({ user: req.user.userId });
      
      if (!facultyMember) {
        return res.status(403).json({ message: 'Faculty member record not found' });
      }
      
      // Get courses taught by this faculty member
      const facultyCourses = await Course.find({ instructor: facultyMember._id }).select('_id');
      const courseIds = facultyCourses.map(c => c._id);
      
      if (courseIds.length === 0) {
        return res.json([]); // No courses assigned to this faculty
      }
      
      filter.course = { $in: courseIds };
    }

    if (course) {
      // If specific course requested, check faculty access
      if (req.user.role === 'faculty') {
        const FacultyMember = require('../models/FacultyMember');
        const facultyMember = await FacultyMember.findOne({ user: req.user.userId });
        
        if (!facultyMember) {
          return res.status(403).json({ message: 'Faculty member record not found' });
        }
        
        const courseAccess = await Course.findOne({ 
          _id: course, 
          instructor: facultyMember._id 
        });
        
        if (!courseAccess) {
          return res.status(403).json({ 
            message: 'Access denied. You do not have access to this course.' 
          });
        }
      }
      filter.course = course;
    }
    
    if (date) filter.date = new Date(date);
    if (student) filter['records.student'] = student;

    const attendance = await Attendance.find(filter)
      .populate('course', 'courseCode title')
      .populate('records.student', 'firstName lastName studentId')
      .populate('markedBy', 'profile.firstName profile.lastName')
      .sort({ date: -1 });
    
    console.log(`Found ${attendance.length} attendance records for ${req.user.role} user`);
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance by course and date range (with faculty access control)
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    // Check if faculty has access to this course
    if (req.user.role === 'faculty') {
      const FacultyMember = require('../models/FacultyMember');
      const facultyMember = await FacultyMember.findOne({ user: req.user.userId });
      
      if (!facultyMember) {
        return res.status(403).json({ message: 'Faculty member record not found' });
      }
      
      const course = await Course.findOne({ 
        _id: req.params.courseId, 
        instructor: facultyMember._id 
      });
      
      if (!course) {
        return res.status(403).json({ 
          message: 'Access denied. You do not have access to this course.' 
        });
      }
    }

    const { startDate, endDate } = req.query;
    let filter = { course: req.params.courseId };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(filter)
      .populate('course', 'courseCode title')
      .populate('records.student', 'firstName lastName studentId')
      .populate('markedBy', 'profile.firstName profile.lastName')
      .sort({ date: -1 });
    
    console.log(`Found ${attendance.length} attendance records for course ${req.params.courseId}`);
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark attendance for a class (Faculty can only mark for their courses)
router.post('/', auth, async (req, res) => {
  try {
    const { course, date, records } = req.body;

    // Check if faculty has access to mark attendance for this course
    if (req.user.role === 'faculty') {
      const FacultyMember = require('../models/FacultyMember');
      const facultyMember = await FacultyMember.findOne({ user: req.user.userId });
      
      if (!facultyMember) {
        return res.status(403).json({ message: 'Faculty member record not found' });
      }
      
      const courseAccess = await Course.findOne({ 
        _id: course, 
        instructor: facultyMember._id 
      });
      
      if (!courseAccess) {
        return res.status(403).json({ 
          message: 'Access denied. You can only mark attendance for courses you teach.' 
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only faculty and administrators can mark attendance.' 
      });
    }

    // Set markedBy to current user
    const markedBy = req.user.userId;

    // Check if attendance already exists for this course and date
    const existingAttendance = await Attendance.findOne({ course, date: new Date(date) });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.records = records;
      existingAttendance.markedBy = markedBy;
      await existingAttendance.save();
      
      const updatedAttendance = await Attendance.findById(existingAttendance._id)
        .populate('course', 'courseCode title')
        .populate('records.student', 'firstName lastName studentId')
        .populate('markedBy', 'profile.firstName profile.lastName');
      
      console.log(`Attendance updated for course ${course} by ${req.user.role} ${req.user.userId}`);
      res.json(updatedAttendance);
    } else {
      // Create new attendance record
      const attendance = new Attendance({
        course,
        date: new Date(date),
        records,
        markedBy
      });

      const savedAttendance = await attendance.save();
      const populatedAttendance = await Attendance.findById(savedAttendance._id)
        .populate('course', 'courseCode title')
        .populate('records.student', 'firstName lastName studentId')
        .populate('markedBy', 'profile.firstName profile.lastName');
      
      console.log(`Attendance marked for course ${course} by ${req.user.role} ${req.user.userId}`);
      res.status(201).json(populatedAttendance);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get attendance statistics for a student (Faculty can only see stats for their courses)
router.get('/student/:studentId/stats', auth, async (req, res) => {
  try {
    const { courseId } = req.query;
    let matchFilter = { 'records.student': req.params.studentId };
    
    if (courseId) {
      matchFilter.course = courseId;
    }

    const stats = await Attendance.aggregate([
      { $match: matchFilter },
      { $unwind: '$records' },
      { $match: { 'records.student': req.params.studentId } },
      {
        $group: {
          _id: '$course',
          totalClasses: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0]
            }
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ['$records.status', 'absent'] }, 1, 0]
            }
          },
          late: {
            $sum: {
              $cond: [{ $eq: ['$records.status', 'late'] }, 1, 0]
            }
          },
          excused: {
            $sum: {
              $cond: [{ $eq: ['$records.status', 'excused'] }, 1, 0]
            }
          }
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
      { $unwind: '$course' },
      {
        $project: {
          course: { courseCode: '$course.courseCode', title: '$course.title' },
          totalClasses: 1,
          present: 1,
          absent: 1,
          late: 1,
          excused: 1,
          attendancePercentage: {
            $multiply: [
              { $divide: ['$present', '$totalClasses'] },
              100
            ]
          }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete attendance record (Faculty can only delete records for their courses)
router.delete('/:id', auth, async (req, res) => {
  try {
    // First find the attendance record to check course access
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Check if faculty has access to delete attendance for this course
    if (req.user.role === 'faculty') {
      const courseAccess = await Course.findOne({ 
        _id: attendance.course, 
        instructor: req.user.userId 
      });
      
      if (!courseAccess) {
        return res.status(403).json({ 
          message: 'Access denied. You can only delete attendance records for courses you teach.' 
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only faculty and administrators can delete attendance records.' 
      });
    }

    await Attendance.findByIdAndDelete(req.params.id);
    console.log(`Attendance record deleted by ${req.user.role} ${req.user.userId}`);
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;