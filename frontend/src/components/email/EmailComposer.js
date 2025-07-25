import React, { useState, useEffect } from 'react';
import './EmailComposer.css';

const EmailComposer = () => {
  const [emailData, setEmailData] = useState({
    recipientType: 'specific',
    recipients: '',
    courseId: '',
    subject: '',
    content: ''
  });
  const [courses, setCourses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchTemplates();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      // Use my-courses for faculty, all courses for admin
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const endpoint = user.role === 'faculty' ? 
        `${apiUrl}/api/courses/my-courses` : 
        `${apiUrl}/api/courses`;
        
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setMessage(`Error loading courses: ${error.message}`);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/email/templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Don't show error message for templates as it's not critical
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTemplateSelect = (template) => {
    setEmailData(prev => ({
      ...prev,
      subject: template.subject,
      content: template.content
    }));
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const payload = { ...emailData };

      // Convert recipients string to array for specific emails
      if (emailData.recipientType === 'specific') {
        payload.recipients = emailData.recipients.split(',').map(email => email.trim());
      }

      console.log('Sending email with payload:', payload);

      const response = await fetch(`${apiUrl}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('Email send response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Email send response data:', result);

      setMessage('✅ Email sent successfully!');
      setEmailData({
        recipientType: 'specific',
        recipients: '',
        courseId: '',
        subject: '',
        content: ''
      });
    } catch (error) {
      console.error('Email send error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-composer">
      <div className="email-composer-header">
        <h2>Compose Email</h2>
      </div>

      <div className="email-composer-content">
        <div className="templates-section">
          <h3>Quick Templates</h3>
          <div className="template-buttons">
            {templates.map(template => (
              <button
                key={template.id}
                className="template-btn"
                onClick={() => handleTemplateSelect(template)}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSendEmail} className="email-form">
          <div className="form-group">
            <label>Recipients</label>
            <select
              name="recipientType"
              value={emailData.recipientType}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="specific">Specific Email Addresses</option>
              <option value="all_students">All Students</option>
              <option value="all_faculty">All Faculty</option>
              <option value="course_students">Course Students</option>
            </select>
          </div>

          {emailData.recipientType === 'specific' && (
            <div className="form-group">
              <label>Email Addresses (comma separated)</label>
              <textarea
                name="recipients"
                value={emailData.recipients}
                onChange={handleInputChange}
                placeholder="email1@example.com, email2@example.com"
                className="form-control"
                rows="3"
                required
              />
            </div>
          )}

          {emailData.recipientType === 'course_students' && (
            <div className="form-group">
              <label>Select Course</label>
              <select
                name="courseId"
                value={emailData.courseId}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              name="subject"
              value={emailData.subject}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Message Content</label>
            <textarea
              name="content"
              value={emailData.content}
              onChange={handleInputChange}
              className="form-control email-content"
              rows="10"
              placeholder="Enter your message here..."
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </form>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailComposer;