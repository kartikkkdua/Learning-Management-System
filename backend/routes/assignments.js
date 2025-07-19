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
      .populate('submissions.student', 'firstName lastName studentId')
      .sort({ dueDate: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get assignment by ID
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'courseCode title')
      .populate('instructor', 'profile.firstName profile.lastName')
      .populate('submissions.student', 'firstName lastName studentId email');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
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

    // Check if student already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.student.toString() === studentId
    );

    const isLate = new Date() > assignment.dueDate;

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.submittedAt = new Date();
      existingSubmission.files = files;
      existingSubmission.isLate = isLate;
    } else {
      // Create new submission
      assignment.submissions.push({
        student: studentId,
        submittedAt: new Date(),
        files: files,
        isLate: isLate
      });
    }

    await assignment.save();
    
    const updatedAssignment = await Assignment.findById(req.params.id)
      .populate('submissions.student', 'firstName lastName studentId');
    
    res.json(updatedAssignment);
  } catch (error) {
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