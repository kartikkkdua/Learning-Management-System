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
  LinearProgress,
  Avatar,
  Button
} from '@mui/material';
import QuickNotificationWidget from '../notification/QuickNotificationWidget';
import FacultyApprovalStatus from './FacultyApprovalStatus';
import {
  MenuBook,
  People,
  Assignment,
  Grade,
  EventNote,
  Campaign,
  Schedule,
  TrendingUp,
  CheckCircle,
  Warning,
  Forum
} from '@mui/icons-material';
import axios from 'axios';

const FacultyDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState({
    myCourses: [],
    totalStudents: 0,
    pendingAssignments: [],
    recentGrades: [],
    upcomingClasses: [],
    courseStats: [],
    recentDiscussions: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      // Fetch faculty's courses (filtered by backend for this faculty member)
      const coursesRes = await axios.get('http://localhost:3001/api/courses/my-courses', config);
      const myCourses = coursesRes.data || [];

      // Calculate total students across all courses
      const totalStudents = myCourses.reduce((sum, course) =>
        sum + (course.enrolledStudents?.length || 0), 0
      );

      // Fetch assignments for faculty's courses (now filtered by backend)
      let pendingAssignments = [];
      try {
        const assignmentsRes = await axios.get('http://localhost:3001/api/assignments', config);
        pendingAssignments = assignmentsRes.data || [];
      } catch (error) {
        console.log('Error fetching assignments:', error.message);
      }

      // Generate course statistics
      const courseStats = myCourses.map(course => ({
        courseCode: course.courseCode,
        title: course.title,
        enrolled: course.enrolledStudents?.length || 0,
        capacity: course.capacity,
        percentage: ((course.enrolledStudents?.length || 0) / course.capacity) * 100
      }));

      // Generate upcoming classes (mock data for now)
      const upcomingClasses = myCourses.flatMap(course => {
        if (course.schedule?.days) {
          return course.schedule.days.map(day => ({
            courseCode: course.courseCode,
            title: course.title,
            day,
            time: `${course.schedule.startTime} - ${course.schedule.endTime}`,
            room: course.schedule.room
          }));
        }
        return [];
      }).slice(0, 5);

      setDashboardData({
        myCourses,
        totalStudents,
        pendingAssignments: pendingAssignments.slice(0, 5),
        recentGrades: [], // Would be populated from grades API
        upcomingClasses,
        courseStats,
        recentDiscussions: [] // Would be populated from discussions API
      });

    } catch (error) {
      console.error('Error fetching faculty dashboard data:', error);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, action }) => (
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
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {action && (
              <Button size="small" sx={{ mt: 1 }}>
                {action}
              </Button>
            )}
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
      <FacultyApprovalStatus user={user} />
      
      <Box display="flex" alignItems="center" mb={4}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: 'primary.main',
            mr: 3,
            fontSize: '1.5rem'
          }}
        >
          {(user?.profile?.firstName?.[0] || user?.username?.[0] || 'F').toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome, {user?.profile?.firstName || user?.username}!
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Faculty Member | {user?.profile?.email || user?.email}
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="My Courses"
            value={dashboardData.myCourses.length}
            icon={<MenuBook />}
            color="primary.main"
            subtitle="This semester"
            action="View All"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={dashboardData.totalStudents}
            icon={<People />}
            color="success.main"
            subtitle="Across all courses"
            action="View Students"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Assignments"
            value={dashboardData.pendingAssignments.length}
            icon={<Assignment />}
            color="warning.main"
            subtitle="Need grading"
            action="Grade Now"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Discussions"
            value={dashboardData.recentDiscussions.length}
            icon={<Forum />}
            color="info.main"
            subtitle="Active discussions"
            action="View All"
          />
        </Grid>
      </Grid>

      {/* Quick Notification Widget */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <QuickNotificationWidget user={user} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* My Courses */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              My Courses
            </Typography>
            <List sx={{ maxHeight: '320px', overflow: 'auto' }}>
              {dashboardData.myCourses.map((course) => (
                <ListItem key={course._id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <MenuBook color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={course.title}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {course.courseCode} • {course.credits} Credits
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <Typography variant="caption">
                            {course.enrolledStudents?.length || 0}/{course.capacity} students
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={((course.enrolledStudents?.length || 0) / course.capacity) * 100}
                            sx={{ flexGrow: 1, height: 4, borderRadius: 2 }}
                          />
                        </Box>
                      </Box>
                    }
                  />
                  <Chip
                    label={`${course.semester} ${course.year}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </List>

            {dashboardData.myCourses.length === 0 && (
              <Box textAlign="center" py={4}>
                <MenuBook sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="textSecondary">
                  No courses assigned yet
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Upcoming Classes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Classes
            </Typography>
            <List sx={{ maxHeight: '320px', overflow: 'auto' }}>
              {dashboardData.upcomingClasses.map((classItem, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Schedule color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={classItem.courseCode}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {classItem.title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {classItem.day} • {classItem.time}
                        </Typography>
                        {classItem.room && (
                          <Typography variant="caption" display="block">
                            Room: {classItem.room}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>

            {dashboardData.upcomingClasses.length === 0 && (
              <Box textAlign="center" py={4}>
                <Schedule sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="textSecondary">
                  No upcoming classes scheduled
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Pending Assignments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '300px' }}>
            <Typography variant="h6" gutterBottom>
              Assignments Needing Review
            </Typography>
            <List sx={{ maxHeight: '220px', overflow: 'auto' }}>
              {dashboardData.pendingAssignments.map((assignment, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Assignment color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={assignment.title || `Assignment ${index + 1}`}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          Course: {assignment.course?.courseCode || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="error">
                          Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                        </Typography>
                      </Box>
                    }
                  />
                  <Chip
                    label="PENDING"
                    size="small"
                    color="warning"
                  />
                </ListItem>
              ))}
            </List>

            {dashboardData.pendingAssignments.length === 0 && (
              <Box textAlign="center" py={4}>
                <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="body2" color="textSecondary">
                  All assignments reviewed!
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '300px' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Assignment />}
                  sx={{ mb: 2 }}
                >
                  Create Assignment
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Campaign />}
                  sx={{ mb: 2 }}
                >
                  Post Announcement
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EventNote />}
                  sx={{ mb: 2 }}
                >
                  Take Attendance
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Grade />}
                  sx={{ mb: 2 }}
                >
                  Enter Grades
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Forum />}
                  sx={{ mb: 2 }}
                >
                  View Discussions
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<People />}
                  sx={{ mb: 2 }}
                >
                  View Students
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FacultyDashboard;