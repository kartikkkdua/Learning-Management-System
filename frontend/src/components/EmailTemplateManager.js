import React, { useState, useEffect } from 'react';
import './EmailTemplateManager.css';

const EmailTemplateManager = ({ onStatsUpdate }) => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
    fetchVariables();
  }, [selectedCategory, searchTerm]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`${apiUrl}/api/email-templates?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
        if (onStatsUpdate) onStatsUpdate();
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/email-templates/meta/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories([{ value: 'all', label: 'All Categories' }, ...data]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchVariables = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/email-templates/meta/variables`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVariables(data);
      }
    } catch (error) {
      console.error('Error fetching variables:', error);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/email-templates/${templateId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchTemplates();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template');
    }
  };

  const handleDuplicateTemplate = async (templateId) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/email-templates/${templateId}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchTemplates();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Error duplicating template');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      welcome: '#28a745',
      assignment: '#007bff',
      announcement: '#ffc107',
      reminder: '#fd7e14',
      marketing: '#e83e8c',
      system: '#6c757d',
      custom: '#17a2b8'
    };
    return colors[category] || '#6c757d';
  };

  return (
    <div className="email-template-manager">
      <div className="template-manager-header">
        <h2>Email Template Library</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create New Template
        </button>
      </div>

      <div className="template-filters">
        <div className="filter-group">
          <label>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-control"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates..."
            className="form-control"
          />
        </div>
      </div>

      <div className="variables-reference">
        <h3>Available Variables</h3>
        <div className="variables-list">
          {variables.map(variable => (
            <div key={variable.name} className="variable-item">
              <code>[{variable.name}]</code>
              <span className="variable-description">{variable.description}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading templates...</div>
      ) : (
        <div className="templates-grid">
          {templates.length === 0 ? (
            <div className="empty-state">
              <h3>No templates found</h3>
              <p>Create your first email template to get started</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create Template
              </button>
            </div>
          ) : (
            templates.map(template => (
              <div key={template._id} className="template-card">
                <div className="template-header">
                  <div className="template-title">
                    <h3>{template.name}</h3>
                    <div 
                      className="template-category"
                      style={{ backgroundColor: getCategoryColor(template.category) }}
                    >
                      {template.category}
                    </div>
                  </div>
                  {template.isSystem && (
                    <div className="system-badge">System</div>
                  )}
                </div>

                <div className="template-content">
                  <p className="template-description">{template.description}</p>
                  
                  <div className="template-preview">
                    <div className="preview-subject">
                      <strong>Subject:</strong> {template.subject}
                    </div>
                    <div className="preview-content">
                      {template.content.substring(0, 150)}...
                    </div>
                  </div>

                  <div className="template-stats">
                    <div className="stat-item">
                      <span className="stat-number">{template.usageCount || 0}</span>
                      <span className="stat-label">Uses</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{template.variables?.length || 0}</span>
                      <span className="stat-label">Variables</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-date">
                        {template.lastUsed ? 
                          new Date(template.lastUsed).toLocaleDateString() : 
                          'Never'
                        }
                      </span>
                      <span className="stat-label">Last Used</span>
                    </div>
                  </div>
                </div>

                <div className="template-actions">
                  <button 
                    className="btn btn-info btn-sm"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    Preview
                  </button>
                  
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDuplicateTemplate(template._id)}
                  >
                    Duplicate
                  </button>

                  {!template.isSystem && (
                    <>
                      <button className="btn btn-warning btn-sm">
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteTemplate(template._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showCreateModal && (
        <CreateTemplateModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTemplates();
          }}
          categories={categories.filter(c => c.value !== 'all')}
          variables={variables}
        />
      )}

      {selectedTemplate && (
        <TemplatePreviewModal 
          template={selectedTemplate}
          variables={variables}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
};

const CreateTemplateModal = ({ onClose, onSuccess, categories, variables }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'custom',
    subject: '',
    content: '',
    variables: []
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/email-templates`, {
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
      console.error('Error creating template:', error);
      alert('Error creating template');
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

  const insertVariable = (variableName) => {
    const textarea = document.querySelector('textarea[name="content"]');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    setFormData({
      ...formData,
      content: before + `[${variableName}]` + after
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>Create New Template</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="template-form">
          <div className="form-row">
            <div className="form-group">
              <label>Template Name</label>
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
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-control"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              rows="2"
            />
          </div>

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
            <div className="content-editor">
              <div className="variables-toolbar">
                <span>Quick Insert:</span>
                {variables.slice(0, 6).map(variable => (
                  <button
                    key={variable.name}
                    type="button"
                    className="variable-btn"
                    onClick={() => insertVariable(variable.name)}
                  >
                    [{variable.name}]
                  </button>
                ))}
              </div>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                className="form-control content-textarea"
                rows="12"
                placeholder="Enter your email content here. Use variables like [NAME], [COURSE_NAME], etc."
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TemplatePreviewModal = ({ template, variables, onClose }) => {
  const [previewData, setPreviewData] = useState({
    subject: template.subject,
    content: template.content
  });
  const [variableValues, setVariableValues] = useState({});

  const handleVariableChange = (variableName, value) => {
    const newValues = { ...variableValues, [variableName]: value };
    setVariableValues(newValues);

    // Update preview
    let processedSubject = template.subject;
    let processedContent = template.content;

    Object.keys(newValues).forEach(key => {
      const placeholder = new RegExp(`\\[${key}\\]`, 'g');
      processedSubject = processedSubject.replace(placeholder, newValues[key] || '');
      processedContent = processedContent.replace(placeholder, newValues[key] || '');
    });

    setPreviewData({
      subject: processedSubject,
      content: processedContent
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>Template Preview: {template.name}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="template-preview-content">
          <div className="preview-controls">
            <h4>Variable Values (for preview)</h4>
            <div className="variables-form">
              {variables.map(variable => (
                <div key={variable.name} className="variable-input">
                  <label>[{variable.name}]</label>
                  <input
                    type="text"
                    placeholder={variable.example}
                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                    className="form-control"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="preview-display">
            <h4>Email Preview</h4>
            <div className="email-preview">
              <div className="email-subject">
                <strong>Subject:</strong> {previewData.subject}
              </div>
              <div className="email-content">
                <div dangerouslySetInnerHTML={{ __html: previewData.content.replace(/\n/g, '<br>') }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateManager;