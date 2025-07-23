const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const FacultyMember = require('../models/FacultyMember');

// Get all faculty departments
router.get('/', async (req, res) => {
  try {
    const faculties = await Faculty.find().sort({ name: 1 });
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all approved faculty members (for course assignment, etc.)
router.get('/members', async (req, res) => {
  try {
    const facultyMembers = await FacultyMember.find({ status: 'approved' })
      .populate('user', 'username email profile')
      .populate('department', 'name code')
      .sort({ 'user.profile.firstName': 1 });
    res.json(facultyMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get faculty by ID
router.get('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new faculty
router.post('/', async (req, res) => {
  try {
    const faculty = new Faculty(req.body);
    const savedFaculty = await faculty.save();
    res.status(201).json(savedFaculty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update faculty
router.put('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json(faculty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete faculty
router.delete('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;