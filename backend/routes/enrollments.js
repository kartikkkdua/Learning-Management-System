const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Student = require('../models/Student');

// Get all enrollments with course and student details
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('faculty', 'name code')
      .populate('enrolledStudents', 'firstName lastName studentId email faculty')
      .populate({
        path: 'enrolledStudents',
        populate: {
          path: 'faculty',
          select: 'name code'
        }
      })
      .sort({ courseCode: 1 });
    
    // Transform data for easier frontend consumption
    const enrollments = [];
    courses.forEach(course => {
      course.enrolledStudents.forEach(student => {
        enrollments.push({
          _id: `${course._id}_${student._id}`,
          course: {
            _id: course._id,
            courseCode: course.courseCode,
            title: course.title,
            credits: course.credits,
            semester: course.semester,
            year: course.year,
            faculty: course.faculty
          },
          student: {
            _id: student._id,
            studentId: student.studentId,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            faculty: student.faculty
          },
          enrolledAt: student.enrollmentDate || new Date()
        });
      });
    });
    
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get enrollments for a specific course
router.get('/course/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('enrolledStudents', 'firstName lastName studentId email faculty')
      .populate({
        path: 'enrolledStudents',
        populate: {
          path: 'faculty',
          select: 'name code'
        }
      });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json({
      course: {
        _id: course._id,
        courseCode: course.courseCode,
        title: course.title,
        credits: course.credits,
        capacity: course.capacity
      },
      enrolledStudents: course.enrolledStudents,
      availableSpots: course.capacity - course.enrolledStudents.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get enrollments for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const courses = await Course.find({ enrolledStudents: req.params.studentId })
      .populate('faculty', 'name code')
      .populate('instructor', 'profile.firstName profile.lastName')
      .sort({ courseCode: 1 });
    
    const student = await Student.findById(req.params.studentId)
      .populate('faculty', 'name code');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({
      student: {
        _id: student._id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        faculty: student.faculty
      },
      enrolledCourses: courses,
      totalCredits: courses.reduce((sum, course) => sum + course.credits, 0)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enroll student in course
router.post('/enroll', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    
    if (!studentId || !courseId) {
      return res.status(400).json({ message: 'Student ID and Course ID are required' });
    }
    
    const course = await Course.findById(courseId);
    const student = await Student.findById(studentId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if student is already enrolled
    if (course.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ message: 'Student is already enrolled in this course' });
    }
    
    // Check course capacity
    if (course.enrolledStudents.length >= course.capacity) {
      return res.status(400).json({ message: 'Course is at full capacity' });
    }
    
    // Add student to course
    course.enrolledStudents.push(studentId);
    await course.save();
    
    // Return updated course with populated students
    const updatedCourse = await Course.findById(courseId)
      .populate('enrolledStudents', 'firstName lastName studentId email')
      .populate('faculty', 'name code');
    
    res.status(201).json({
      message: 'Student enrolled successfully',
      course: updatedCourse,
      enrollment: {
        student: {
          _id: student._id,
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email
        },
        course: {
          _id: course._id,
          courseCode: course.courseCode,
          title: course.title
        },
        enrolledAt: new Date()
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk enroll multiple students in a course
router.post('/bulk-enroll', async (req, res) => {
  try {
    const { studentIds, courseId } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds) || !courseId) {
      return res.status(400).json({ message: 'Student IDs array and Course ID are required' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const results = {
      successful: [],
      failed: [],
      alreadyEnrolled: []
    };
    
    for (const studentId of studentIds) {
      try {
        const student = await Student.findById(studentId);
        if (!student) {
          results.failed.push({ studentId, reason: 'Student not found' });
          continue;
        }
        
        if (course.enrolledStudents.includes(studentId)) {
          results.alreadyEnrolled.push({ 
            studentId, 
            studentName: `${student.firstName} ${student.lastName}` 
          });
          continue;
        }
        
        if (course.enrolledStudents.length >= course.capacity) {
          results.failed.push({ 
            studentId, 
            studentName: `${student.firstName} ${student.lastName}`,
            reason: 'Course at full capacity' 
          });
          continue;
        }
        
        course.enrolledStudents.push(studentId);
        results.successful.push({ 
          studentId, 
          studentName: `${student.firstName} ${student.lastName}` 
        });
      } catch (error) {
        results.failed.push({ studentId, reason: error.message });
      }
    }
    
    await course.save();
    
    res.json({
      message: 'Bulk enrollment completed',
      results,
      summary: {
        total: studentIds.length,
        successful: results.successful.length,
        failed: results.failed.length,
        alreadyEnrolled: results.alreadyEnrolled.length
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove student from course
router.post('/unenroll', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    
    if (!studentId || !courseId) {
      return res.status(400).json({ message: 'Student ID and Course ID are required' });
    }
    
    const course = await Course.findById(courseId);
    const student = await Student.findById(studentId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if student is enrolled
    if (!course.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ message: 'Student is not enrolled in this course' });
    }
    
    // Remove student from course
    course.enrolledStudents = course.enrolledStudents.filter(
      id => id.toString() !== studentId.toString()
    );
    await course.save();
    
    res.json({
      message: 'Student unenrolled successfully',
      course: {
        _id: course._id,
        courseCode: course.courseCode,
        title: course.title,
        enrolledCount: course.enrolledStudents.length
      },
      student: {
        _id: student._id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get available students for enrollment (not enrolled in specific course)
router.get('/available-students/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Get all students not enrolled in this course
    const availableStudents = await Student.find({
      _id: { $nin: course.enrolledStudents }
    })
    .populate('faculty', 'name code')
    .sort({ lastName: 1, firstName: 1 });
    
    res.json(availableStudents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get enrollment statistics
router.get('/stats', async (req, res) => {
  try {
    const courses = await Course.find().populate('faculty', 'name code');
    const students = await Student.find();
    
    const stats = {
      totalCourses: courses.length,
      totalStudents: students.length,
      totalEnrollments: 0,
      averageEnrollmentPerCourse: 0,
      coursesAtCapacity: 0,
      coursesWithLowEnrollment: 0,
      enrollmentByFaculty: {}
    };
    
    courses.forEach(course => {
      const enrollmentCount = course.enrolledStudents.length;
      stats.totalEnrollments += enrollmentCount;
      
      if (enrollmentCount >= course.capacity) {
        stats.coursesAtCapacity++;
      }
      
      if (enrollmentCount < course.capacity * 0.3) { // Less than 30% capacity
        stats.coursesWithLowEnrollment++;
      }
      
      const facultyName = course.faculty?.name || 'Unknown';
      if (!stats.enrollmentByFaculty[facultyName]) {
        stats.enrollmentByFaculty[facultyName] = {
          courses: 0,
          totalEnrollments: 0,
          averageEnrollment: 0
        };
      }
      
      stats.enrollmentByFaculty[facultyName].courses++;
      stats.enrollmentByFaculty[facultyName].totalEnrollments += enrollmentCount;
      stats.enrollmentByFaculty[facultyName].averageEnrollment = 
        stats.enrollmentByFaculty[facultyName].totalEnrollments / 
        stats.enrollmentByFaculty[facultyName].courses;
    });
    
    stats.averageEnrollmentPerCourse = courses.length > 0 ? 
      stats.totalEnrollments / courses.length : 0;
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;