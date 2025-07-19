import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider
} from '@mui/material';
import {
  School,
  People,
  TrendingUp,
  Assignment,
  MenuBook,
  Campaign,
  EventNote
} from '@mui/icons-material';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFaculties: 0,
    totalStudents: 0,
    activeStudents: 0,
    graduatedStudents: 0,
    totalCourses: 0,
    totalAssignments: 0,
    totalAnnouncements: 0,
    recentAttendance: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivities();
    fetchRecentAnnouncements();
  }, []);

  const fetchStats = async () => {
    try {
      const [facultiesRes, studentsRes, coursesRes, assignmentsRes, announcementsRes, attendanceRes] = await Promise.all([
        axios.get('http://localhost:3001/api/faculties'),
        axios.get('http://localhost:3001/api/students'),
        axios.get('http://localhost:3001/api/courses'),
        axios.get('http://localhost:3001/api/assignments'),
        axios.get('http://localhost:3001/api/announcements'),
        axios.get('http://localhost:3001/api/attendance')
      ]);

      const students = studentsRes.data;
      setStats({
        totalFaculties: facultiesRes.data.length,
        totalStudents: students.length,
        activeStudents: students.filter(s => s.status === 'active').length,
        graduatedStudents: students.filter(s => s.status === 'graduated').length,
        totalCourses: coursesRes.data.length,
        totalAssignments: assignmentsRes.data.length,
        totalAnnouncements: announcementsRes.data.length,
        recentAttendance: attendanceRes.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const [assignmentsRes, coursesRes] = await Promise.all([
        axios.get('http://localhost:3001/api/assignments'),
        axios.get('http://localhost:3001/api/courses')
      ]);

      const activities = [];
      
      // Recent assignments
      assignmentsRes.data.slice(0, 3).forEach(assignment => {
        activities.push({
          type: 'assignment',
          title: `New Assignment: ${assignment.title}`,
          subtitle: assignment.course ? `Course: ${assignment.course.courseCode}` : 'No Course Assigned',
          date: assignment.createdAt,
          icon: <Assignment color="primary" />
        });
      });

      // Recent courses
      coursesRes.data.slice(0, 2).forEach(course => {
        activities.push({
          type: 'course',
          title: `Course Added: ${course.title}`,
          subtitle: `Code: ${course.courseCode}`,
          date: course.createdAt,
          icon: <MenuBook color="secondary" />
        });
      });

      setRecentActivities(activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const fetchRecentAnnouncements = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/announcements');
      setRecentAnnouncements(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching recent announcements:', error);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" color={color}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: color, fontSize: 40 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Faculties"
            value={stats.totalFaculties}
            icon={<School />}
            color="primary.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<People />}
            color="secondary.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Students"
            value={stats.activeStudents}
            icon={<TrendingUp />}
            color="success.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Graduated"
            value={stats.graduatedStudents}
            icon={<Assignment />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* Second row of stats */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<MenuBook />}
            color="info.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Assignments"
            value={stats.totalAssignments}
            icon={<Assignment />}
            color="primary.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Announcements"
            value={stats.totalAnnouncements}
            icon={<Campaign />}
            color="secondary.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance Records"
            value={stats.recentAttendance}
            icon={<EventNote />}
            color="success.main"
          />
        </Grid>
      </Grid>

      {/* Recent Activities and Announcements */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {activity.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {activity.subtitle}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(activity.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 4 }}>
                  No recent activities
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Recent Announcements
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
              {recentAnnouncements.length > 0 ? (
                recentAnnouncements.map((announcement) => (
                  <Card key={announcement._id} sx={{ mb: 2 }}>
                    <CardContent sx={{ pb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {announcement.title}
                        </Typography>
                        <Chip 
                          label={announcement.priority.toUpperCase()} 
                          color={
                            announcement.priority === 'urgent' ? 'error' :
                            announcement.priority === 'high' ? 'warning' :
                            announcement.priority === 'medium' ? 'info' : 'default'
                          }
                          size="small" 
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {announcement.content.length > 100 
                          ? `${announcement.content.substring(0, 100)}...` 
                          : announcement.content
                        }
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Chip 
                          label={announcement.targetAudience.replace('_', ' ').toUpperCase()} 
                          variant="outlined" 
                          size="small" 
                        />
                        <Typography variant="caption" color="textSecondary">
                          {new Date(announcement.publishDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 4 }}>
                  No recent announcements
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Welcome to the Comprehensive Learning Management System
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          This advanced LMS provides complete academic management capabilities including:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <School sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">Faculty and Department Management</Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <People sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="body2">Student Enrollment and Tracking</Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <MenuBook sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="body2">Course Creation and Management</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <Assignment sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">Assignment and Assessment Tools</Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <Campaign sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="body2">Announcement and Communication System</Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <EventNote sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="body2">Attendance Tracking and Analytics</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Dashboard;