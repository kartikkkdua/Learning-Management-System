import React, { useState, useEffect } from 'react';
import './EmailAnalyticsDashboard.css';

// Helper function to determine engagement level
const getEngagementLevel = (openRate) => {
  if (openRate >= 25) return { level: 'High', color: '#28a745' };
  if (openRate >= 15) return { level: 'Medium', color: '#ffc107' };
  return { level: 'Low', color: '#dc3545' };
};

const EmailAnalyticsDashboard = ({ onStatsUpdate }) => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalClicked: 0,
      totalBounced: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0
    },
    campaigns: [],
    topEmails: [],
    timeline: []
  });
  const [engagement, setEngagement] = useState([]);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
    fetchEngagement();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/email-analytics/dashboard?timeRange=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
        if (onStatsUpdate) onStatsUpdate();
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEngagement = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/email-analytics/engagement?limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEngagement(data);
      }
    } catch (error) {
      console.error('Error fetching engagement:', error);
    }
  };

  const handleExport = async (format = 'json') => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/email-analytics/export?format=${format}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'email-analytics.csv';
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'email-analytics.json';
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      alert('Error exporting analytics');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'campaigns', label: 'Campaign Performance', icon: '📧' },
    { id: 'engagement', label: 'Recipient Engagement', icon: '👥' },
    { id: 'timeline', label: 'Timeline Analysis', icon: '📈' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab analytics={analytics} />;
      case 'campaigns':
        return <CampaignsTab campaigns={analytics.campaigns} />;
      case 'engagement':
        return <EngagementTab engagement={engagement} />;
      case 'timeline':
        return <TimelineTab timeline={analytics.timeline} />;
      default:
        return <OverviewTab analytics={analytics} />;
    }
  };

  return (
    <div className="email-analytics-dashboard">
      <div className="analytics-header">
        <h2>Email Analytics & Reports</h2>
        <div className="analytics-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-control"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <div className="export-buttons">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => handleExport('json')}
            >
              Export JSON
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="analytics-tabs">
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

      <div className="analytics-content">
        {loading ? (
          <div className="loading">Loading analytics...</div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};

const OverviewTab = ({ analytics }) => {
  const { overview } = analytics;

  return (
    <div className="overview-tab">
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-number">{overview.totalSent.toLocaleString()}</div>
          <div className="metric-label">Total Emails Sent</div>
          <div className="metric-change">+12% from last period</div>
        </div>
        
        <div className="metric-card success">
          <div className="metric-number">{overview.deliveryRate.toFixed(1)}%</div>
          <div className="metric-label">Delivery Rate</div>
          <div className="metric-sublabel">{overview.totalDelivered.toLocaleString()} delivered</div>
        </div>
        
        <div className="metric-card info">
          <div className="metric-number">{overview.openRate.toFixed(1)}%</div>
          <div className="metric-label">Open Rate</div>
          <div className="metric-sublabel">{overview.totalOpened.toLocaleString()} opened</div>
        </div>
        
        <div className="metric-card warning">
          <div className="metric-number">{overview.clickRate.toFixed(1)}%</div>
          <div className="metric-label">Click Rate</div>
          <div className="metric-sublabel">{overview.totalClicked.toLocaleString()} clicked</div>
        </div>
        
        <div className="metric-card danger">
          <div className="metric-number">{overview.bounceRate.toFixed(1)}%</div>
          <div className="metric-label">Bounce Rate</div>
          <div className="metric-sublabel">{overview.totalBounced.toLocaleString()} bounced</div>
        </div>
      </div>

      <div className="insights-section">
        <h3>Key Insights</h3>
        <div className="insights-list">
          <div className="insight-item">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <div className="insight-title">Strong Open Rate</div>
              <div className="insight-description">
                Your {overview.openRate.toFixed(1)}% open rate is above the education industry average of 23.4%
              </div>
            </div>
          </div>
          
          <div className="insight-item">
            <div className="insight-icon">🎯</div>
            <div className="insight-content">
              <div className="insight-title">Engagement Opportunity</div>
              <div className="insight-description">
                Consider A/B testing subject lines to improve your click-through rate
              </div>
            </div>
          </div>
          
          <div className="insight-item">
            <div className="insight-icon">⚡</div>
            <div className="insight-content">
              <div className="insight-title">Delivery Excellence</div>
              <div className="insight-description">
                Excellent delivery rate of {overview.deliveryRate.toFixed(1)}% indicates good sender reputation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CampaignsTab = ({ campaigns }) => {
  return (
    <div className="campaigns-tab">
      <h3>Campaign Performance</h3>
      
      {campaigns.length === 0 ? (
        <div className="empty-state">
          <p>No campaign data available for the selected time period.</p>
        </div>
      ) : (
        <div className="campaigns-table">
          <table>
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Sent</th>
                <th>Opened</th>
                <th>Clicked</th>
                <th>Open Rate</th>
                <th>Click Rate</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(campaign => (
                <tr key={campaign.id}>
                  <td className="campaign-name">{campaign.name}</td>
                  <td>{campaign.sent.toLocaleString()}</td>
                  <td>{campaign.opened.toLocaleString()}</td>
                  <td>{campaign.clicked.toLocaleString()}</td>
                  <td>
                    <span className={`rate-badge ${parseFloat(campaign.openRate) > 20 ? 'good' : 'average'}`}>
                      {campaign.openRate}%
                    </span>
                  </td>
                  <td>
                    <span className={`rate-badge ${parseFloat(campaign.openRate) > 3 ? 'good' : 'average'}`}>
                      {campaign.sent > 0 ? ((campaign.clicked / campaign.sent) * 100).toFixed(1) : 0}%
                    </span>
                  </td>
                  <td>{new Date(campaign.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const EngagementTab = ({ engagement }) => {
  return (
    <div className="engagement-tab">
      <h3>Recipient Engagement Analysis</h3>
      
      {engagement.length === 0 ? (
        <div className="empty-state">
          <p>No engagement data available.</p>
        </div>
      ) : (
        <div className="engagement-list">
          {engagement.map((recipient, index) => {
            const engagementLevel = getEngagementLevel(recipient.openRate);
            
            return (
              <div key={recipient._id} className="engagement-item">
                <div className="engagement-rank">#{index + 1}</div>
                
                <div className="engagement-info">
                  <div className="recipient-email">{recipient._id}</div>
                  <div className="recipient-name">{recipient.name || 'Unknown'}</div>
                </div>
                
                <div className="engagement-stats">
                  <div className="stat">
                    <div className="stat-number">{recipient.totalEmails}</div>
                    <div className="stat-label">Emails</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">{recipient.totalOpens}</div>
                    <div className="stat-label">Opens</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">{recipient.totalClicks}</div>
                    <div className="stat-label">Clicks</div>
                  </div>
                </div>
                
                <div className="engagement-rates">
                  <div className="rate-item">
                    <div className="rate-label">Open Rate</div>
                    <div className="rate-value">{recipient.openRate.toFixed(1)}%</div>
                  </div>
                  <div className="rate-item">
                    <div className="rate-label">Click Rate</div>
                    <div className="rate-value">{recipient.clickRate.toFixed(1)}%</div>
                  </div>
                </div>
                
                <div 
                  className="engagement-level"
                  style={{ backgroundColor: engagementLevel.color }}
                >
                  {engagementLevel.level}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const TimelineTab = ({ timeline }) => {
  return (
    <div className="timeline-tab">
      <h3>Email Activity Timeline</h3>
      
      {timeline.length === 0 ? (
        <div className="empty-state">
          <p>No timeline data available for the selected period.</p>
        </div>
      ) : (
        <div className="timeline-chart">
          <div className="chart-container">
            {timeline.map(day => (
              <div key={day.date} className="timeline-day">
                <div className="day-date">{new Date(day.date).toLocaleDateString()}</div>
                <div className="day-bars">
                  <div 
                    className="bar sent"
                    style={{ height: `${(day.sent / Math.max(...timeline.map(d => d.sent))) * 100}%` }}
                    title={`${day.sent} sent`}
                  ></div>
                  <div 
                    className="bar opened"
                    style={{ height: `${(day.opened / Math.max(...timeline.map(d => d.opened))) * 100}%` }}
                    title={`${day.opened} opened`}
                  ></div>
                  <div 
                    className="bar clicked"
                    style={{ height: `${(day.clicked / Math.max(...timeline.map(d => d.clicked))) * 100}%` }}
                    title={`${day.clicked} clicked`}
                  ></div>
                </div>
                <div className="day-stats">
                  <div className="stat-item">
                    <span className="stat-dot sent"></span>
                    {day.sent}
                  </div>
                  <div className="stat-item">
                    <span className="stat-dot opened"></span>
                    {day.opened}
                  </div>
                  <div className="stat-item">
                    <span className="stat-dot clicked"></span>
                    {day.clicked}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot sent"></span>
              Emails Sent
            </div>
            <div className="legend-item">
              <span className="legend-dot opened"></span>
              Emails Opened
            </div>
            <div className="legend-item">
              <span className="legend-dot clicked"></span>
              Links Clicked
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailAnalyticsDashboard;