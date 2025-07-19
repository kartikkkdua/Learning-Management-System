const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const NotificationService = require('../services/notificationService');

// Get all enrollments with course and student details
router.get('/', async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ status: 'enrolled' })
      .populate({
        path: 'student',
        select: 'studentId firstName lastName email faculty',
        populate: {
          path: 'faculty',
          select: 'name code'
        }
      })
      .populate({
        path: 'course',
        select: 'courseCode title credits semester year faculty',
        populate: {
          path: 'faculty',
          select: 'name code'
        }
      })
      .sort({ enrolledAt: -1 });
    
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

// Get enrollments for a specific student (accepts both User ID and Student ID)
router.get('/student/:studentId', async (req, res) => {
  try {
    let student;
    let studentObjectId = req.params.studentId;
    
    // First try to find student by Student document ID
    student = await Student.findById(req.params.studentId).populate('faculty', 'name code');
    
    // If not found, try to find student by User ID
    if (!student) {
      student = await Student.findOne({ user: req.params.studentId }).populate('faculty', 'name code');
      if (student) {
        studentObjectId = student._id;
      }
    }
    
    // If still not found, try to find student by email (matching User email)
    if (!student) {
      const User = require('../models/User');
      const user = await User.findById(req.params.studentId);
      if (user && user.email) {
        student = await Student.findOne({ email: user.email }).populate('faculty', 'name code');
        if (student) {
          studentObjectId = student._id;
          // Link the user to student for future reference
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
    
    const courses = await Course.find({ enrolledStudents: studentObjectId })
      .populate('faculty', 'name code')
      .populate('instructor', 'profile.firstName profile.lastName')
      .sort({ courseCode: 1 });
    
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

// Enroll student in course (accepts both User ID and Student ID)
router.post('/enroll', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    
    if (!studentId || !courseId) {
      return res.status(400).json({ message: 'Student ID and Course ID are required' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Find student using the same logic as the GET endpoint
    let student;
    let studentObjectId = studentId;
    
    // First try to find student by Student document ID
    student = await Student.findById(studentId);
    
    // If not found, try to find student by User ID
    if (!student) {
      student = await Student.findOne({ user: studentId });
      if (student) {
        studentObjectId = student._id;
      }
    }
    
    // If still not found, try to find student by email (matching User email)
    if (!student) {
      const User = require('../models/User');
      const user = await User.findById(studentId);
      if (user && user.email) {
        student = await Student.findOne({ email: user.email });
        if (student) {
          studentObjectId = student._id;
          // Link the user to student for future reference
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
    
    // Check if student is already enrolled (check both Course and Enrollment models)
    const existingEnrollment = await Enrollment.findOne({
      student: studentObjectId,
      course: courseId,
      status: 'enrolled'
    });
    
    if (existingEnrollment || course.enrolledStudents.includes(studentObjectId)) {
      return res.status(400).json({ message: 'Student is already enrolled in this course' });
    }
    
    // Check prerequisites
    if (course.prerequisites && course.prerequisites.length > 0) {
      const completedCourses = await Enrollment.find({
        student: studentObjectId,
        status: { $in: ['completed'] },
        course: { $in: course.prerequisites }
      });
      
      if (completedCourses.length < course.prerequisites.length) {
        const missingPrereqs = await Course.find({
          _id: { $in: course.prerequisites },
          _id: { $nin: completedCourses.map(c => c.course) }
        }).select('courseCode title');
        
        return res.status(400).json({ 
          message: 'Prerequisites not met',
          missingPrerequisites: missingPrereqs.map(c => `${c.courseCode} - ${c.title}`)
        });
      }
    }
    
    // Check course capacity
    if (course.enrolledStudents.length >= course.capacity) {
      return res.status(400).json({ message: 'Course is at full capacity' });
    }
    
    // Create enrollment record
    const enrollment = new Enrollment({
      student: studentObjectId,
      course: courseId,
      semester: course.semester,
      year: course.year,
      status: 'enrolled'
    });
    await enrollment.save();
    
    // Add student to course
    course.enrolledStudents.push(studentObjectId);
    await course.save();
    
    // Create enrollment notification
    if (student.user) {
      await NotificationService.createEnrollmentNotification(student.user, course);
    }
    
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

// Remove student from course (accepts both User ID and Student ID)
router.post('/unenroll', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    
    if (!studentId || !courseId) {
      return res.status(400).json({ message: 'Student ID and Course ID are required' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Find student using the same logic as the enroll endpoint
    let student;
    let studentObjectId = studentId;
    
    // First try to find student by Student document ID
    student = await Student.findById(studentId);
    
    // If not found, try to find student by User ID
    if (!student) {
      student = await Student.findOne({ user: studentId });
      if (student) {
        studentObjectId = student._id;
      }
    }
    
    // If still not found, try to find student by email (matching User email)
    if (!student) {
      const User = require('../models/User');
      const user = await User.findById(studentId);
      if (user && user.email) {
        student = await Student.findOne({ email: user.email });
        if (student) {
          studentObjectId = student._id;
          // Link the user to student for future reference
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
    
    // Check if student is enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentObjectId,
      course: courseId,
      status: 'enrolled'
    });
    
    if (!existingEnrollment && !course.enrolledStudents.includes(studentObjectId)) {
      return res.status(400).json({ message: 'Student is not enrolled in this course' });
    }
    
    // Update enrollment record to 'dropped'
    if (existingEnrollment) {
      existingEnrollment.status = 'dropped';
      existingEnrollment.droppedAt = new Date();
      await existingEnrollment.save();
    }
    
    // Remove student from course
    course.enrolledStudents = course.enrolledStudents.filter(
      id => id.toString() !== studentObjectId.toString()
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

// Create student profile for a user (utility endpoint)
router.post('/create-student-profile', async (req, res) => {
  try {
    const { userId, studentId, firstName, lastName, email, facultyId } = req.body;
    
    if (!userId || !studentId || !firstName || !lastName || !email) {
      return res.status(400).json({ 
        message: 'User ID, Student ID, first name, last name, and email are required' 
      });
    }
    
    // Check if student already exists
    const existingStudent = await Student.findOne({ 
      $or: [{ user: userId }, { email: email }, { studentId: studentId }] 
    });
    
    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student profile already exists for this user or email' 
      });
    }
    
    // Get default faculty if not provided
    let faculty = facultyId;
    if (!faculty) {
      const Faculty = require('../models/Faculty');
      const defaultFaculty = await Faculty.findOne();
      if (defaultFaculty) {
        faculty = defaultFaculty._id;
      } else {
        return res.status(400).json({ 
          message: 'No faculty found. Please create a faculty first or provide facultyId.' 
        });
      }
    }
    
    const student = new Student({
      user: userId,
      studentId,
      firstName,
      lastName,
      email,
      faculty
    });
    
    await student.save();
    
    const populatedStudent = await Student.findById(student._id).populate('faculty', 'name code');
    
    res.status(201).json({
      message: 'Student profile created successfully',
      student: populatedStudent
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;