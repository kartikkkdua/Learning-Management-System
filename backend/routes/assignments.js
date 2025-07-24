const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireAdminOrApprovedFaculty } = require('../middleware/facultyAuth');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

// Get all assignments (filtered by user role)
router.get('/', auth, requireAdminOrApprovedFaculty, async (req, res) => {
  try {
    let query = {};
    
    // If user is faculty, only show assignments for courses they teach
    if (req.user.role === 'faculty') {
      // First find the faculty member record for this user
      const FacultyMember = require('../models/FacultyMember');
      const facultyMember = await FacultyMember.findOne({ user: req.user.userId });
      
      if (!facultyMember) {
        return res.status(404).json({ message: 'Faculty member record not found' });
      }
      
      query.instructor = facultyMember._id;
    }
    // Admin can see all assignments
    // Students will see assignments for courses they're enrolled in (handled separately)
    
    const assignments = await Assignment.find(query)
      .populate('course', 'courseCode title')
      .populate('instructor', 'profile.firstName profile.lastName')
      .populate('submissions.student', 'firstName lastName studentId')
      .sort({ dueDate: -1 });
    
    console.log(`Found ${assignments.length} assignments for ${req.user.role} user`);
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get assignments by course (with access control)
router.get('/course/:courseId', auth, requireAdminOrApprovedFaculty, async (req, res) => {
  try {
    // Check if faculty has access to this course
    if (req.user.role === 'faculty') {
      // First find the faculty member record for this user
      const FacultyMember = require('../models/FacultyMember');
      const facultyMember = await FacultyMember.findOne({ user: req.user.userId });
      
      if (!facultyMember) {
        return res.status(404).json({ message: 'Faculty member record not found' });
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
    
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('course', 'courseCode title')
      .populate('instructor', 'profile.firstName profile.lastName')
      .populate({
        path: 'submissions.student',
        select: 'firstName lastName studentId email user',
        populate: {
          path: 'user',
          select: 'username profile email'
        }
      })
      .sort({ dueDate: -1 });
    
    console.log(`Found ${assignments.length} assignments for course ${req.params.courseId}`);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments by course:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get assignment by ID
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'courseCode title')
      .populate('instructor', 'profile.firstName profile.lastName')
      .populate({
        path: 'submissions.student',
        select: 'firstName lastName studentId email user',
        populate: {
          path: 'user',
          select: 'username profile email'
        }
      });
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Assignment fetched with submissions
    
    res.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment by ID:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new assignment (Faculty can create for their courses, Admin can create for any course)
router.post('/', auth, async (req, res) => {
  try {
    const { course: courseId } = req.body;
    
    // Check if faculty has access to create assignments for this course
    if (req.user.role === 'faculty') {
      // First find the faculty member record for this user
      const FacultyMember = require('../models/FacultyMember');
      const facultyMember = await FacultyMember.findOne({ user: req.user.userId });
      
      if (!facultyMember) {
        return res.status(404).json({ message: 'Faculty member record not found' });
      }

      const course = await Course.findOne({ 
        _id: courseId, 
        instructor: facultyMember._id 
      });
      
      if (!course) {
        return res.status(403).json({ 
          message: 'Access denied. You can only create assignments for courses you teach.' 
        });
      }
      
      // Set the instructor to the faculty member ID
      req.body.instructor = facultyMember._id;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only faculty and administrators can create assignments.' 
      });
    }
    
    const assignment = new Assignment(req.body);
    const savedAssignment = await assignment.save();
    const populatedAssignment = await Assignment.findById(savedAssignment._id)
      .populate('course', 'courseCode title')
      .populate('instructor', 'profile.firstName profile.lastName');
    
    console.log(`Assignment "${populatedAssignment.title}" created by ${req.user.role} ${req.user.userId}`);
    res.status(201).json(populatedAssignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update assignment (Faculty can update their assignments, Admin can update any)
router.put('/:id', auth, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // If user is faculty, ensure they can only update assignments they created
    if (req.user.role === 'faculty') {
      // First find the faculty member record for this user
      const FacultyMember = require('../models/FacultyMember');
      const facultyMember = await FacultyMember.findOne({ user: req.user.userId });
      
      if (!facultyMember) {
        return res.status(404).json({ message: 'Faculty member record not found' });
      }
      
      query.instructor = facultyMember._id;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only faculty and administrators can update assignments.' 
      });
    }
    
    const assignment = await Assignment.findOneAndUpdate(
      query,
      req.body,
      { new: true, runValidators: true }
    ).populate('course', 'courseCode title')
     .populate('instructor', 'profile.firstName profile.lastName');
    
    if (!assignment) {
      return res.status(404).json({ 
        message: req.user.role === 'faculty' 
          ? 'Assignment not found or you do not have permission to update it' 
          : 'Assignment not found' 
      });
    }
    
    console.log(`Assignment "${assignment.title}" updated by ${req.user.role} ${req.user.userId}`);
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Submit assignment
router.post('/:id/submit', async (req, res) => {
  try {
    const { studentId, files } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Find the actual student document ID
    const Student = require('../models/Student');
    let actualStudentId = studentId;
    
    // If studentId looks like a User ID, find the corresponding Student
    const student = await Student.findById(studentId).catch(() => null);
    if (!student) {
      // Try to find student by user ID
      const studentByUser = await Student.findOne({ user: studentId });
      if (studentByUser) {
        actualStudentId = studentByUser._id;
      } else {
        // Try to find student by email matching user email
        const User = require('../models/User');
        const user = await User.findById(studentId);
        if (user) {
          const studentByEmail = await Student.findOne({ email: user.email });
          if (studentByEmail) {
            actualStudentId = studentByEmail._id;
          }
        }
      }
    }

    console.log('Submission attempt:', {
      originalStudentId: studentId,
      actualStudentId: actualStudentId,
      assignmentId: req.params.id
    });

    // Check if student already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.student.toString() === actualStudentId.toString()
    );

    const isLate = new Date() > assignment.dueDate;

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.submittedAt = new Date();
      existingSubmission.files = files;
      existingSubmission.isLate = isLate;
      console.log('Updated existing submission');
    } else {
      // Create new submission
      assignment.submissions.push({
        student: actualStudentId,
        submittedAt: new Date(),
        files: files,
        isLate: isLate
      });
      console.log('Created new submission');
    }

    await assignment.save();
    
    const updatedAssignment = await Assignment.findById(req.params.id)
      .populate({
        path: 'submissions.student',
        select: 'firstName lastName studentId email user',
        populate: {
          path: 'user',
          select: 'username profile email'
        }
      });
    
    console.log('Assignment after submission:', {
      title: updatedAssignment.title,
      totalSubmissions: updatedAssignment.submissions.length
    });
    
    res.json(updatedAssignment);
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(400).json({ message: error.message });
  }
});

// Grade assignment submission (Faculty can grade their assignments, Admin can grade any)
router.post('/:id/grade', auth, async (req, res) => {
  try {
    const { studentId, grade, feedback } = req.body;
    
    let query = { _id: req.params.id };
    
    // If user is faculty, ensure they can only grade assignments they created
    if (req.user.role === 'faculty') {
      query.instructor = req.user.userId;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only faculty and administrators can grade assignments.' 
      });
    }
    
    const assignment = await Assignment.findOne(query);
    
    if (!assignment) {
      return res.status(404).json({ 
        message: req.user.role === 'faculty' 
          ? 'Assignment not found or you do not have permission to grade it' 
          : 'Assignment not found' 
      });
    }

    const submission = assignment.submissions.find(
      sub => sub.student.toString() === studentId
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedAt = new Date();
    await assignment.save();

    const updatedAssignment = await Assignment.findById(req.params.id)
      .populate('submissions.student', 'firstName lastName studentId');
    
    console.log(`Assignment submission graded by ${req.user.role} ${req.user.userId}`);
    res.json(updatedAssignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete assignment (Faculty can delete their assignments, Admin can delete any)
router.delete('/:id', auth, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // If user is faculty, ensure they can only delete assignments they created
    if (req.user.role === 'faculty') {
      query.instructor = req.user.userId;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only faculty and administrators can delete assignments.' 
      });
    }
    
    const assignment = await Assignment.findOneAndDelete(query);
    if (!assignment) {
      return res.status(404).json({ 
        message: req.user.role === 'faculty' 
          ? 'Assignment not found or you do not have permission to delete it' 
          : 'Assignment not found' 
      });
    }
    
    console.log(`Assignment "${assignment.title}" deleted by ${req.user.role} ${req.user.userId}`);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;