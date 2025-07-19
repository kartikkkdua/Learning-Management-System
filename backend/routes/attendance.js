const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// Get attendance records
router.get('/', async (req, res) => {
  try {
    const { course, date, student } = req.query;
    let filter = {};

    if (course) filter.course = course;
    if (date) filter.date = new Date(date);
    if (student) filter['records.student'] = student;

    const attendance = await Attendance.find(filter)
      .populate('course', 'courseCode title')
      .populate('records.student', 'firstName lastName studentId')
      .populate('markedBy', 'profile.firstName profile.lastName')
      .sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance by course and date range
router.get('/course/:courseId', async (req, res) => {
  try {
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
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark attendance for a class
router.post('/', async (req, res) => {
  try {
    const { course, date, records, markedBy } = req.body;

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
      
      res.status(201).json(populatedAttendance);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get attendance statistics for a student
router.get('/student/:studentId/stats', async (req, res) => {
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

// Delete attendance record
router.delete('/:id', async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;