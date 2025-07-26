const axios = require('axios');
const jwt = require('jsonwebtoken');

class ZoomService {
  constructor() {
    this.baseUrl = 'https://api.zoom.us/v2';
  }

  // Get API credentials dynamically
  getCredentials() {
    return {
      apiKey: process.env.ZOOM_API_KEY,
      apiSecret: process.env.ZOOM_API_SECRET
    };
  }

  // Generate JWT token for Zoom API authentication
  generateJWT() {
    const { apiKey, apiSecret } = this.getCredentials();
    
    // Debug logging
    console.log('🔍 Zoom API Key:', apiKey ? 'Set' : 'Not set');
    console.log('🔍 Zoom API Secret:', apiSecret ? 'Set' : 'Not set');
    
    if (!apiKey || !apiSecret) {
      throw new Error('Zoom API credentials not configured. Please set ZOOM_API_KEY and ZOOM_API_SECRET in your environment variables.');
    }

    const payload = {
      iss: apiKey,
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
    };
    
    return jwt.sign(payload, apiSecret);
  }

  // Create a new Zoom meeting
  async createMeeting(meetingData) {
    try {
      const token = this.generateJWT();
      
      const response = await axios.post(
        `${this.baseUrl}/users/me/meetings`,
        {
          topic: meetingData.title,
          type: meetingData.isRecurring ? 8 : 2, // 2 = scheduled, 8 = recurring
          start_time: meetingData.scheduledTime,
          duration: meetingData.duration,
          timezone: 'UTC',
          password: meetingData.password,
          agenda: meetingData.description,
          settings: {
            host_video: true,
            participant_video: false,
            cn_meeting: false,
            in_meeting: false,
            join_before_host: false,
            mute_upon_entry: meetingData.settings?.muteOnEntry || true,
            watermark: false,
            use_pmi: false,
            approval_type: meetingData.settings?.waitingRoom ? 1 : 0,
            audio: 'both',
            auto_recording: meetingData.recordingEnabled ? 'cloud' : 'none',
            enforce_login: false,
            registrants_email_notification: true,
            waiting_room: meetingData.settings?.waitingRoom || true,
            allow_multiple_devices: true
          },
          recurrence: meetingData.recurrencePattern ? {
            type: this.getRecurrenceType(meetingData.recurrencePattern.type),
            repeat_interval: meetingData.recurrencePattern.interval,
            end_date_time: meetingData.recurrencePattern.endDate
          } : undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        meetingId: response.data.id.toString(),
        joinUrl: response.data.join_url,
        hostUrl: response.data.start_url,
        password: response.data.password,
        data: response.data
      };
    } catch (error) {
      console.error('Zoom API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create Zoom meeting'
      };
    }
  }

  // Update an existing meeting
  async updateMeeting(meetingId, updateData) {
    try {
      const token = this.generateJWT();
      
      await axios.patch(
        `${this.baseUrl}/meetings/${meetingId}`,
        {
          topic: updateData.title,
          start_time: updateData.scheduledTime,
          duration: updateData.duration,
          agenda: updateData.description,
          settings: {
            mute_upon_entry: updateData.settings?.muteOnEntry,
            waiting_room: updateData.settings?.waitingRoom,
            auto_recording: updateData.recordingEnabled ? 'cloud' : 'none'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Zoom Update Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update Zoom meeting'
      };
    }
  }

  // Delete a meeting
  async deleteMeeting(meetingId) {
    try {
      const token = this.generateJWT();
      
      await axios.delete(`${this.baseUrl}/meetings/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Zoom Delete Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete Zoom meeting'
      };
    }
  }

  // Get meeting details
  async getMeetingDetails(meetingId) {
    try {
      const token = this.generateJWT();
      
      const response = await axios.get(`${this.baseUrl}/meetings/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Zoom Get Meeting Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get meeting details'
      };
    }
  }

  // Get meeting participants
  async getMeetingParticipants(meetingId) {
    try {
      const token = this.generateJWT();
      
      const response = await axios.get(
        `${this.baseUrl}/report/meetings/${meetingId}/participants`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return {
        success: true,
        participants: response.data.participants
      };
    } catch (error) {
      console.error('Zoom Participants Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get participants'
      };
    }
  }

  // Get meeting recordings
  async getMeetingRecordings(meetingId) {
    try {
      const token = this.generateJWT();
      
      const response = await axios.get(
        `${this.baseUrl}/meetings/${meetingId}/recordings`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return {
        success: true,
        recordings: response.data.recording_files
      };
    } catch (error) {
      console.error('Zoom Recordings Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get recordings'
      };
    }
  }

  // Helper method to convert recurrence type
  getRecurrenceType(type) {
    const types = {
      'daily': 1,
      'weekly': 2,
      'monthly': 3
    };
    return types[type] || 2;
  }

  // Verify webhook signature (optional - only if webhooks are configured)
  verifyWebhookSignature(headers, body) {
    if (!process.env.ZOOM_WEBHOOK_SECRET || process.env.ZOOM_WEBHOOK_SECRET === 'dummy_secret_for_testing') {
      console.log('⚠️ Webhook signature verification skipped (no secret configured)');
      return true; // Skip verification for testing
    }

    const crypto = require('crypto');
    const signature = headers['authorization'];
    const timestamp = headers['x-zm-request-timestamp'];
    
    if (!signature || !timestamp) {
      return false;
    }

    try {
      // Zoom webhook signature format: "v0=<signature>"
      const expectedSignature = signature.split('=')[1];
      
      // Create the signature string
      const message = `v0:${timestamp}:${JSON.stringify(body)}`;
      
      // Generate HMAC
      const hmac = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET);
      hmac.update(message);
      const computedSignature = hmac.digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(computedSignature, 'hex')
      );
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  // Webhook handler for Zoom events
  async handleWebhook(event, headers) {
    try {
      // Verify webhook signature for security (optional for testing)
      if (!this.verifyWebhookSignature(headers, event)) {
        console.warn('Invalid webhook signature');
        return { success: false, error: 'Invalid signature' };
      }

      console.log('📨 Processing Zoom webhook event:', event.event);

      switch (event.event) {
        case 'meeting.started':
          return await this.handleMeetingStarted(event.payload);
        case 'meeting.ended':
          return await this.handleMeetingEnded(event.payload);
        case 'meeting.participant_joined':
          return await this.handleParticipantJoined(event.payload);
        case 'meeting.participant_left':
          return await this.handleParticipantLeft(event.payload);
        case 'recording.completed':
          return await this.handleRecordingCompleted(event.payload);
        default:
          console.log('Unhandled Zoom webhook event:', event.event);
          return { success: true };
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleMeetingStarted(payload) {
    // Update meeting status to 'live'
    const VirtualClassroom = require('../models/VirtualClassroom');
    await VirtualClassroom.findOneAndUpdate(
      { meetingId: payload.object.id.toString() },
      { status: 'live' }
    );
    return { success: true };
  }

  async handleMeetingEnded(payload) {
    // Update meeting status to 'ended'
    const VirtualClassroom = require('../models/VirtualClassroom');
    await VirtualClassroom.findOneAndUpdate(
      { meetingId: payload.object.id.toString() },
      { status: 'ended' }
    );
    return { success: true };
  }

  async handleParticipantJoined(payload) {
    // Track participant join time
    const VirtualClassroom = require('../models/VirtualClassroom');
    const User = require('../models/User');
    
    const user = await User.findOne({ email: payload.object.participant.email });
    if (user) {
      await VirtualClassroom.findOneAndUpdate(
        { meetingId: payload.object.id.toString() },
        {
          $push: {
            attendees: {
              userId: user._id,
              joinedAt: new Date(payload.object.participant.join_time)
            }
          }
        }
      );
    }
    return { success: true };
  }

  async handleParticipantLeft(payload) {
    // Update participant leave time and calculate duration
    const VirtualClassroom = require('../models/VirtualClassroom');
    const User = require('../models/User');
    
    const user = await User.findOne({ email: payload.object.participant.email });
    if (user) {
      const classroom = await VirtualClassroom.findOne({ 
        meetingId: payload.object.id.toString() 
      });
      
      if (classroom) {
        const attendee = classroom.attendees.find(a => 
          a.userId.toString() === user._id.toString() && !a.leftAt
        );
        
        if (attendee) {
          const joinTime = new Date(attendee.joinedAt);
          const leaveTime = new Date(payload.object.participant.leave_time);
          const duration = Math.round((leaveTime - joinTime) / (1000 * 60)); // minutes
          
          attendee.leftAt = leaveTime;
          attendee.duration = duration;
          
          await classroom.save();
        }
      }
    }
    return { success: true };
  }

  async handleRecordingCompleted(payload) {
    // Update recording URL
    const VirtualClassroom = require('../models/VirtualClassroom');
    const recordingUrl = payload.object.recording_files?.[0]?.play_url;
    
    if (recordingUrl) {
      await VirtualClassroom.findOneAndUpdate(
        { meetingId: payload.object.id.toString() },
        { recordingUrl }
      );
    }
    return { success: true };
  }
}

module.exports = new ZoomService();