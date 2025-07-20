import React, { useState } from 'react';
import EmailComposer from './EmailComposer';
import EmailTester from './EmailTester';
import EmailAutomation from './EmailAutomation';
import './EmailDashboard.css';

const EmailDashboard = () => {
  const [activeTab, setActiveTab] = useState('compose');

  const tabs = [
    { id: 'compose', label: 'Compose Email', icon: '✉️' },
    { id: 'automation', label: 'Email Automation', icon: '🤖' },
    { id: 'test', label: 'Test Email', icon: '🧪' },
    { id: 'templates', label: 'Templates', icon: '📝' },
    { id: 'history', label: 'Email History', icon: '📋' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'compose':
        return <EmailComposer />;
      case 'automation':
        return <EmailAutomation />;
      case 'test':
        return <EmailTester />;
      case 'templates':
        return <EmailTemplates />;
      case 'history':
        return <EmailHistory />;
      default:
        return <EmailComposer />;
    }
  };

  return (
    <div className="email-dashboard">
      <div className="email-dashboard-header">
        <h1>Email Management</h1>
        <p>Send emails to students, faculty, and manage communication</p>
      </div>

      <div className="email-tabs">
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

      <div className="email-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Welcome Email',
      subject: 'Welcome to LMS Platform',
      content: 'Welcome to our learning management system...',
      lastUsed: '2024-01-15'
    },
    {
      id: 2,
      name: 'Assignment Reminder',
      subject: 'Assignment Due Reminder',
      content: 'This is a reminder about your upcoming assignment...',
      lastUsed: '2024-01-14'
    }
  ]);

  return (
    <div className="email-templates">
      <div className="templates-header">
        <h2>Email Templates</h2>
        <button className="btn btn-primary">Create New Template</button>
      </div>

      <div className="templates-grid">
        {templates.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-header">
              <h3>{template.name}</h3>
              <div className="template-actions">
                <button className="btn-icon" title="Edit">✏️</button>
                <button className="btn-icon" title="Delete">🗑️</button>
              </div>
            </div>
            <div className="template-content">
              <p><strong>Subject:</strong> {template.subject}</p>
              <p className="template-preview">{template.content.substring(0, 100)}...</p>
              <p className="template-meta">Last used: {template.lastUsed}</p>
            </div>
            <div className="template-footer">
              <button className="btn btn-secondary">Use Template</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmailHistory = () => {
  const [emailHistory] = useState([
    {
      id: 1,
      subject: 'Assignment Due Reminder',
      recipients: 25,
      sentDate: '2024-01-15 10:30 AM',
      status: 'Delivered'
    },
    {
      id: 2,
      subject: 'Course Update Notification',
      recipients: 45,
      sentDate: '2024-01-14 2:15 PM',
      status: 'Delivered'
    },
    {
      id: 3,
      subject: 'Welcome to New Semester',
      recipients: 120,
      sentDate: '2024-01-10 9:00 AM',
      status: 'Delivered'
    }
  ]);

  return (
    <div className="email-history">
      <div className="history-header">
        <h2>Email History</h2>
        <div className="history-filters">
          <select className="form-control">
            <option>All Status</option>
            <option>Delivered</option>
            <option>Failed</option>
            <option>Pending</option>
          </select>
          <input type="date" className="form-control" />
        </div>
      </div>

      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Recipients</th>
              <th>Sent Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {emailHistory.map(email => (
              <tr key={email.id}>
                <td>{email.subject}</td>
                <td>{email.recipients} recipients</td>
                <td>{email.sentDate}</td>
                <td>
                  <span className={`status ${email.status.toLowerCase()}`}>
                    {email.status}
                  </span>
                </td>
                <td>
                  <button className="btn-icon" title="View Details">view</button>
                  <button className="btn-icon" title="Resend">resend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmailDashboard;