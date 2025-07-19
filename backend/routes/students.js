const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Get all students with faculty info
router.get('/', async (req, res) => {
  try {
    const students = await Student.find()
      .populate('faculty', 'name code')
      .sort({ lastName: 1, firstName: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get students by faculty
router.get('/faculty/:facultyId', async (req, res) => {
  try {
    const students = await Student.find({ faculty: req.params.facultyId })
      .populate('faculty', 'name code')
      .sort({ lastName: 1, firstName: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('faculty');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's enrolled courses
router.get('/:id/courses', async (req, res) => {
  try {
    const Course = require('../models/Course');
    const courses = await Course.find({ enrolledStudents: req.params.id })
      .populate('faculty', 'name code')
      .populate('instructor', 'profile.firstName profile.lastName')
      .sort({ courseCode: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's assignments
router.get('/:id/assignments', async (req, res) => {
  try {
    const Course = require('../models/Course');
    const Assignment = require('../models/Assignment');
    
    // First get student's enrolled courses
    const courses = await Course.find({ enrolledStudents: req.params.id });
    const courseIds = courses.map(course => course._id);
    
    // Then get assignments for those courses
    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'courseCode title')
      .populate('instructor', 'profile.firstName profile.lastName')
      .sort({ dueDate: -1 });
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's grades
router.get('/:id/grades', async (req, res) => {
  try {
    const Course = require('../models/Course');
    const Assignment = require('../models/Assignment');
    
    // Get student's enrolled courses
    const courses = await Course.find({ enrolledStudents: req.params.id })
      .populate('faculty', 'name code');
    
    const grades = [];
    
    for (const course of courses) {
      // Get assignments for this course
      const assignments = await Assignment.find({ course: course._id })
        .populate('course', 'courseCode title');
      
      const courseGrades = {
        course: course,
        assignments: [],
        totalPoints: 0,
        earnedPoints: 0,
        percentage: 0,
        letterGrade: 'N/A'
      };
      
      for (const assignment of assignments) {
        const submission = assignment.submissions?.find(
          sub => sub.student.toString() === req.params.id
        );
        
        if (submission && submission.grade !== undefined) {
          courseGrades.assignments.push({
            title: assignment.title,
            type: assignment.type,
            maxPoints: assignment.maxPoints,
            earnedPoints: submission.grade,
            percentage: (submission.grade / assignment.maxPoints) * 100,
            submittedAt: submission.submittedAt,
            feedback: submission.feedback
          });
          
          courseGrades.totalPoints += assignment.maxPoints;
          courseGrades.earnedPoints += submission.grade;
        }
      }
      
      if (courseGrades.totalPoints > 0) {
        courseGrades.percentage = (courseGrades.earnedPoints / courseGrades.totalPoints) * 100;
        courseGrades.letterGrade = getLetterGrade(courseGrades.percentage);
      }
      
      grades.push(courseGrades);
    }
    
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's attendance
router.get('/:id/attendance', async (req, res) => {
  try {
    const Attendance = require('../models/Attendance');
    const Course = require('../models/Course');
    
    // Get student's enrolled courses
    const courses = await Course.find({ enrolledStudents: req.params.id });
    const courseIds = courses.map(course => course._id);
    
    // Get attendance records for those courses
    const attendanceRecords = await Attendance.find({ 
      course: { $in: courseIds },
      'records.student': req.params.id
    })
    .populate('course', 'courseCode title')
    .sort({ date: -1 });
    
    const attendanceData = [];
    
    for (const course of courses) {
      const courseAttendance = attendanceRecords.filter(
        record => record.course._id.toString() === course._id.toString()
      );
      
      let present = 0, absent = 0, late = 0, excused = 0;
      const recentRecords = [];
      
      courseAttendance.forEach(record => {
        const studentRecord = record.records.find(
          r => r.student.toString() === req.params.id
        );
        
        if (studentRecord) {
          switch (studentRecord.status) {
            case 'present': present++; break;
            case 'absent': absent++; break;
            case 'late': late++; break;
            case 'excused': excused++; break;
          }
          
          recentRecords.push({
            date: record.date,
            status: studentRecord.status,
            notes: studentRecord.notes
          });
        }
      });
      
      const totalClasses = present + absent + late + excused;
      const attendancePercentage = totalClasses > 0 ? ((present + late + excused) / totalClasses) * 100 : 0;
      
      attendanceData.push({
        course: course,
        totalClasses,
        present,
        absent,
        late,
        excused,
        percentage: attendancePercentage,
        recentRecords: recentRecords.slice(0, 10) // Last 10 records
      });
    }
    
    res.json(attendanceData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new student
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    const savedStudent = await student.save();
    const populatedStudent = await Student.findById(savedStudent._id).populate('faculty');
    res.status(201).json(populatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('faculty');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to calculate letter grade
function getLetterGrade(percentage) {
  if (percentage >= 90) return 'A';
  if (percentage >= 85) return 'A-';
  if (percentage >= 80) return 'B+';
  if (percentage >= 75) return 'B';
  if (percentage >= 70) return 'B-';
  if (percentage >= 65) return 'C+';
  if (percentage >= 60) return 'C';
  if (percentage >= 55) return 'C-';
  if (percentage >= 50) return 'D';
  return 'F';
}

module.exports = router;