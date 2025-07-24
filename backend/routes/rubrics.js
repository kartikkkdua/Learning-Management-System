const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const GradingRubric = require('../models/GradingRubric');

// Get all rubrics for a course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Check if faculty has access to this course
    if (req.user.role === 'faculty') {
      const FacultyMember = require('../models/FacultyMember');
      const facultyMember = await FacultyMember.findOne({ user: req.user.userId });
      
      if (!facultyMember) {
        return res.status(404).json({ message: 'Faculty member record not found' });
      }

      const Course = require('../models/Course');
      const course = await Course.findOne({ 
        _id: courseId, 
        instructor: facultyMember._id 
      });
      
      if (!course) {
        return res.status(403).json({ 
          message: 'Access denied. You can only view rubrics for courses you teach.' 
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only faculty and administrators can view rubrics.' 
      });
    }
    
    const rubrics = await GradingRubric.find({ course: courseId, isActive: true })
      .populate('createdBy', 'username profile')
      .sort({ createdAt: -1 });

    res.json(rubrics);
  } catch (error) {
    console.error('Error fetching rubrics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific rubric
router.get('/:id', auth, async (req, res) => {
  try {
    const rubric = await GradingRubric.findById(req.params.id)
      .populate('createdBy', 'username profile');

    if (!rubric) {
      return res.status(404).json({ message: 'Rubric not found' });
    }

    res.json(rubric);
  } catch (error) {
    console.error('Error fetching rubric:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new rubric
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      course,
      criteria,
      totalPoints,
      passingGrade
    } = req.body;

    const rubric = new GradingRubric({
      name,
      description,
      course,
      createdBy: req.user.userId,
      criteria,
      totalPoints,
      passingGrade
    });

    await rubric.save();
    await rubric.populate('createdBy', 'username profile');

    res.status(201).json(rubric);
  } catch (error) {
    console.error('Error creating rubric:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a rubric
router.put('/:id', auth, async (req, res) => {
  try {
    const rubric = await GradingRubric.findById(req.params.id);

    if (!rubric) {
      return res.status(404).json({ message: 'Rubric not found' });
    }

    // Check if user owns the rubric or is admin
    if (rubric.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedRubric = await GradingRubric.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username profile');

    res.json(updatedRubric);
  } catch (error) {
    console.error('Error updating rubric:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a rubric
router.delete('/:id', auth, async (req, res) => {
  try {
    const rubric = await GradingRubric.findById(req.params.id);

    if (!rubric) {
      return res.status(404).json({ message: 'Rubric not found' });
    }

    // Check if user owns the rubric or is admin
    if (rubric.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Soft delete by setting isActive to false
    await GradingRubric.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ message: 'Rubric deleted successfully' });
  } catch (error) {
    console.error('Error deleting rubric:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Duplicate a rubric
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalRubric = await GradingRubric.findById(req.params.id);

    if (!originalRubric) {
      return res.status(404).json({ message: 'Rubric not found' });
    }

    const duplicatedRubric = new GradingRubric({
      name: `${originalRubric.name} (Copy)`,
      description: originalRubric.description,
      course: originalRubric.course,
      createdBy: req.user.userId,
      criteria: originalRubric.criteria,
      totalPoints: originalRubric.totalPoints,
      passingGrade: originalRubric.passingGrade
    });

    await duplicatedRubric.save();
    await duplicatedRubric.populate('createdBy', 'username profile');

    res.status(201).json(duplicatedRubric);
  } catch (error) {
    console.error('Error duplicating rubric:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;