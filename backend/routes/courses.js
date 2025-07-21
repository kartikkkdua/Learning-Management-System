const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');

// Get all courses
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching courses for user:', req.user);
    const courses = await Course.find()
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
    // Courses fetched successfully
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

// Get course by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
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
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Course fetched with enrolled students
    
    res.json(course);
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new course
router.post('/', async (req, res) => {
  try {
    const course = new Course(req.body);
    const savedCourse = await course.save();
    const populatedCourse = await Course.findById(savedCourse._id)
      .populate('faculty', 'name code')
      .populate('instructor', 'profile.firstName profile.lastName');
    res.status(201).json(populatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update course
router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('faculty', 'name code')
     .populate('instructor', 'profile.firstName profile.lastName');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
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

// Delete course
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;