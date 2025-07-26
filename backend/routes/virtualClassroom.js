const express = require('express');
const router = express.Router();
const VirtualClassroom = require('../models/VirtualClassroom');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const User = require('../models/User');
const zoomService = require('../services/zoomService');
const googleMeetService = require('../services/googleMeetService');
const auth = require('../middleware/auth');
const { requireFaculty } = require('../middleware/facultyAuth');

// Get all virtual classrooms for a course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status, upcoming, past } = req.query;

    let query = { courseId };
    
    if (status) {
      query.status = status;
    }
    
    if (upcoming === 'true') {
      query.scheduledTime = { $gte: new Date() };
    }
    
    if (past === 'true') {
      query.scheduledTime = { $lt: new Date() };
    }

    const classrooms = await VirtualClassroom.find(query)
      .populate('courseId', 'name code')
      .populate('facultyId', 'name email')
      .sort({ scheduledTime: -1 });

    res.json({
      success: true,
      classrooms
    });
  } catch (error) {
    console.error('Get classrooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch virtual classrooms'
    });
  }
});

// Get virtual classrooms for faculty
router.get('/faculty/my-classes', auth, requireFaculty, async (req, res) => {
  try {
    const facultyId = req.facultyMember._id;
    const { status, date } = req.query;

    let query = { facultyId };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      query.scheduledTime = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const classrooms = await VirtualClassroom.find(query)
      .populate('courseId', 'name code')
      .sort({ scheduledTime: -1 });

    res.json({
      success: true,
      classrooms
    });
  } catch (error) {
    console.error('Get faculty classrooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your virtual classrooms'
    });
  }
});

// Create a new virtual classroom
router.post('/create', auth, requireFaculty, async (req, res) => {
  try {
    const {
      courseId,
      title,
      description,
      scheduledTime,
      duration,
      platform,
      password,
      recordingEnabled,
      settings,
      isRecurring,
      recurrencePattern
    } = req.body;

    const facultyId = req.facultyMember._id;

    // Verify course exists and faculty has access
    const course = await Course.findById(courseId);
    if (!course) {
      console.log('Course not found with ID:', courseId);
      return res.status(404).json({
        success: false,
        message: 'Course not found. Please select a valid course.'
      });
    }

    console.log('Found course:', course.title || course.name, '(', course.courseCode || course.code, ')');

    // Create meeting based on platform
    const meetingData = {
      title,
      description,
      scheduledTime,
      duration: duration || 60,
      password,
      recordingEnabled,
      settings,
      isRecurring,
      recurrencePattern
    };

    let meetingResult;
    
    if (platform === 'meet' || platform === 'google-meet') {
      // Use instant meeting for Google Meet (simpler approach)
      meetingResult = await googleMeetService.createInstantMeeting(meetingData);
    } else {
      // Default to Zoom
      meetingResult = await zoomService.createMeeting(meetingData);
    }
    
    if (!meetingResult.success) {
      return res.status(400).json({
        success: false,
        message: meetingResult.error
      });
    }

    // Create virtual classroom record
    const classroom = new VirtualClassroom({
      courseId,
      facultyId,
      title,
      description,
      scheduledTime: new Date(scheduledTime),
      duration: duration || 60,
      platform: platform || 'zoom',
      meetingId: meetingResult.meetingId,
      meetingPassword: meetingResult.password || password,
      joinUrl: meetingResult.joinUrl || meetingResult.meetLink,
      hostUrl: meetingResult.hostUrl || meetingResult.meetLink,
      recordingEnabled: recordingEnabled || false,
      settings: settings || {},
      isRecurring: isRecurring || false,
      recurrencePattern: isRecurring ? recurrencePattern : undefined
    });

    await classroom.save();

    // Populate the response
    await classroom.populate('courseId', 'name code');
    await classroom.populate('facultyId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Virtual classroom created successfully',
      classroom
    });
  } catch (error) {
    console.error('Create classroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create virtual classroom'
    });
  }
});

// Update virtual classroom
router.put('/:id', auth, requireFaculty, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      scheduledTime,
      duration,
      recordingEnabled,
      settings
    } = req.body;

    const classroom = await VirtualClassroom.findById(id);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Virtual classroom not found'
      });
    }

    // Verify faculty ownership
    if (classroom.facultyId.toString() !== req.facultyMember._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this classroom'
      });
    }

    // Update meeting based on platform
    const updateData = {
      title,
      description,
      scheduledTime,
      duration,
      recordingEnabled,
      settings
    };

    let updateResult = { success: true }; // Google Meet doesn't need updates for instant meetings
    
    if (classroom.platform === 'zoom') {
      updateResult = await zoomService.updateMeeting(classroom.meetingId, updateData);
    }
    // For Google Meet instant meetings, we just update the database record
    
    if (!updateResult.success) {
      return res.status(400).json({
        success: false,
        message: updateResult.error
      });
    }

    // Update database record
    Object.assign(classroom, {
      title,
      description,
      scheduledTime: new Date(scheduledTime),
      duration,
      recordingEnabled,
      settings: { ...classroom.settings, ...settings }
    });

    await classroom.save();

    await classroom.populate('courseId', 'name code');
    await classroom.populate('facultyId', 'name email');

    res.json({
      success: true,
      message: 'Virtual classroom updated successfully',
      classroom
    });
  } catch (error) {
    console.error('Update classroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update virtual classroom'
    });
  }
});

// Delete virtual classroom
router.delete('/:id', auth, requireFaculty, async (req, res) => {
  try {
    const { id } = req.params;

    const classroom = await VirtualClassroom.findById(id);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Virtual classroom not found'
      });
    }

    // Verify faculty ownership
    if (classroom.facultyId.toString() !== req.facultyMember._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this classroom'
      });
    }

    // Delete meeting based on platform
    if (classroom.platform === 'zoom') {
      const zoomResult = await zoomService.deleteMeeting(classroom.meetingId);
      
      if (!zoomResult.success) {
        console.warn('Failed to delete Zoom meeting:', zoomResult.error);
        // Continue with database deletion even if Zoom deletion fails
      }
    }
    // For Google Meet instant meetings, no API deletion needed

    // Delete from database
    await VirtualClassroom.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Virtual classroom deleted successfully'
    });
  } catch (error) {
    console.error('Delete classroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete virtual classroom'
    });
  }
});

// Get classroom details
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const classroom = await VirtualClassroom.findById(id)
      .populate('courseId', 'name code')
      .populate('facultyId', 'name email')
      .populate('attendees.userId', 'name email');

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Virtual classroom not found'
      });
    }

    res.json({
      success: true,
      classroom
    });
  } catch (error) {
    console.error('Get classroom details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classroom details'
    });
  }
});

// Join classroom (get join URL)
router.post('/:id/join', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const classroom = await VirtualClassroom.findById(id)
      .populate('courseId', 'name code');

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Virtual classroom not found'
      });
    }

    // Check if user is enrolled in the course or is the faculty
    const isEnrolled = await Course.findOne({
      _id: classroom.courseId._id,
      $or: [
        { 'enrollments.studentId': req.user.userId },
        { facultyId: req.facultyMember._id }
      ]
    });

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Check if meeting is scheduled for today or is live
    const now = new Date();
    const meetingDate = new Date(classroom.scheduledTime);
    const timeDiff = Math.abs(now - meetingDate);
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff > 2 && classroom.status !== 'live') {
      return res.status(400).json({
        success: false,
        message: 'Meeting is not available for joining yet'
      });
    }

    res.json({
      success: true,
      joinUrl: classroom.joinUrl,
      meetingId: classroom.meetingId,
      password: classroom.meetingPassword,
      classroom: {
        title: classroom.title,
        scheduledTime: classroom.scheduledTime,
        duration: classroom.duration,
        course: classroom.courseId
      }
    });
  } catch (error) {
    console.error('Join classroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join virtual classroom'
    });
  }
});

// Get attendance report
router.get('/:id/attendance', auth, requireFaculty, async (req, res) => {
  try {
    const { id } = req.params;

    const classroom = await VirtualClassroom.findById(id)
      .populate('attendees.userId', 'name email')
      .populate('courseId', 'name code');

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Virtual classroom not found'
      });
    }

    // Verify faculty ownership
    if (classroom.facultyId.toString() !== req.facultyMember._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view attendance'
      });
    }

    const attendanceReport = {
      classroomInfo: {
        title: classroom.title,
        scheduledTime: classroom.scheduledTime,
        duration: classroom.duration,
        course: classroom.courseId
      },
      totalAttendees: classroom.attendees.length,
      attendees: classroom.attendees.map(attendee => ({
        user: attendee.userId,
        joinedAt: attendee.joinedAt,
        leftAt: attendee.leftAt,
        duration: attendee.duration || 0,
        attendancePercentage: attendee.duration ? 
          Math.round((attendee.duration / classroom.duration) * 100) : 0
      }))
    };

    res.json({
      success: true,
      attendanceReport
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance report'
    });
  }
});

// Zoom webhook endpoint
router.post('/webhook/zoom', async (req, res) => {
  try {
    const event = req.body;
    const headers = req.headers;
    
    // Handle webhook with signature verification
    const result = await zoomService.handleWebhook(event, headers);
    
    if (!result.success && result.error === 'Invalid signature') {
      return res.status(401).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

module.exports = router;