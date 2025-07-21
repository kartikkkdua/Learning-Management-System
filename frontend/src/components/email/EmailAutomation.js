import React, { useState, useEffect } from 'react';
import EmailCampaigns from './EmailCampaigns';
import EmailTemplateManager from './EmailTemplateManager';
import EmailAnalyticsDashboard from './EmailAnalyticsDashboard';
import EmailScheduler from './EmailScheduler';
import './EmailAutomation.css';

const EmailAutomation = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalTemplates: 0,
    emailsSent: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

      // Fetch campaigns stats
      const campaignsResponse = await fetch(`${apiUrl}/api/email-campaigns`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const campaigns = await campaignsResponse.json();

      // Fetch templates stats
      const templatesResponse = await fetch(`${apiUrl}/api/email-templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const templates = await templatesResponse.json();

      // Fetch analytics stats
      const analyticsResponse = await fetch(`${apiUrl}/api/email-analytics/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const analytics = await analyticsResponse.json();

      setStats({
        totalCampaigns: campaigns.length || 0,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length || 0,
        totalTemplates: templates.length || 0,
        emailsSent: analytics.overview?.totalSent || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const tabs = [
    { id: 'campaigns', label: 'Email Campaigns', icon: '📧', component: EmailCampaigns },
    { id: 'scheduler', label: 'Email Scheduler', icon: '⏰', component: EmailScheduler },
    { id: 'templates', label: 'Template Library', icon: '📝', component: EmailTemplateManager },
    { id: 'analytics', label: 'Analytics & Reports', icon: '📊', component: EmailAnalyticsDashboard }
  ];

  const renderTabContent = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    if (activeTabData) {
      const Component = activeTabData.component;
      return <Component onStatsUpdate={fetchStats} />;
    }
    return null;
  };

  return (
    <div className="email-automation">
      <div className="email-automation-header">
        <h1>Email Automation & Marketing</h1>
        <p>Manage campaigns, templates, scheduling, and analytics</p>
        
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-number">{stats.totalCampaigns}</div>
            <div className="stat-label">Total Campaigns</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.activeCampaigns}</div>
            <div className="stat-label">Active Campaigns</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalTemplates}</div>
            <div className="stat-label">Email Templates</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.emailsSent.toLocaleString()}</div>
            <div className="stat-label">Emails Sent</div>
          </div>
        </div>
      </div>

      <div className="email-automation-tabs">
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

      <div className="email-automation-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default EmailAutomation;