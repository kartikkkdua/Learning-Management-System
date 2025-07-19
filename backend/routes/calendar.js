const express = require('express');
const router = express.Router();
const AcademicCalendar = require('../models/AcademicCalendar');

// Get current academic calendar
router.get('/current', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Determine current academic year (typically starts in August/September)
    let academicYear;
    if (currentMonth >= 7) { // August onwards
      academicYear = `${currentYear}-${currentYear + 1}`;
    } else {
      academicYear = `${currentYear - 1}-${currentYear}`;
    }
    
    const calendar = await AcademicCalendar.findOne({ 
      academicYear,
      isActive: true 
    });
    
    if (!calendar) {
      return res.status(404).json({ message: 'No active academic calendar found' });
    }
    
    res.json(calendar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get upcoming events
router.get('/upcoming-events', async (req, res) => {
  try {
    const { days = 30, audience = 'all' } = req.query;
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + parseInt(days));
    
    const calendars = await AcademicCalendar.find({ isActive: true });
    
    let upcomingEvents = [];
    calendars.forEach(calendar => {
      const events = calendar.events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= now && 
               eventDate <= futureDate && 
               (event.targetAudience === 'all' || event.targetAudience === audience);
      });
      upcomingEvents = upcomingEvents.concat(events.map(event => ({
        ...event.toObject(),
        academicYear: calendar.academicYear,
        semester: calendar.semester
      })));
    });
    
    // Sort by date
    upcomingEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    res.json(upcomingEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get registration periods
router.get('/registration-periods', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Determine current academic year
    let academicYear;
    if (currentMonth >= 7) {
      academicYear = `${currentYear}-${currentYear + 1}`;
    } else {
      academicYear = `${currentYear - 1}-${currentYear}`;
    }
    
    const calendar = await AcademicCalendar.findOne({ 
      academicYear,
      isActive: true 
    });
    
    if (!calendar) {
      return res.status(404).json({ message: 'No active academic calendar found' });
    }
    
    const now = new Date();
    const registrationPeriods = calendar.registrationPeriods;
    
    // Determine current registration status
    let currentPeriod = null;
    let nextPeriod = null;
    
    if (registrationPeriods.earlyRegistration?.startDate && registrationPeriods.earlyRegistration?.endDate) {
      const earlyStart = new Date(registrationPeriods.earlyRegistration.startDate);
      const earlyEnd = new Date(registrationPeriods.earlyRegistration.endDate);
      
      if (now >= earlyStart && now <= earlyEnd) {
        currentPeriod = { type: 'early', ...registrationPeriods.earlyRegistration };
      } else if (now < earlyStart) {
        nextPeriod = { type: 'early', ...registrationPeriods.earlyRegistration };
      }
    }
    
    if (registrationPeriods.regularRegistration?.startDate && registrationPeriods.regularRegistration?.endDate) {
      const regularStart = new Date(registrationPeriods.regularRegistration.startDate);
      const regularEnd = new Date(registrationPeriods.regularRegistration.endDate);
      
      if (now >= regularStart && now <= regularEnd) {
        currentPeriod = { type: 'regular', ...registrationPeriods.regularRegistration };
      } else if (now < regularStart && !nextPeriod) {
        nextPeriod = { type: 'regular', ...registrationPeriods.regularRegistration };
      }
    }
    
    if (registrationPeriods.lateRegistration?.startDate && registrationPeriods.lateRegistration?.endDate) {
      const lateStart = new Date(registrationPeriods.lateRegistration.startDate);
      const lateEnd = new Date(registrationPeriods.lateRegistration.endDate);
      
      if (now >= lateStart && now <= lateEnd) {
        currentPeriod = { type: 'late', ...registrationPeriods.lateRegistration };
      } else if (now < lateStart && !nextPeriod) {
        nextPeriod = { type: 'late', ...registrationPeriods.lateRegistration };
      }
    }
    
    res.json({
      academicYear: calendar.academicYear,
      semester: calendar.semester,
      currentPeriod,
      nextPeriod,
      allPeriods: registrationPeriods
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create academic calendar (admin only)
router.post('/', async (req, res) => {
  try {
    const calendar = new AcademicCalendar(req.body);
    await calendar.save();
    res.status(201).json(calendar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update academic calendar (admin only)
router.put('/:id', async (req, res) => {
  try {
    const calendar = await AcademicCalendar.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!calendar) {
      return res.status(404).json({ message: 'Academic calendar not found' });
    }
    
    res.json(calendar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all academic calendars
router.get('/', async (req, res) => {
  try {
    const calendars = await AcademicCalendar.find().sort({ academicYear: -1 });
    res.json(calendars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;