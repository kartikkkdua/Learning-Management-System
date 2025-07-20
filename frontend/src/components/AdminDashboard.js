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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import QuickNotificationWidget from './QuickNotificationWidget';
import {
  People,
  MenuBook,
  PersonAdd,
  School,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  Assessment,
  Notifications,
  Group,
  SupervisorAccount
} from '@mui/icons-material';
import axios from 'axios';

const AdminDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    recentEnrollments: [],
    systemAlerts: [],
    enrollmentStats: {},
    recentUsers: [],
    courseStats: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch multiple data sources
      const [
        usersRes,
        studentsRes,
        coursesRes,
        enrollmentsRes,
        enrollmentStatsRes
      ] = await Promise.all([
        axios.get('http://localhost:3001/api/auth/users').catch(() => ({ data: [] })),
        axios.get('http://localhost:3001/api/students').catch(() => ({ data: [] })),
        axios.get('http://localhost:3001/api/courses').catch(() => ({ data: [] })),
        axios.get('http://localhost:3001/api/enrollments').catch(() => ({ data: [] })),
        axios.get('http://localhost:3001/api/enrollments/stats').catch(() => ({ data: {} }))
      ]);

      const users = usersRes.data || [];
      const students = studentsRes.data || [];
      const courses = coursesRes.data || [];
      const enrollments = enrollmentsRes.data || [];
      const enrollmentStats = enrollmentStatsRes.data || {};

      // Calculate faculty count
      const faculty = users.filter(user => user.role === 'faculty');

      // Get recent enrollments (last 10)
      const recentEnrollments = enrollments
        .sort((a, b) => new Date(b.enrolledAt || b.createdAt) - new Date(a.enrolledAt || a.createdAt))
        .slice(0, 10);

      // Get recent users (last 10)
      const recentUsers = users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      // Generate system alerts
      const systemAlerts = [];
      
      // Check for courses at capacity
      const fullCourses = courses.filter(course => 
        course.enrolledStudents?.length >= course.capacity
      );
      if (fullCourses.length > 0) {
        systemAlerts.push({
          type: 'warning',
          message: `${fullCourses.length} course(s) are at full capacity`,
          action: 'View Courses'
        });
      }

      // Check for low enrollment courses
      const lowEnrollmentCourses = courses.filter(course => 
        (course.enrolledStudents?.length || 0) < course.capacity * 0.3
      );
      if (lowEnrollmentCourses.length > 0) {
        systemAlerts.push({
          type: 'info',
          message: `${lowEnrollmentCourses.length} course(s) have low enrollment`,
          action: 'View Enrollments'
        });
      }

      // Course statistics
      const courseStats = courses.map(course => ({
        courseCode: course.courseCode,
        title: course.title,
        enrolled: course.enrolledStudents?.length || 0,
        capacity: course.capacity,
        percentage: ((course.enrolledStudents?.length || 0) / course.capacity) * 100
      })).sort((a, b) => b.percentage - a.percentage).slice(0, 5);

      setDashboardData({
        totalUsers: users.length,
        totalStudents: students.length,
        totalFaculty: faculty.length,
        totalCourses: courses.length,
        totalEnrollments: enrollments.length,
        recentEnrollments,
        systemAlerts,
        enrollmentStats,
        recentUsers,
        courseStats
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
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
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUp fontSize="small" color="success" />
                <Typography variant="caption" color="success.main" ml={0.5}>
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ color: color, fontSize: 40 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Warning color="error" />;
      case 'success': return <CheckCircle color="success" />;
      default: return <Notifications color="info" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'success': return 'success';
      default: return 'info';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
          {(user?.profile?.firstName?.[0] || user?.username?.[0] || 'A').toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome, {user?.profile?.firstName || user?.username}!
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            System Administrator | {user?.profile?.email || user?.email}
          </Typography>
        </Box>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={dashboardData.totalUsers}
            icon={<People />}
            color="primary.main"
            subtitle="All system users"
            trend="+12% this month"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Students"
            value={dashboardData.totalStudents}
            icon={<Group />}
            color="success.main"
            subtitle="Active students"
            trend="+8% this month"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Faculty"
            value={dashboardData.totalFaculty}
            icon={<SupervisorAccount />}
            color="info.main"
            subtitle="Teaching staff"
            trend="+3% this month"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Courses"
            value={dashboardData.totalCourses}
            icon={<MenuBook />}
            color="warning.main"
            subtitle="Active courses"
            trend="+5% this semester"
          />
        </Grid>
      </Grid>

      {/* System Alerts */}
      {dashboardData.systemAlerts.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            System Alerts
          </Typography>
          <List>
            {dashboardData.systemAlerts.map((alert, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {getAlertIcon(alert.type)}
                </ListItemIcon>
                <ListItemText
                  primary={alert.message}
                  secondary={alert.action}
                />
                <Chip 
                  label={alert.type.toUpperCase()}
                  color={getAlertColor(alert.type)}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Quick Notification Widget */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <QuickNotificationWidget user={user} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Enrollments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Recent Enrollments
            </Typography>
            <List sx={{ maxHeight: '320px', overflow: 'auto' }}>
              {dashboardData.recentEnrollments.map((enrollment, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <PersonAdd color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${enrollment.student?.firstName || 'Unknown'} ${enrollment.student?.lastName || 'Student'}`}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {enrollment.course?.courseCode || 'Unknown Course'} - {enrollment.course?.title || ''}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(enrollment.enrolledAt || enrollment.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Course Enrollment Statistics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Top Enrolled Courses
            </Typography>
            <List sx={{ maxHeight: '320px', overflow: 'auto' }}>
              {dashboardData.courseStats.map((course, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <MenuBook color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={course.courseCode}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {course.title}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <LinearProgress 
                            variant="determinate" 
                            value={course.percentage} 
                            sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                            color={course.percentage >= 90 ? 'error' : course.percentage >= 70 ? 'warning' : 'primary'}
                          />
                          <Typography variant="caption">
                            {course.enrolled}/{course.capacity}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '300px' }}>
            <Typography variant="h6" gutterBottom>
              Recent User Registrations
            </Typography>
            <List sx={{ maxHeight: '220px', overflow: 'auto' }}>
              {dashboardData.recentUsers.map((user, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {(user.profile?.firstName?.[0] || user.username?.[0] || 'U').toUpperCase()}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={`${user.profile?.firstName || ''} ${user.profile?.lastName || ''} (${user.username})`}
                    secondary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={user.role.toUpperCase()}
                          size="small"
                          color={user.role === 'admin' ? 'error' : user.role === 'faculty' ? 'primary' : 'default'}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* System Statistics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '300px' }}>
            <Typography variant="h6" gutterBottom>
              System Overview
            </Typography>
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2">Total Enrollments</Typography>
                <Typography variant="h6" color="primary">
                  {dashboardData.totalEnrollments}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2">Average Enrollment per Course</Typography>
                <Typography variant="h6" color="info.main">
                  {(dashboardData.enrollmentStats.averageEnrollmentPerCourse || 0).toFixed(1)}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2">Courses at Capacity</Typography>
                <Typography variant="h6" color="warning.main">
                  {dashboardData.enrollmentStats.coursesAtCapacity || 0}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">Low Enrollment Courses</Typography>
                <Typography variant="h6" color="error.main">
                  {dashboardData.enrollmentStats.coursesWithLowEnrollment || 0}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;