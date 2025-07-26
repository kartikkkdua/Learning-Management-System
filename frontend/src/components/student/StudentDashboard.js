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
  Avatar
} from '@mui/material';
import {
  MenuBook,
  Assignment,
  Grade,
  EventNote,
  Schedule,
} from '@mui/icons-material';
import axios from 'axios';

const StudentDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState({
    enrolledCourses: [],
    recentAssignments: [],
    recentAnnouncements: [],
    attendanceStats: {},
    gradeStats: {},
    upcomingDeadlines: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const studentId = user.id || user._id;
      
      // Fetch student's enrolled courses using the enrollment system
      const enrollmentRes = await axios.get(`http://localhost:3001/api/enrollments/student/${studentId}`);
      const enrolledCourses = enrollmentRes.data.enrolledCourses || [];
      const totalCredits = enrollmentRes.data.totalCredits || 0;

      // Fetch student's assignments
      const assignmentsRes = await axios.get(`http://localhost:3001/api/students/${studentId}/assignments`);
      const recentAssignments = assignmentsRes.data;

      // Fetch student's grades
      const gradesRes = await axios.get(`http://localhost:3001/api/students/${studentId}/grades`);
      const grades = gradesRes.data;

      // Fetch student's attendance
      const attendanceRes = await axios.get(`http://localhost:3001/api/students/${studentId}/attendance`);
      const attendanceData = attendanceRes.data;

      // Fetch relevant announcements
      const announcementsRes = await axios.get('http://localhost:3001/api/announcements');
      const allAnnouncements = announcementsRes.data;
      const recentAnnouncements = allAnnouncements.filter(announcement => 
        announcement.targetAudience === 'all' || 
        announcement.targetAudience === 'students' ||
        (announcement.targetAudience === 'specific_course' && 
         enrolledCourses.some(course => course._id === announcement.course?._id))
      ).slice(0, 3);

      // Calculate attendance stats
      const totalClasses = attendanceData.reduce((sum, course) => sum + course.totalClasses, 0);
      const attendedClasses = attendanceData.reduce((sum, course) => sum + course.present + course.late + course.excused, 0);
      const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

      // Calculate grade stats
      const totalAssignments = recentAssignments.length;
      const completedAssignments = recentAssignments.filter(assignment => 
        assignment.submissions?.some(sub => sub.student === studentId)
      ).length;
      const pendingAssignments = totalAssignments - completedAssignments;

      // Calculate GPA
      let totalGradePoints = 0;
      let totalCreditHours = 0;
      grades.forEach(courseGrade => {
        if (courseGrade.percentage > 0) {
          const gradePoint = getGradePoint(courseGrade.percentage);
          totalGradePoints += gradePoint * courseGrade.course.credits;
          totalCreditHours += courseGrade.course.credits;
        }
      });
      const gpa = totalCreditHours > 0 ? totalGradePoints / totalCreditHours : 0;

      // Get upcoming deadlines
      const now = new Date();
      const upcomingDeadlines = recentAssignments
        .filter(assignment => new Date(assignment.dueDate) > now)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3);

      setDashboardData({
        enrolledCourses,
        recentAssignments,
        recentAnnouncements,
        attendanceStats: {
          totalClasses,
          attended: attendedClasses,
          percentage: attendancePercentage.toFixed(1)
        },
        gradeStats: {
          gpa: gpa.toFixed(1),
          totalCredits,
          completedAssignments,
          pendingAssignments
        },
        upcomingDeadlines
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to empty data
      setDashboardData({
        enrolledCourses: [],
        recentAssignments: [],
        recentAnnouncements: [],
        attendanceStats: { totalClasses: 0, attended: 0, percentage: 0 },
        gradeStats: { gpa: 0, totalCredits: 0, completedAssignments: 0, pendingAssignments: 0 },
        upcomingDeadlines: []
      });
    }
  };

  const getGradePoint = (percentage) => {
    if (percentage >= 90) return 4.0;
    if (percentage >= 85) return 3.7;
    if (percentage >= 80) return 3.3;
    if (percentage >= 75) return 3.0;
    if (percentage >= 70) return 2.7;
    if (percentage >= 65) return 2.3;
    if (percentage >= 60) return 2.0;
    if (percentage >= 55) return 1.7;
    if (percentage >= 50) return 1.0;
    return 0.0;
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
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
          {(user?.profile?.firstName?.[0] || user?.username?.[0] || 'S').toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.profile?.firstName || user?.username}!
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Student ID: {user?.studentId || 'STU001'} | {user?.profile?.email || user?.email}
          </Typography>
        </Box>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Enrolled Courses"
            value={dashboardData.enrolledCourses.length}
            icon={<MenuBook />}
            color="primary.main"
            subtitle="This semester"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Current GPA"
            value={dashboardData.gradeStats.gpa}
            icon={<Grade />}
            color="success.main"
            subtitle="Out of 4.0"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance"
            value={`${dashboardData.attendanceStats.percentage}%`}
            icon={<EventNote />}
            color="info.main"
            subtitle={`${dashboardData.attendanceStats.attended}/${dashboardData.attendanceStats.totalClasses} classes`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Tasks"
            value={dashboardData.gradeStats.pendingAssignments}
            icon={<Assignment />}
            color="warning.main"
            subtitle="Assignments due"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Enrolled Courses */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              My Courses
            </Typography>
            <List sx={{ maxHeight: '320px', overflow: 'auto' }}>
              {dashboardData.enrolledCourses.map((course) => (
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
                        <Chip 
                          label={`${course.semester} ${course.year}`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Assignments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Recent Assignments
            </Typography>
            <List sx={{ maxHeight: '320px', overflow: 'auto' }}>
              {dashboardData.recentAssignments.map((assignment) => (
                <ListItem key={assignment._id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Assignment color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={assignment.title}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {assignment.course ? assignment.course.courseCode : 'Unknown Course'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <Chip 
                    label={assignment.type.toUpperCase()} 
                    size="small" 
                    color="primary"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '300px' }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Deadlines
            </Typography>
            <List sx={{ maxHeight: '220px', overflow: 'auto' }}>
              {dashboardData.upcomingDeadlines.map((assignment) => (
                <ListItem key={assignment._id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Schedule color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={assignment.title}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {assignment.course ? assignment.course.courseCode : 'Unknown Course'}
                        </Typography>
                        <Typography variant="caption" color="error">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Announcements */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '300px' }}>
            <Typography variant="h6" gutterBottom>
              Recent Announcements
            </Typography>
            <Box sx={{ maxHeight: '220px', overflow: 'auto' }}>
              {dashboardData.recentAnnouncements.map((announcement) => (
                <Card key={announcement._id} sx={{ mb: 2 }}>
                  <CardContent sx={{ pb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="subtitle2" fontWeight="bold">
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
                    <Typography variant="body2" color="textSecondary">
                      {announcement.content.length > 80 
                        ? `${announcement.content.substring(0, 80)}...` 
                        : announcement.content
                      }
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                      {new Date(announcement.publishDate).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Progress Overview */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Academic Progress Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="body2" gutterBottom>
                Overall Attendance
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={dashboardData.attendanceStats.percentage} 
                sx={{ height: 8, borderRadius: 4 }}
                color="success"
              />
              <Typography variant="caption" color="textSecondary">
                {dashboardData.attendanceStats.percentage}% attendance rate
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="body2" gutterBottom>
                Assignment Completion
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(dashboardData.gradeStats.completedAssignments / (dashboardData.gradeStats.completedAssignments + dashboardData.gradeStats.pendingAssignments)) * 100} 
                sx={{ height: 8, borderRadius: 4 }}
                color="primary"
              />
              <Typography variant="caption" color="textSecondary">
                {dashboardData.gradeStats.completedAssignments} of {dashboardData.gradeStats.completedAssignments + dashboardData.gradeStats.pendingAssignments} completed
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="body2" gutterBottom>
                Credit Progress
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(dashboardData.gradeStats.totalCredits / 120) * 100} 
                sx={{ height: 8, borderRadius: 4 }}
                color="info"
              />
              <Typography variant="caption" color="textSecondary">
                {dashboardData.gradeStats.totalCredits} of 120 credits completed
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default StudentDashboard;