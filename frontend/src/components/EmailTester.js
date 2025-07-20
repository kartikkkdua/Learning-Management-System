import React, { useState } from 'react';
import './EmailTester.css';

const EmailTester = () => {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');

  const testConnection = async () => {
    setLoading(true);
    setConnectionStatus('');
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      console.log('Testing connection to:', `${apiUrl}/api/email/test-connection`);
      
      const response = await fetch(`${apiUrl}/api/email/test-connection`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Response data:', result);
      
      if (result.success) {
        setConnectionStatus('✅ Email server connection successful!');
      } else {
        setConnectionStatus(`❌ Connection failed: ${result.error || result.message}`);
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      console.log('Sending test email to:', `${apiUrl}/api/email/test`);
      
      const response = await fetch(`${apiUrl}/api/email/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ testEmail })
      });

      console.log('Test email response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Test email response data:', result);

      if (response.ok) {
        setMessage('✅ Test email sent successfully! Check your inbox.');
        setTestEmail('');
      } else {
        setMessage(`❌ Failed to send test email: ${result.message}`);
      }
    } catch (error) {
      console.error('Test email error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-tester">
      <div className="email-tester-header">
        <h2>Email System Tester</h2>
        <p>Use this tool to test your email configuration</p>
      </div>

      <div className="test-section">
        <h3>1. Test Email Server Connection</h3>
        <button 
          onClick={testConnection} 
          disabled={loading}
          className="btn btn-secondary"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
        {connectionStatus && (
          <div className={`status-message ${connectionStatus.includes('✅') ? 'success' : 'error'}`}>
            {connectionStatus}
          </div>
        )}
      </div>

      <div className="test-section">
        <h3>2. Send Test Email</h3>
        <form onSubmit={sendTestEmail} className="test-form">
          <div className="form-group">
            <label>Test Email Address:</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter email to receive test message"
              className="form-control"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !testEmail}
            className="btn btn-primary"
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </button>
        </form>
        {message && (
          <div className={`status-message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="troubleshooting-section">
        <h3>Troubleshooting Tips</h3>
        <div className="tips-list">
          <div className="tip">
            <strong>Gmail Setup:</strong>
            <ul>
              <li>Enable 2-Factor Authentication on your Gmail account</li>
              <li>Generate an App Password (not your regular password)</li>
              <li>Use the App Password in EMAIL_PASS environment variable</li>
            </ul>
          </div>
          <div className="tip">
            <strong>Environment Variables:</strong>
            <ul>
              <li>EMAIL_HOST=smtp.gmail.com</li>
              <li>EMAIL_PORT=587</li>
              <li>EMAIL_USER=your-email@gmail.com</li>
              <li>EMAIL_PASS=your-app-password</li>
              <li>EMAIL_FROM=your-email@gmail.com</li>
            </ul>
          </div>
          <div className="tip">
            <strong>Common Issues:</strong>
            <ul>
              <li>Check if "Less secure app access" is enabled (if not using App Password)</li>
              <li>Verify your email credentials are correct</li>
              <li>Check server logs for detailed error messages</li>
              <li>Ensure your firewall allows outbound SMTP connections</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTester;