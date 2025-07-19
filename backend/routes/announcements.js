const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const { audience, faculty, course } = req.query;
    let filter = { isPublished: true };

    if (audience) filter.targetAudience = audience;
    if (faculty) filter.faculty = faculty;
    if (course) filter.course = course;

    const announcements = await Announcement.find(filter)
      .populate('author', 'profile.firstName profile.lastName')
      .populate('course', 'courseCode title')
      .populate('faculty', 'name code')
      .sort({ publishDate: -1 });
    
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get announcement by ID
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'profile.firstName profile.lastName')
      .populate('course', 'courseCode title')
      .populate('faculty', 'name code');
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new announcement
router.post('/', async (req, res) => {
  try {
    const announcement = new Announcement(req.body);
    const savedAnnouncement = await announcement.save();
    const populatedAnnouncement = await Announcement.findById(savedAnnouncement._id)
      .populate('author', 'profile.firstName profile.lastName')
      .populate('course', 'courseCode title')
      .populate('faculty', 'name code');
    res.status(201).json(populatedAnnouncement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update announcement
router.put('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'profile.firstName profile.lastName')
     .populate('course', 'courseCode title')
     .populate('faculty', 'name code');
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete announcement
router.delete('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;