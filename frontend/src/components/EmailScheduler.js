import React, { useState, useEffect } from 'react';
import './EmailScheduler.css';

const EmailScheduler = ({ onStatsUpdate }) => {
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [recurringEmails, setRecurringEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('scheduled');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchScheduledEmails();
  }, []);

  const fetchScheduledEmails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/email-campaigns?status=scheduled`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setScheduledEmails(data.filter(campaign => campaign.type === 'scheduled'));
        setRecurringEmails(data.filter(campaign => campaign.type === 'recurring'));
        if (onStatsUpdate) onStatsUpdate();
      }
    } catch (error) {
      console.error('Error fetching scheduled emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelScheduled = async (campaignId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled email?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/email-campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      
      if (response.ok) {
        fetchScheduledEmails();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error cancelling scheduled email:', error);
      alert('Error cancelling scheduled email');
    }
  };

  const handleReschedule = async (campaignId, newDate) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/email-campaigns/${campaignId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ scheduledDate: newDate })
      });
      
      if (response.ok) {
        fetchScheduledEmails();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error rescheduling email:', error);
      alert('Error rescheduling email');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#007bff';
      case 'active': return '#28a745';
      case 'paused': return '#ffc107';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeUntil = (dateString) => {
    const now = new Date();
    const scheduled = new Date(dateString);
    const diff = scheduled - now;
    
    if (diff < 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const tabs = [
    { id: 'scheduled', label: 'Scheduled Emails', icon: '⏰' },
    { id: 'recurring', label: 'Recurring Emails', icon: '🔄' },
    { id: 'reminders', label: 'Auto Reminders', icon: '🔔' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'scheduled':
        return <ScheduledTab emails={scheduledEmails} onCancel={handleCancelScheduled} onReschedule={handleReschedule} />;
      case 'recurring':
        return <RecurringTab emails={recurringEmails} />;
      case 'reminders':
        return <RemindersTab />;
      default:
        return <ScheduledTab emails={scheduledEmails} onCancel={handleCancelScheduled} onReschedule={handleReschedule} />;
    }
  };

  return (
    <div className="email-scheduler">
      <div className="scheduler-header">
        <h2>Email Scheduler</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Schedule New Email
        </button>
      </div>

      <div className="scheduler-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="scheduler-content">
        {loading ? (
          <div className="loading">Loading scheduled emails...</div>
        ) : (
          renderTabContent()
        )}
      </div>

      {showCreateModal && (
        <ScheduleEmailModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchScheduledEmails();
          }}
        />
      )}
    </div>
  );
};

const ScheduledTab = ({ emails, onCancel, onReschedule }) => {
  const [showRescheduleModal, setShowRescheduleModal] = useState(null);

  return (
    <div className="scheduled-tab">
      {emails.length === 0 ? (
        <div className="empty-state">
          <h3>No scheduled emails</h3>
          <p>Schedule your first email to get started</p>
        </div>
      ) : (
        <div className="scheduled-emails-list">
          {emails.map(email => (
            <div key={email._id} className="scheduled-email-card">
              <div className="email-header">
                <div className="email-title">
                  <h3>{email.name}</h3>
                  <div 
                    className="email-status"
                    style={{ backgroundColor: getStatusColor(email.status) }}
                  >
                    {email.status}
                  </div>
                </div>
                <div className="time-info">
                  <div className="scheduled-time">
                    {formatDateTime(email.scheduledDate)}
                  </div>
                  <div className="time-until">
                    {getTimeUntil(email.scheduledDate)}
                  </div>
                </div>
              </div>

              <div className="email-content">
                <div className="email-subject">
                  <strong>Subject:</strong> {email.subject}
                </div>
                <div className="email-recipients">
                  <strong>Recipients:</strong> {email.recipientType.replace('_', ' ')}
                </div>
                <div className="email-preview">
                  {email.content.substring(0, 150)}...
                </div>
              </div>

              <div className="email-actions">
                <button 
                  className="btn btn-info btn-sm"
                  onClick={() => setShowRescheduleModal(email)}
                >
                  Reschedule
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => onCancel(email._id)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRescheduleModal && (
        <RescheduleModal 
          email={showRescheduleModal}
          onClose={() => setShowRescheduleModal(null)}
          onReschedule={(newDate) => {
            onReschedule(showRescheduleModal._id, newDate);
            setShowRescheduleModal(null);
          }}
        />
      )}
    </div>
  );
};

const RecurringTab = ({ emails }) => {
  return (
    <div className="recurring-tab">
      {emails.length === 0 ? (
        <div className="empty-state">
          <h3>No recurring emails</h3>
          <p>Set up recurring email campaigns to automate your communication</p>
        </div>
      ) : (
        <div className="recurring-emails-list">
          {emails.map(email => (
            <div key={email._id} className="recurring-email-card">
              <div className="email-header">
                <div className="email-title">
                  <h3>{email.name}</h3>
                  <div 
                    className="email-status"
                    style={{ backgroundColor: getStatusColor(email.status) }}
                  >
                    {email.status}
                  </div>
                </div>
                <div className="recurring-info">
                  <div className="frequency">
                    Every {email.recurring?.interval || 1} {email.recurring?.frequency || 'week'}(s)
                  </div>
                  <div className="next-send">
                    Next: {formatDateTime(email.scheduledDate)}
                  </div>
                </div>
              </div>

              <div className="email-content">
                <div className="email-subject">
                  <strong>Subject:</strong> {email.subject}
                </div>
                <div className="email-recipients">
                  <strong>Recipients:</strong> {email.recipientType.replace('_', ' ')}
                </div>
              </div>

              <div className="email-stats">
                <div className="stat-item">
                  <div className="stat-number">{email.analytics.sent}</div>
                  <div className="stat-label">Total Sent</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{email.analytics.opened}</div>
                  <div className="stat-label">Opened</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">
                    {email.analytics.sent > 0 ? 
                      Math.round((email.analytics.opened / email.analytics.sent) * 100) : 0}%
                  </div>
                  <div className="stat-label">Open Rate</div>
                </div>
              </div>

              <div className="email-actions">
                <button className="btn btn-warning btn-sm">
                  {email.status === 'active' ? 'Pause' : 'Resume'}
                </button>
                <button className="btn btn-secondary btn-sm">
                  Edit
                </button>
                <button className="btn btn-danger btn-sm">
                  Stop
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RemindersTab = () => {
  const [reminders, setReminders] = useState([
    {
      id: 1,
      name: 'Assignment Due Reminder',
      type: 'assignment_due',
      trigger: '24 hours before due date',
      status: 'active',
      lastSent: '2024-01-15',
      totalSent: 45
    },
    {
      id: 2,
      name: 'Course Enrollment Reminder',
      type: 'enrollment_deadline',
      trigger: '3 days before deadline',
      status: 'active',
      lastSent: '2024-01-10',
      totalSent: 23
    }
  ]);

  return (
    <div className="reminders-tab">
      <div className="reminders-header">
        <h3>Automated Reminders</h3>
        <button className="btn btn-primary btn-sm">
          Create New Reminder
        </button>
      </div>

      <div className="reminders-list">
        {reminders.map(reminder => (
          <div key={reminder.id} className="reminder-card">
            <div className="reminder-header">
              <div className="reminder-title">
                <h4>{reminder.name}</h4>
                <div 
                  className="reminder-status"
                  style={{ backgroundColor: reminder.status === 'active' ? '#28a745' : '#6c757d' }}
                >
                  {reminder.status}
                </div>
              </div>
              <div className="reminder-type">
                {reminder.type.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            <div className="reminder-content">
              <div className="trigger-info">
                <strong>Trigger:</strong> {reminder.trigger}
              </div>
              <div className="reminder-stats">
                <span>Last sent: {reminder.lastSent}</span>
                <span>Total sent: {reminder.totalSent}</span>
              </div>
            </div>

            <div className="reminder-actions">
              <button className="btn btn-warning btn-sm">
                {reminder.status === 'active' ? 'Disable' : 'Enable'}
              </button>
              <button className="btn btn-secondary btn-sm">
                Edit
              </button>
              <button className="btn btn-info btn-sm">
                Test
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ScheduleEmailModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    recipientType: 'all_students',
    scheduledDate: '',
    timezone: 'UTC'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      // First create the campaign
      const campaignResponse = await fetch(`${apiUrl}/api/email-campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          type: 'scheduled'
        })
      });

      if (campaignResponse.ok) {
        const campaign = await campaignResponse.json();
        
        // Then schedule it
        const scheduleResponse = await fetch(`${apiUrl}/api/email-campaigns/${campaign._id}/schedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ scheduledDate: formData.scheduledDate })
        });

        if (scheduleResponse.ok) {
          onSuccess();
        } else {
          const error = await scheduleResponse.json();
          alert(`Error scheduling: ${error.message}`);
        }
      } else {
        const error = await campaignResponse.json();
        alert(`Error creating campaign: ${error.message}`);
      }
    } catch (error) {
      console.error('Error scheduling email:', error);
      alert('Error scheduling email');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Schedule New Email</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="schedule-form">
          <div className="form-group">
            <label>Email Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Recipients</label>
            <select
              name="recipientType"
              value={formData.recipientType}
              onChange={handleChange}
              className="form-control"
            >
              <option value="all_students">All Students</option>
              <option value="all_faculty">All Faculty</option>
              <option value="course_students">Course Students</option>
            </select>
          </div>

          <div className="form-group">
            <label>Schedule Date & Time</label>
            <input
              type="datetime-local"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              className="form-control"
              rows="6"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RescheduleModal = ({ email, onClose, onReschedule }) => {
  const [newDate, setNewDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onReschedule(newDate);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content small">
        <div className="modal-header">
          <h3>Reschedule Email</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p>Reschedule "{email.name}" to a new date and time:</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Date & Time</label>
              <input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Reschedule
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Helper function (moved outside component to avoid re-declaration)
const getStatusColor = (status) => {
  switch (status) {
    case 'scheduled': return '#007bff';
    case 'active': return '#28a745';
    case 'paused': return '#ffc107';
    case 'cancelled': return '#dc3545';
    default: return '#6c757d';
  }
};

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const getTimeUntil = (dateString) => {
  const now = new Date();
  const scheduled = new Date(dateString);
  const diff = scheduled - now;
  
  if (diff < 0) return 'Overdue';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export default EmailScheduler;