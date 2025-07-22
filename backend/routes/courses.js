const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireAdminOrApprovedFaculty } = require('../middleware/facultyAuth');
const Course = require('../models/Course');

// Get all courses (filtered by user role)
router.get('/', auth, requireAdminOrApprovedFaculty, async (req, res) => {
  try {
    console.log('Fetching courses for user:', req.user);
    
    let query = {};
    
    // If user is faculty, only show courses they are assigned to teach
    if (req.user.role === 'faculty') {
      query.instructor = req.user.userId;
    }
    // Admin can see all courses
    // Students will see courses they're enrolled in (handled separately)
    
    const courses = await Course.find(query)
      .populate('faculty', 'name code')
      .populate('instructor', 'profile.firstName profile.lastName')
      .populate({
        path: 'enrolledStudents',
        select: 'firstName lastName studentId email user',
        populate: {
          path: 'user',
          select: 'username profile email'
        }
      })
      .sort({ courseCode: 1 });
    
    console.log(`Found ${courses.length} courses for ${req.user.role} user`);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get courses by faculty
router.get('/faculty/:facultyId', async (req, res) => {
  try {
    const courses = await Course.find({ faculty: req.params.facultyId })
      .populate('faculty', 'name code')
      .populate('instructor', 'profile.firstName profile.lastName')
      .populate('enrolledStudents', 'firstName lastName studentId')
      .sort({ courseCode: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get course by ID (with access control)
router.get('/:id', auth, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // If user is faculty, ensure they can only access courses they teach
    if (req.user.role === 'faculty') {
      query.instructor = req.user.userId;
    }
    
    const course = await Course.findOne(query)
      .populate('faculty', 'name code')
      .populate('instructor', 'profile.firstName profile.lastName')
      .populate({
        path: 'enrolledStudents',
        select: 'firstName lastName studentId email user',
        populate: {
          path: 'user',
          select: 'username profile email'
        }
      })
      .populate('prerequisites', 'courseCode title');
    
    if (!course) {
      return res.status(404).json({ 
        message: req.user.role === 'faculty' 
          ? 'Course not found or you do not have access to this course' 
          : 'Course not found' 
      });
    }
    
    console.log(`Course ${course.courseCode} accessed by ${req.user.role} user`);
    res.json(course);
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new course (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    // Only admin can create courses
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only administrators can create courses.' 
      });
    }

    const course = new Course(req.body);
    const savedCourse = await course.save();
    const populatedCourse = await Course.findById(savedCourse._id)
      .populate('faculty', 'name code')
      .populate('instructor', 'profile.firstName profile.lastName');
    
    console.log(`Course ${populatedCourse.courseCode} created by admin ${req.user.userId}`);
    res.status(201).json(populatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update course (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Only admin can update courses
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only administrators can update courses.' 
      });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('faculty', 'name code')
     .populate('instructor', 'profile.firstName profile.lastName');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    console.log(`Course ${course.courseCode} updated by admin ${req.user.userId}`);
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Assign course to faculty (Admin only)
router.post('/:id/assign-faculty', auth, async (req, res) => {
  try {
    // Only admin can assign courses to faculty
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only administrators can assign courses to faculty.' 
      });
    }

    const { instructorId } = req.body;
    
    if (!instructorId) {
      return res.status(400).json({ message: 'Instructor ID is required' });
    }

    // Verify the instructor exists and has faculty role
    const User = require('../models/User');
    const instructor = await User.findById(instructorId);
    
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    
    if (instructor.role !== 'faculty') {
      return res.status(400).json({ message: 'User must have faculty role to be assigned as instructor' });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { instructor: instructorId },
      { new: true, runValidators: true }
    ).populate('faculty', 'name code')
     .populate('instructor', 'profile.firstName profile.lastName');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    console.log(`Course ${course.courseCode} assigned to faculty ${instructor.username} by admin ${req.user.userId}`);
    res.json({
      message: 'Course assigned to faculty successfully',
      course
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove faculty assignment from course (Admin only)
router.post('/:id/unassign-faculty', auth, async (req, res) => {
  try {
    // Only admin can unassign courses from faculty
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only administrators can unassign courses from faculty.' 
      });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $unset: { instructor: 1 } },
      { new: true }
    ).populate('faculty', 'name code');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    console.log(`Faculty unassigned from course ${course.courseCode} by admin ${req.user.userId}`);
    res.json({
      message: 'Faculty unassigned from course successfully',
      course
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Enroll student in course
router.post('/:id/enroll', async (req, res) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled' });
    }

    if (course.enrolledStudents.length >= course.capacity) {
      return res.status(400).json({ message: 'Course is full' });
    }

    course.enrolledStudents.push(studentId);
    await course.save();

    const updatedCourse = await Course.findById(req.params.id)
      .populate('enrolledStudents', 'firstName lastName studentId');
    
    res.json(updatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove student from course
router.post('/:id/unenroll', async (req, res) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.enrolledStudents = course.enrolledStudents.filter(
      id => id.toString() !== studentId
    );
    await course.save();

    const updatedCourse = await Course.findById(req.params.id)
      .populate('enrolledStudents', 'firstName lastName studentId');
    
    res.json(updatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete course (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only admin can delete courses
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only administrators can delete courses.' 
      });
    }

    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    console.log(`Course ${course.courseCode} deleted by admin ${req.user.userId}`);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get faculty members available for course assignment (Admin only)
router.get('/admin/available-faculty', auth, async (req, res) => {
  try {
    // Only admin can view available faculty
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only administrators can view available faculty.' 
      });
    }

    const User = require('../models/User');
    const faculty = await User.find({ role: 'faculty', isActive: true })
      .select('username email profile')
      .sort({ 'profile.firstName': 1 });
    
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;