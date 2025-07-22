const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');
const EmailCampaign = require('../models/EmailCampaign');
const EmailTemplate = require('../models/EmailTemplate');

class EmailService {
  constructor() {
    // Debug email configuration
    console.log('📧 Email Configuration:');
    console.log('HOST:', process.env.EMAIL_HOST);
    console.log('PORT:', process.env.EMAIL_PORT);
    console.log('USER:', process.env.EMAIL_USER);
    console.log('FROM:', process.env.EMAIL_FROM);
    
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
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
    const subject = 'Welcome to LMS Platform - Account Created Successfully';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #007bff; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 20px;">
              🎓
            </div>
            <h2 style="color: #333; margin: 0;">Welcome to LMS Platform!</h2>
          </div>
          
          <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
            Hello ${user.profile?.firstName || user.username},
          </p>
          
          <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
            Your account has been created successfully! We're excited to have you join our learning community.
          </p>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">📋 Account Details</h3>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 8px 0;"><strong>Username:</strong> ${user.username}</p>
            <p style="margin: 8px 0;"><strong>Role:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
          </div>

          <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="background: #28a745; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; margin-right: 10px;">
                🔒
              </div>
              <h3 style="color: #155724; margin: 0;">Enhanced Security Enabled</h3>
            </div>
            <p style="color: #155724; margin-bottom: 15px; font-size: 14px;">
              <strong>Two-Factor Authentication (2FA) has been automatically enabled</strong> for your account to ensure maximum security.
            </p>
            <ul style="color: #155724; font-size: 14px; margin: 0; padding-left: 20px;">
              <li>You'll receive a verification code via email when logging in</li>
              <li>This adds an extra layer of protection to your account</li>
              <li>You can manage 2FA settings in your account preferences</li>
            </ul>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #856404; margin-top: 0; margin-bottom: 15px;">
              🚀 Getting Started
            </h3>
            <ol style="color: #856404; font-size: 14px; margin: 0; padding-left: 20px;">
              <li>Log in to your account using your email and password</li>
              <li>Enter the verification code sent to your email</li>
              <li>Complete your profile information</li>
              <li>Explore the platform features</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
               style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
              Login to Your Account
            </a>
          </div>

          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #495057; margin-top: 0; margin-bottom: 15px;">
              📞 Need Help?
            </h3>
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
              If you have any questions or need assistance, our support team is here to help:
            </p>
            <ul style="color: #666; font-size: 14px; margin: 0; padding-left: 20px;">
              <li>Email: support@lmsplatform.com</li>
              <li>Phone: 1-800-LMS-HELP</li>
              <li>Help Center: Available in your account dashboard</li>
            </ul>
          </div>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <div style="text-align: center; padding: 20px;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            Welcome to LMS Platform - Your Learning Journey Starts Here!
          </p>
          <p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">
            This email was sent because an account was created with this email address.
          </p>
        </div>
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

  // Send 2FA verification code
  async send2FACode(user, code) {
    const subject = 'Your LMS Login Verification Code';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 40px 20px;">
          <h2 style="color: #333; margin-bottom: 30px;">Login Verification Code</h2>
          <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
            Hello ${user.profile?.firstName || user.username},
          </p>
          <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
            Please use the following verification code to complete your login:
          </p>
          <div style="background: #f8f9fa; border: 2px solid #007bff; border-radius: 8px; padding: 30px; margin: 30px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; text-align: center;">
              ${code}
            </div>
          </div>
          <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
            This code will expire in <strong>4 minutes</strong>.
          </p>
          <p style="font-size: 14px; color: #666;">
            If you didn't request this code, please ignore this email or contact support if you have concerns.
          </p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          This email was sent from LMS Platform for security verification.
        </p>
      </div>
    `;
    
    return await this.sendEmail(user.email, subject, html);
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetUrl) {
    const subject = 'Password Reset Request - LMS Platform';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 40px 20px;">
          <h2 style="color: #333; margin-bottom: 30px;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
            Hello ${user.profile?.firstName || user.username},
          </p>
          <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
            We received a request to reset your password for your LMS Platform account.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
              Reset Your Password
            </a>
          </div>
          <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
            This link will expire in <strong>1 hour</strong> for security reasons.
          </p>
          <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #999; word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">
            ${resetUrl}
          </p>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          This email was sent from LMS Platform for account security.
        </p>
      </div>
    `;
    
    return await this.sendEmail(user.email, subject, html);
  }

  // Send password change confirmation
  async sendPasswordChangeConfirmation(user) {
    const subject = 'Password Changed Successfully - LMS Platform';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 40px 20px;">
          <h2 style="color: #28a745; margin-bottom: 30px;">Password Changed Successfully</h2>
          <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
            Hello ${user.profile?.firstName || user.username},
          </p>
          <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
            Your password has been successfully changed for your LMS Platform account.
          </p>
          <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 20px; margin: 30px 0;">
            <p style="color: #155724; margin: 0; font-weight: bold;">
              ✓ Password updated on ${new Date().toLocaleString()}
            </p>
          </div>
          <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
            If you didn't make this change, please contact our support team immediately.
          </p>
          <p style="font-size: 14px; color: #666;">
            For your security, we recommend:
          </p>
          <ul style="color: #666; font-size: 14px;">
            <li>Using a strong, unique password</li>
            <li>Enabling two-factor authentication</li>
            <li>Not sharing your login credentials</li>
          </ul>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          This email was sent from LMS Platform for account security.
        </p>
      </div>
    `;
    
    return await this.sendEmail(user.email, subject, html);
  }

  // Send password reset confirmation (after successful reset via email link)
  async sendPasswordResetConfirmation(user) {
    const subject = 'Password Reset Successful - LMS Platform';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #28a745; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 20px;">
              ✓
            </div>
            <h2 style="color: #28a745; margin: 0;">Password Reset Successful</h2>
          </div>
          
          <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
            Hello ${user.profile?.firstName || user.username},
          </p>
          
          <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
            Your password has been successfully reset for your LMS Platform account using the password reset link.
          </p>
          
          <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="background: #28a745; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; margin-right: 10px;">
                ✓
              </div>
              <p style="color: #155724; margin: 0; font-weight: bold;">
                Password reset completed on ${new Date().toLocaleString()}
              </p>
            </div>
            <p style="color: #155724; margin: 0; font-size: 14px;">
              The password reset link you used has been automatically invalidated for security.
            </p>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #856404; margin-top: 0; margin-bottom: 15px;">
              🔒 Security Notice
            </h3>
            <p style="color: #856404; margin-bottom: 15px; font-size: 14px;">
              If you did not request this password reset, your account may have been compromised.
            </p>
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Please contact our support team immediately:</strong>
            </p>
            <ul style="color: #856404; font-size: 14px; margin: 10px 0;">
              <li>Email: support@lmsplatform.com</li>
              <li>Phone: 1-800-LMS-HELP</li>
              <li>Or use the "Contact Support" option in your account settings</li>
            </ul>
          </div>

          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #495057; margin-top: 0; margin-bottom: 15px;">
              🛡️ Security Recommendations
            </h3>
            <ul style="color: #666; font-size: 14px; margin: 0; padding-left: 20px;">
              <li>Use a strong, unique password that you don't use elsewhere</li>
              <li>Enable two-factor authentication for extra security</li>
              <li>Never share your login credentials with anyone</li>
              <li>Log out from shared or public computers</li>
              <li>Regularly review your account activity</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
              You can now log in to your account with your new password.
            </p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
               style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Login to Your Account
            </a>
          </div>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <div style="text-align: center; padding: 20px;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            This email was sent from LMS Platform for account security.
          </p>
          <p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">
            If you have questions, please contact our support team.
          </p>
        </div>
      </div>
    `;
    
    return await this.sendEmail(user.email, subject, html);
  }

  // Faculty approval/rejection email
  async sendFacultyApprovalEmail(user, approved, reason = null) {
    const subject = approved ? 
      'Faculty Account Approved - Welcome to LMS Platform' : 
      'Faculty Account Application Update';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">LMS Platform</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Faculty Account ${approved ? 'Approved' : 'Update'}</p>
        </div>
        
        <div style="background: white; padding: 30px; margin: 0;">
          <h2 style="color: #333; margin-top: 0;">
            ${approved ? '🎉 Congratulations!' : '📋 Account Status Update'}
          </h2>
          
          ${approved ? `
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Your faculty account has been approved! You now have full access to the LMS Platform faculty features.
            </p>
            
            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2c5aa0; margin-top: 0;">What you can do now:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Create and manage courses</li>
                <li>Upload course materials and assignments</li>
                <li>Track student attendance and grades</li>
                <li>Communicate with students</li>
                <li>Access faculty resources</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold;
                        display: inline-block;">
                Access Your Account
              </a>
            </div>
          ` : `
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Thank you for your interest in joining our faculty. After careful review, we are unable to approve your faculty account at this time.
            </p>
            
            ${reason ? `
              <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h3 style="color: #856404; margin-top: 0;">Reason:</h3>
                <p style="color: #856404; margin: 0;">${reason}</p>
              </div>
            ` : ''}
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              If you believe this is an error or would like to reapply in the future, please contact our support team.
            </p>
          `}
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 14px; margin: 0;">
            If you have any questions, please contact our support team at 
            <a href="mailto:support@lmsplatform.com" style="color: #667eea;">support@lmsplatform.com</a>
          </p>
        </div>
      </div>
    `;
    
    return await this.sendEmail(user.email, subject, html);
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