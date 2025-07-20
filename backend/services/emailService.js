const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');
const EmailCampaign = require('../models/EmailCampaign');
const EmailTemplate = require('../models/EmailTemplate');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Test email connection
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email server connection successful');
      return { success: true, message: 'Email server connection successful' };
    } catch (error) {
      console.error('Email server connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  // Welcome email for new users
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to LMS Platform';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to LMS Platform!</h2>
        <p>Hello ${user.name},</p>
        <p>Your account has been created successfully. Here are your login details:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Role:</strong> ${user.role}</p>
        </div>
        <p>Please log in to access your dashboard and explore the platform.</p>
        <p>Best regards,<br>LMS Team</p>
      </div>
    `;
    return await this.sendEmail(user.email, subject, html);
  }

  // Assignment notification
  async sendAssignmentNotification(students, assignment, course) {
    const emails = students.map(student => student.email);
    const subject = `New Assignment: ${assignment.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Assignment Posted</h2>
        <p>A new assignment has been posted in <strong>${course.name}</strong>:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${assignment.title}</h3>
          <p><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>
          <p><strong>Description:</strong> ${assignment.description}</p>
        </div>
        <p>Please log in to view the complete assignment details.</p>
        <p>Best regards,<br>LMS Team</p>
      </div>
    `;
    return await this.sendEmail(emails, subject, html);
  }

  // Announcement notification
  async sendAnnouncementEmail(recipients, announcement, course) {
    const emails = recipients.map(user => user.email);
    const subject = `Announcement: ${announcement.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Course Announcement</h2>
        <p>New announcement in <strong>${course ? course.name : 'General'}</strong>:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${announcement.title}</h3>
          <p>${announcement.content}</p>
        </div>
        <p>Best regards,<br>LMS Team</p>
      </div>
    `;
    return await this.sendEmail(emails, subject, html);
  }

  // Grade notification
  async sendGradeNotification(student, assignment, grade, course) {
    const subject = `Grade Posted: ${assignment.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Grade Posted</h2>
        <p>Hello ${student.name},</p>
        <p>Your grade has been posted for <strong>${assignment.title}</strong> in <strong>${course.name}</strong>:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Grade: ${grade.score}/${grade.totalPoints}</h3>
          ${grade.feedback ? `<p><strong>Feedback:</strong> ${grade.feedback}</p>` : ''}
        </div>
        <p>Log in to view detailed feedback and comments.</p>
        <p>Best regards,<br>LMS Team</p>
      </div>
    `;
    return await this.sendEmail(student.email, subject, html);
  }

  // Enhanced email sending with analytics tracking
  async sendEmailWithTracking(to, subject, html, options = {}) {
    try {
      const {
        sender,
        campaign,
        template,
        trackingEnabled = true
      } = options;

      // Generate tracking pixel and links if tracking is enabled
      let trackedHtml = html;
      if (trackingEnabled) {
        trackedHtml = this.addTrackingToEmail(html, options);
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html: trackedHtml,
        text: this.stripHtml(html)
      };

      const result = await this.transporter.sendMail(mailOptions);

      // Log email to database
      await this.logEmail({
        messageId: result.messageId,
        subject,
        content: html,
        sender,
        recipients: Array.isArray(to) ? to : [to],
        campaign,
        template,
        status: 'sent',
        sentAt: new Date()
      });

      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      
      // Log failed email
      await this.logEmail({
        subject,
        content: html,
        sender: options.sender,
        recipients: Array.isArray(to) ? to : [to],
        campaign: options.campaign,
        template: options.template,
        status: 'failed',
        error: {
          message: error.message,
          code: error.code,
          timestamp: new Date()
        }
      });

      return { success: false, error: error.message };
    }
  }

  // Add tracking pixels and links to email
  addTrackingToEmail(html, options) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Add tracking pixel for open tracking
    const trackingPixel = `<img src="${baseUrl}/api/email/track/open/${options.messageId || 'temp'}" width="1" height="1" style="display:none;" />`;
    
    // Add click tracking to links
    const trackedHtml = html.replace(
      /<a\s+href="([^"]+)"([^>]*)>/gi,
      `<a href="${baseUrl}/api/email/track/click/${options.messageId || 'temp'}?url=$1"$2>`
    );

    return trackedHtml + trackingPixel;
  }

  // Log email to database
  async logEmail(emailData) {
    try {
      const emailLog = new EmailLog(emailData);
      await emailLog.save();
      return emailLog;
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  }

  // Process email template with variables
  async processTemplate(templateId, variables = {}) {
    try {
      const template = await EmailTemplate.findById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      let processedSubject = template.subject;
      let processedContent = template.content;

      // Replace variables in subject and content
      Object.keys(variables).forEach(key => {
        const placeholder = new RegExp(`\\[${key.toUpperCase()}\\]`, 'g');
        processedSubject = processedSubject.replace(placeholder, variables[key] || '');
        processedContent = processedContent.replace(placeholder, variables[key] || '');
      });

      // Update template usage statistics
      await EmailTemplate.findByIdAndUpdate(templateId, {
        $inc: { usageCount: 1 },
        lastUsed: new Date()
      });

      return {
        subject: processedSubject,
        content: processedContent,
        template
      };
    } catch (error) {
      console.error('Template processing failed:', error);
      throw error;
    }
  }

  // Send campaign email
  async sendCampaignEmail(campaignId, recipients) {
    try {
      const campaign = await EmailCampaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const results = [];
      
      for (const recipient of recipients) {
        const result = await this.sendEmailWithTracking(
          recipient.email,
          campaign.subject,
          campaign.content,
          {
            sender: campaign.createdBy,
            campaign: campaignId,
            template: campaign.template,
            trackingEnabled: true
          }
        );
        
        results.push({
          recipient: recipient.email,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        });
      }

      // Update campaign analytics
      const successCount = results.filter(r => r.success).length;
      await EmailCampaign.findByIdAndUpdate(campaignId, {
        $inc: {
          'analytics.sent': successCount,
          'analytics.delivered': successCount // Will be updated by webhooks later
        }
      });

      return {
        success: true,
        results,
        totalSent: successCount,
        totalFailed: results.length - successCount
      };
    } catch (error) {
      console.error('Campaign email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Schedule email campaign
  async scheduleCampaign(campaignId, scheduledDate) {
    try {
      await EmailCampaign.findByIdAndUpdate(campaignId, {
        scheduledDate,
        status: 'scheduled'
      });
      
      // In a real implementation, you'd use a job queue like Bull or Agenda
      // For now, we'll use setTimeout for demonstration
      const delay = new Date(scheduledDate) - new Date();
      if (delay > 0) {
        setTimeout(async () => {
          await this.executeCampaign(campaignId);
        }, delay);
      }

      return { success: true, message: 'Campaign scheduled successfully' };
    } catch (error) {
      console.error('Campaign scheduling failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Execute scheduled campaign
  async executeCampaign(campaignId) {
    try {
      const campaign = await EmailCampaign.findById(campaignId);
      if (!campaign || campaign.status !== 'scheduled') {
        return { success: false, error: 'Campaign not found or not scheduled' };
      }

      // Get recipients based on campaign settings
      const recipients = await this.getCampaignRecipients(campaign);
      
      // Send emails
      const result = await this.sendCampaignEmail(campaignId, recipients);
      
      // Update campaign status
      await EmailCampaign.findByIdAndUpdate(campaignId, {
        status: result.success ? 'completed' : 'failed'
      });

      return result;
    } catch (error) {
      console.error('Campaign execution failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get recipients for campaign
  async getCampaignRecipients(campaign) {
    const User = require('../models/User');
    const Student = require('../models/Student');
    const Faculty = require('../models/Faculty');
    const Course = require('../models/Course');

    let recipients = [];

    switch (campaign.recipientType) {
      case 'all_students':
        const students = await User.find({ role: 'student' });
        recipients = students.map(user => ({ email: user.email, name: user.name, userId: user._id }));
        break;
        
      case 'all_faculty':
        const faculty = await User.find({ role: 'faculty' });
        recipients = faculty.map(user => ({ email: user.email, name: user.name, userId: user._id }));
        break;
        
      case 'course_students':
        const course = await Course.findById(campaign.courseId).populate({
          path: 'enrolledStudents',
          populate: { path: 'user' }
        });
        recipients = course.enrolledStudents.map(enrollment => ({
          email: enrollment.user.email,
          name: enrollment.user.name,
          userId: enrollment.user._id
        }));
        break;
        
      case 'specific':
        recipients = campaign.recipients.map(email => ({ email, name: '', userId: null }));
        break;
    }

    return recipients;
  }

  // Custom email with enhanced features
  async sendCustomEmail(recipients, subject, content, options = {}) {
    const emails = Array.isArray(recipients) ? recipients : [recipients];
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 20px;">
          ${content}
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This email was sent from LMS Platform</p>
      </div>
    `;
    
    return await this.sendEmailWithTracking(emails, subject, html, options);
  }
}

module.exports = new EmailService();