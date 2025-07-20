import React, { useState, useEffect } from 'react';
import './EmailCampaigns.css';

const EmailCampaigns = ({ onStatsUpdate }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

            const response = await fetch(`${apiUrl}/api/email-campaigns`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setCampaigns(data);
                if (onStatsUpdate) onStatsUpdate();
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendCampaign = async (campaignId) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

            const response = await fetch(`${apiUrl}/api/email-campaigns/${campaignId}/send`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Campaign sent successfully! ${result.totalSent} emails sent.`);
                fetchCampaigns();
            } else {
                const error = await response.json();
                alert(`Failed to send campaign: ${error.message}`);
            }
        } catch (error) {
            console.error('Error sending campaign:', error);
            alert('Error sending campaign');
        }
    };

    const handleToggleCampaign = async (campaignId) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

            const response = await fetch(`${apiUrl}/api/email-campaigns/${campaignId}/toggle`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchCampaigns();
            }
        } catch (error) {
            console.error('Error toggling campaign:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#28a745';
            case 'paused': return '#ffc107';
            case 'completed': return '#007bff';
            case 'draft': return '#6c757d';
            case 'cancelled': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'one-time': return '📧';
            case 'drip': return '💧';
            case 'scheduled': return '⏰';
            case 'recurring': return '🔄';
            default: return '📧';
        }
    };

    return (
        <div className="email-campaigns">
            <div className="campaigns-header">
                <h2>Email Campaigns</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    Create New Campaign
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading campaigns...</div>
            ) : (
                <div className="campaigns-grid">
                    {campaigns.length === 0 ? (
                        <div className="empty-state">
                            <h3>No campaigns yet</h3>
                            <p>Create your first email campaign to get started</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowCreateModal(true)}
                            >
                                Create Campaign
                            </button>
                        </div>
                    ) : (
                        campaigns.map(campaign => (
                            <div key={campaign._id} className="campaign-card">
                                <div className="campaign-header">
                                    <div className="campaign-title">
                                        <span className="campaign-icon">{getTypeIcon(campaign.type)}</span>
                                        <h3>{campaign.name}</h3>
                                    </div>
                                    <div
                                        className="campaign-status"
                                        style={{ backgroundColor: getStatusColor(campaign.status) }}
                                    >
                                        {campaign.status}
                                    </div>
                                </div>

                                <div className="campaign-content">
                                    <p className="campaign-description">{campaign.description}</p>
                                    <div className="campaign-details">
                                        <div className="detail-item">
                                            <strong>Subject:</strong> {campaign.subject}
                                        </div>
                                        <div className="detail-item">
                                            <strong>Type:</strong> {campaign.type}
                                        </div>
                                        <div className="detail-item">
                                            <strong>Recipients:</strong> {campaign.recipientType.replace('_', ' ')}
                                        </div>
                                        {campaign.scheduledDate && (
                                            <div className="detail-item">
                                                <strong>Scheduled:</strong> {new Date(campaign.scheduledDate).toLocaleString()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="campaign-analytics">
                                        <div className="analytics-item">
                                            <div className="analytics-number">{campaign.analytics.sent}</div>
                                            <div className="analytics-label">Sent</div>
                                        </div>
                                        <div className="analytics-item">
                                            <div className="analytics-number">{campaign.analytics.opened}</div>
                                            <div className="analytics-label">Opened</div>
                                        </div>
                                        <div className="analytics-item">
                                            <div className="analytics-number">{campaign.analytics.clicked}</div>
                                            <div className="analytics-label">Clicked</div>
                                        </div>
                                        <div className="analytics-item">
                                            <div className="analytics-number">
                                                {campaign.analytics.sent > 0 ?
                                                    Math.round((campaign.analytics.opened / campaign.analytics.sent) * 100) : 0}%
                                            </div>
                                            <div className="analytics-label">Open Rate</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="campaign-actions">
                                    {campaign.status === 'draft' && (
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleSendCampaign(campaign._id)}
                                        >
                                            Send Now
                                        </button>
                                    )}

                                    {(campaign.status === 'active' || campaign.status === 'paused') && (
                                        <button
                                            className="btn btn-warning btn-sm"
                                            onClick={() => handleToggleCampaign(campaign._id)}
                                        >
                                            {campaign.status === 'active' ? 'Pause' : 'Resume'}
                                        </button>
                                    )}

                                    <button
                                        className="btn btn-info btn-sm"
                                        onClick={() => setSelectedCampaign(campaign)}
                                    >
                                        View Details
                                    </button>

                                    <button className="btn btn-secondary btn-sm">
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showCreateModal && (
                <CreateCampaignModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchCampaigns();
                    }}
                />
            )}

            {selectedCampaign && (
                <CampaignDetailsModal
                    campaign={selectedCampaign}
                    onClose={() => setSelectedCampaign(null)}
                />
            )}
        </div>
    );
};

const CreateCampaignModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'one-time',
        subject: '',
        content: '',
        recipientType: 'all_students',
        scheduledDate: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

            const response = await fetch(`${apiUrl}/api/email-campaigns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                onSuccess();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error creating campaign:', error);
            alert('Error creating campaign');
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
                    <h3>Create New Campaign</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="campaign-form">
                    <div className="form-group">
                        <label>Campaign Name</label>
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
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="form-control"
                            rows="3"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Campaign Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="form-control"
                            >
                                <option value="one-time">One-time</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="drip">Drip Campaign</option>
                                <option value="recurring">Recurring</option>
                            </select>
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
                                <option value="specific">Specific Emails</option>
                            </select>
                        </div>
                    </div>

                    {formData.type === 'scheduled' && (
                        <div className="form-group">
                            <label>Scheduled Date & Time</label>
                            <input
                                type="datetime-local"
                                name="scheduledDate"
                                value={formData.scheduledDate}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email Subject</label>
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
                        <label>Email Content</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            className="form-control"
                            rows="8"
                            placeholder="Enter your email content here..."
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CampaignDetailsModal = ({ campaign, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content large">
                <div className="modal-header">
                    <h3>{campaign.name}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="campaign-details-content">
                    <div className="details-section">
                        <h4>Campaign Information</h4>
                        <div className="details-grid">
                            <div className="detail-item">
                                <strong>Status:</strong>
                                <span className={`status-badge ${campaign.status}`}>
                                    {campaign.status}
                                </span>
                            </div>
                            <div className="detail-item">
                                <strong>Type:</strong> {campaign.type}
                            </div>
                            <div className="detail-item">
                                <strong>Recipients:</strong> {campaign.recipientType.replace('_', ' ')}
                            </div>
                            <div className="detail-item">
                                <strong>Created:</strong> {new Date(campaign.createdAt).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <div className="details-section">
                        <h4>Email Content</h4>
                        <div className="email-preview">
                            <div className="email-subject">
                                <strong>Subject:</strong> {campaign.subject}
                            </div>
                            <div className="email-content">
                                <div dangerouslySetInnerHTML={{ __html: campaign.content }} />
                            </div>
                        </div>
                    </div>

                    <div className="details-section">
                        <h4>Performance Analytics</h4>
                        <div className="analytics-grid">
                            <div className="analytics-card">
                                <div className="analytics-number">{campaign.analytics.sent}</div>
                                <div className="analytics-label">Emails Sent</div>
                            </div>
                            <div className="analytics-card">
                                <div className="analytics-number">{campaign.analytics.delivered}</div>
                                <div className="analytics-label">Delivered</div>
                            </div>
                            <div className="analytics-card">
                                <div className="analytics-number">{campaign.analytics.opened}</div>
                                <div className="analytics-label">Opened</div>
                            </div>
                            <div className="analytics-card">
                                <div className="analytics-number">{campaign.analytics.clicked}</div>
                                <div className="analytics-label">Clicked</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailCampaigns;