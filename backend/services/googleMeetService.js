const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

class GoogleMeetService {
  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback'
    );
    
    // Set up service account if available
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      this.serviceAuth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ]
      });
    }
  }

  // Create a Google Meet meeting via Calendar API
  async createMeeting(meetingData, accessToken) {
    try {
      // Set the access token
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      
      const event = {
        summary: meetingData.title,
        description: meetingData.description,
        start: {
          dateTime: new Date(meetingData.scheduledTime).toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: new Date(new Date(meetingData.scheduledTime).getTime() + meetingData.duration * 60000).toISOString(),
          timeZone: 'UTC',
        },
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        attendees: meetingData.attendees || [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all'
      });

      const meetEvent = response.data;
      const meetLink = meetEvent.conferenceData?.entryPoints?.find(
        entry => entry.entryPointType === 'video'
      )?.uri;

      return {
        success: true,
        meetingId: meetEvent.id,
        meetLink: meetLink,
        calendarEventId: meetEvent.id,
        htmlLink: meetEvent.htmlLink,
        data: meetEvent
      };
    } catch (error) {
      console.error('Google Meet API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Failed to create Google Meet'
      };
    }
  }

  // Update an existing meeting
  async updateMeeting(eventId, updateData, accessToken) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const event = {
        summary: updateData.title,
        description: updateData.description,
        start: {
          dateTime: new Date(updateData.scheduledTime).toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: new Date(new Date(updateData.scheduledTime).getTime() + updateData.duration * 60000).toISOString(),
          timeZone: 'UTC',
        },
      };

      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
        sendUpdates: 'all'
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Google Meet Update Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to update Google Meet'
      };
    }
  }

  // Delete a meeting
  async deleteMeeting(eventId, accessToken) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all'
      });

      return { success: true };
    } catch (error) {
      console.error('Google Meet Delete Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to delete Google Meet'
      };
    }
  }

  // Get meeting details
  async getMeetingDetails(eventId, accessToken) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const response = await calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      });

      const event = response.data;
      const meetLink = event.conferenceData?.entryPoints?.find(
        entry => entry.entryPointType === 'video'
      )?.uri;

      return {
        success: true,
        data: {
          ...event,
          meetLink
        }
      };
    } catch (error) {
      console.error('Google Meet Get Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to get meeting details'
      };
    }
  }

  // Generate Google Meet link directly (simpler approach)
  generateMeetLink() {
    // Generate a random meeting ID
    const meetingId = this.generateMeetingId();
    return {
      success: true,
      meetLink: `https://meet.google.com/${meetingId}`,
      meetingId: meetingId
    };
  }

  // Generate a random meeting ID for Google Meet
  generateMeetingId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const segments = [];
    
    // Generate 3 segments of 4 characters each (xxx-xxxx-xxx format)
    for (let i = 0; i < 3; i++) {
      let segment = '';
      const length = i === 1 ? 4 : 3; // Middle segment is 4 chars
      for (let j = 0; j < length; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      segments.push(segment);
    }
    
    return segments.join('-');
  }

  // Create instant meeting (no calendar integration)
  async createInstantMeeting(meetingData) {
    try {
      const meetingId = this.generateMeetingId();
      const meetLink = `https://meet.google.com/${meetingId}`;

      return {
        success: true,
        meetingId: meetingId,
        meetLink: meetLink,
        joinUrl: meetLink,
        hostUrl: meetLink, // Same for Google Meet
        data: {
          id: meetingId,
          meetLink: meetLink,
          title: meetingData.title,
          description: meetingData.description,
          scheduledTime: meetingData.scheduledTime,
          duration: meetingData.duration
        }
      };
    } catch (error) {
      console.error('Instant Meet Creation Error:', error);
      return {
        success: false,
        error: 'Failed to create instant Google Meet'
      };
    }
  }

  // Validate Google Meet link
  isValidMeetLink(link) {
    const meetRegex = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
    return meetRegex.test(link);
  }

  // Extract meeting ID from Google Meet link
  extractMeetingId(meetLink) {
    const match = meetLink.match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
    return match ? match[1] : null;
  }

  // Get OAuth URL for Google Calendar access
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return {
        success: true,
        tokens
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new GoogleMeetService();