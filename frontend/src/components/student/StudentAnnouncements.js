import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Paper,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Campaign,
  School,
  MenuBook,
  Person,
  Schedule
} from '@mui/icons-material';
import axios from 'axios';

const StudentAnnouncements = ({ user }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const studentId = user.id || user._id;
      
      // First get student's enrolled courses using enrollment system
      const enrollmentRes = await axios.get(`http://localhost:3001/api/enrollments/student/${studentId}`);
      const enrolledCourses = enrollmentRes.data.enrolledCourses || [];
      const enrolledCourseIds = enrolledCourses.map(course => course._id);
      
      // Then get all announcements
      const response = await axios.get('http://localhost:3001/api/announcements');
      
      // Filter announcements relevant to this student
      const studentAnnouncements = response.data.filter(announcement => {
        // Include announcements for all users or students
        if (announcement.targetAudience === 'all' || announcement.targetAudience === 'students') {
          return true;
        }
        
        // Include course-specific announcements if student is enrolled in that course
        if (announcement.targetAudience === 'specific_course' && announcement.course) {
          return enrolledCourseIds.includes(announcement.course._id);
        }
        
        // Include faculty-specific announcements if student belongs to that faculty
        if (announcement.targetAudience === 'specific_faculty' && announcement.faculty) {
          // This would need student's faculty info - for now, include all
          return true;
        }
        
        return false;
      });
      
      setAnnouncements(studentAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]); // Fallback to empty array
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getAudienceIcon = (audience) => {
    switch (audience) {
      case 'all': return <Campaign />;
      case 'students': return <Person />;
      case 'specific_course': return <MenuBook />;
      case 'specific_faculty': return <School />;
      default: return <Campaign />;
    }
  };

  const filterAnnouncements = () => {
    const now = new Date();
    switch (selectedTab) {
      case 0: return announcements; // All
      case 1: return announcements.filter(a => a.priority === 'urgent' || a.priority === 'high'); // Important
      case 2: return announcements.filter(a => a.targetAudience === 'specific_course'); // Course-specific
      case 3: return announcements.filter(a => {
        // Recent (last 7 days)
        const publishDate = new Date(a.publishDate);
        const daysDiff = (now - publishDate) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      });
      default: return announcements;
    }
  };

  const filteredAnnouncements = filterAnnouncements();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Announcements
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          sx={{ px: 2 }}
        >
          <Tab label={`All (${announcements.length})`} />
          <Tab label="Important" />
          <Tab label="Course-specific" />
          <Tab label="Recent" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {filteredAnnouncements.map((announcement) => (
          <Grid item xs={12} md={6} lg={4} key={announcement._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {announcement.title}
                  </Typography>
                  <Chip 
                    label={announcement.priority.toUpperCase()} 
                    color={getPriorityColor(announcement.priority)} 
                    size="small" 
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {announcement.content}
                </Typography>

                <Box display="flex" gap={1} mb={2}>
                  <Chip 
                    label={announcement.targetAudience.replace('_', ' ').toUpperCase()} 
                    icon={getAudienceIcon(announcement.targetAudience)}
                    size="small" 
                    variant="outlined"
                  />
                  {announcement.course && (
                    <Chip 
                      label={announcement.course.courseCode} 
                      variant="outlined" 
                      size="small" 
                    />
                  )}
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(announcement.publishDate).toLocaleDateString()}
                  </Typography>
                  {announcement.expiryDate && (
                    <>
                      <Typography variant="caption" color="text.secondary">
                        • Expires: {new Date(announcement.expiryDate).toLocaleDateString()}
                      </Typography>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {filteredAnnouncements.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Campaign sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Announcements Found
          </Typography>
          <Typography color="textSecondary">
            {selectedTab === 0 ? 
              "There are no announcements at this time." :
              `No ${['all', 'important', 'course-specific', 'recent'][selectedTab]} announcements found.`
            }
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default StudentAnnouncements;