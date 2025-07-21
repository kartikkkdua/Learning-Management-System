import React, { useState, useEffect } from 'react';
import GradingInterface from './GradingInterface';
import RubricManager from './RubricManager';
import GradeCategoryManager from './GradeCategoryManager';
import GradeAnalytics from './GradeAnalytics';
import TranscriptGenerator from './TranscriptGenerator';
import './AdvancedGradingSystem.css';

const AdvancedGradingSystem = ({ user }) => {
  const [activeTab, setActiveTab] = useState('grading');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourse(data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'grading', label: 'Grade Assignments', icon: '📝' },
    { id: 'rubrics', label: 'Rubric Manager', icon: '📋' },
    { id: 'categories', label: 'Grade Categories', icon: '📊' },
    { id: 'analytics', label: 'Grade Analytics', icon: '📈' },
    { id: 'transcripts', label: 'Transcripts', icon: '🎓' }
  ];

  const renderTabContent = () => {
    if (!selectedCourse) {
      return (
        <div className="no-course-selected">
          <h3>No Course Selected</h3>
          <p>Please select a course to start grading</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'grading':
        return <GradingInterface courseId={selectedCourse} user={user} />;
      case 'rubrics':
        return <RubricManager courseId={selectedCourse} user={user} />;
      case 'categories':
        return <GradeCategoryManager courseId={selectedCourse} user={user} />;
      case 'analytics':
        return <GradeAnalytics courseId={selectedCourse} user={user} />;
      case 'transcripts':
        return <TranscriptGenerator courseId={selectedCourse} user={user} />;
      default:
        return <GradingInterface courseId={selectedCourse} user={user} />;
    }
  };

  return (
    <div className="advanced-grading-system">
      <div className="grading-header">
        <div className="header-content">
          <h1>Advanced Grading System</h1>
          <p>Comprehensive grading with rubrics, categories, and analytics</p>
        </div>
        
        <div className="course-selector">
          <label>Select Course:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="course-select"
            disabled={loading}
          >
            <option value="">Choose a course...</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grading-tabs">
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

      <div className="grading-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading courses...</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};

export default AdvancedGradingSystem;