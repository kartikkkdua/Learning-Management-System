const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');

// Get all assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('course', 'courseCode title')
      .populate('instructor', 'profile.firstName profile.lastName')
      .populate('submissions.student', 'firstName lastName studentId')
      .sort({ dueDate: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get assignments by course
router.get('/course/:courseId', async (req, res) => {
  try {
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
    
    // Assignments fetched with submissions
    
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

// Create new assignment
router.post('/', async (req, res) => {
  try {
    const assignment = new Assignment(req.body);
    const savedAssignment = await assignment.save();
    const populatedAssignment = await Assignment.findById(savedAssignment._id)
      .populate('course', 'courseCode title')
      .populate('instructor', 'profile.firstName profile.lastName');
    res.status(201).json(populatedAssignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update assignment
router.put('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('course', 'courseCode title')
     .populate('instructor', 'profile.firstName profile.lastName');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
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

// Grade assignment submission
router.post('/:id/grade', async (req, res) => {
  try {
    const { studentId, grade, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submission = assignment.submissions.find(
      sub => sub.student.toString() === studentId
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    await assignment.save();

    const updatedAssignment = await Assignment.findById(req.params.id)
      .populate('submissions.student', 'firstName lastName studentId');
    
    res.json(updatedAssignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete assignment
router.delete('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;