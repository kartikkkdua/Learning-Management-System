import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  IconButton,
  Badge,
  Divider
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  Grade,
  Schedule,
  Forum,
  Notifications,
  Settings,
  Book,
  VideoCall,
  Download,
  TrendingUp,
  CheckCircle,
  Warning,
  AccessTime
} from '@mui/icons-material';

const StudentPortal = ({ user, onLogout }) => {
  const studentData = {
    name: user?.profile?.firstName && user?.profile?.lastName 
      ? `${user.profile.firstName} ${user.profile.lastName}` 
      : user?.username || 'Student',
    email: user?.email || 'student@university.edu',
    studentId: user?.studentId || 'STU001234',
    avatar: user?.avatar || '/api/placeholder/80/80',
    program: user?.profile?.program || 'Computer Science',
    year: user?.profile?.year || 'Junior',
    gpa: user?.profile?.gpa || 3.75
  };

  const [courses] = useState([
    {
      id: 1,
      name: 'Data Structures & Algorithms',
      code: 'CS301',
      instructor: 'Dr. Sarah Johnson',
      progress: 75,
      grade: 'A-',
      nextClass: '2024-01-15T10:00:00',
      assignments: 3,
      color: '#1976d2'
    },
    {
      id: 2,
      name: 'Database Systems',
      code: 'CS350',
      instructor: 'Prof. Michael Chen',
      progress: 60,
      grade: 'B+',
      nextClass: '2024-01-15T14:00:00',
      assignments: 2,
      color: '#2e7d32'
    },
    {
      id: 3,
      name: 'Software Engineering',
      code: 'CS400',
      instructor: 'Dr. Emily Rodriguez',
      progress: 85,
      grade: 'A',
      nextClass: '2024-01-16T09:00:00',
      assignments: 1,
      color: '#ed6c02'
    },
    {
      id: 4,
      name: 'Machine Learning',
      code: 'CS450',
      instructor: 'Dr. David Kim',
      progress: 45,
      grade: 'B',
      nextClass: '2024-01-16T11:00:00',
      assignments: 4,
      color: '#9c27b0'
    }
  ]);

  const [assignments] = useState([
    {
      id: 1,
      title: 'Binary Search Tree Implementation',
      course: 'CS301',
      dueDate: '2024-01-18T23:59:00',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Database Design Project',
      course: 'CS350',
      dueDate: '2024-01-20T23:59:00',
      status: 'in-progress',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Software Requirements Document',
      course: 'CS400',
      dueDate: '2024-01-22T23:59:00',
      status: 'completed',
      priority: 'low'
    },
    {
      id: 4,
      title: 'Neural Network Analysis',
      course: 'CS450',
      dueDate: '2024-01-25T23:59:00',
      status: 'pending',
      priority: 'high'
    }
  ]);

  const [announcements] = useState([
    {
      id: 1,
      title: 'Midterm Exam Schedule Released',
      course: 'CS301',
      date: '2024-01-14T09:00:00',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Guest Lecture on AI Ethics',
      course: 'CS450',
      date: '2024-01-13T14:00:00',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Project Submission Guidelines Updated',
      course: 'CS400',
      date: '2024-01-12T16:00:00',
      priority: 'low'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#d32f2f';
      case 'medium': return '#ed6c02';
      case 'low': return '#2e7d32';
      default: return '#757575';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Student Portal
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton>
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
              <IconButton onClick={onLogout}>
                <Settings />
              </IconButton>
              <Avatar src={studentData.avatar} sx={{ width: 40, height: 40 }}>
                {studentData.name.charAt(0)}
              </Avatar>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Welcome Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Avatar src={studentData.avatar} sx={{ width: 80, height: 80 }}>
                    {studentData.name.charAt(0)}
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    Welcome back, {studentData.name}!
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                    {studentData.program} • {studentData.year} • GPA: {studentData.gpa}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    Student ID: {studentData.studentId} • {studentData.email}
                  </Typography>
                </Grid>
                <Grid item>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {courses.length}
                    </Typography>
                    <Typography variant="body1">
                      Active Courses
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <Assignment sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {assignments.filter(a => a.status === 'pending').length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Pending Assignments
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <Grade sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {studentData.gpa}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Current GPA
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {Math.round(courses.reduce((acc, course) => acc + course.progress, 0) / courses.length)}%
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Avg Progress
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <Schedule sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                    3
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Classes Today
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Current Courses */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Book sx={{ color: 'primary.main' }} />
                My Courses
              </Typography>
              <Grid container spacing={3}>
                {courses.map((course) => (
                  <Grid item xs={12} sm={6} key={course.id}>
                    <Card
                      sx={{
                        border: `2px solid ${course.color}15`,
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: course.color }}>
                              {course.code}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {course.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {course.instructor}
                            </Typography>
                          </Box>
                          <Chip
                            label={course.grade}
                            sx={{
                              bgcolor: `${course.color}15`,
                              color: course.color,
                              fontWeight: 600
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Progress</Typography>
                            <Typography variant="body2">{course.progress}%</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={course.progress}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: `${course.color}15`,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: course.color,
                                borderRadius: 3
                              }
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Next: {formatDate(course.nextClass)}
                          </Typography>
                          <Badge badgeContent={course.assignments} color="error">
                            <Assignment sx={{ color: 'text.secondary' }} />
                          </Badge>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Upcoming Assignments */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assignment sx={{ color: 'primary.main' }} />
                Upcoming Assignments
              </Typography>
              <List>
                {assignments.map((assignment, index) => (
                  <React.Fragment key={assignment.id}>
                    <ListItem
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: assignment.status === 'completed' ? '#f1f8e9' : 'white'
                      }}
                    >
                      <ListItemIcon>
                        {assignment.status === 'completed' ? (
                          <CheckCircle sx={{ color: 'success.main' }} />
                        ) : getDaysUntilDue(assignment.dueDate) <= 2 ? (
                          <Warning sx={{ color: 'error.main' }} />
                        ) : (
                          <AccessTime sx={{ color: 'warning.main' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {assignment.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip
                                label={assignment.course}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={assignment.status}
                                size="small"
                                color={getStatusColor(assignment.status)}
                              />
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            Due: {formatDate(assignment.dueDate)} 
                            {getDaysUntilDue(assignment.dueDate) > 0 && assignment.status !== 'completed' && (
                              <span style={{ color: getDaysUntilDue(assignment.dueDate) <= 2 ? '#d32f2f' : '#ed6c02' }}>
                                {' '}({getDaysUntilDue(assignment.dueDate)} days left)
                              </span>
                            )}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Quick Actions */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<VideoCall />}
                    sx={{ py: 1.5 }}
                  >
                    Join Class
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Forum />}
                    sx={{ py: 1.5 }}
                  >
                    Discussions
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Grade />}
                    sx={{ py: 1.5 }}
                  >
                    View Grades
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Download />}
                    sx={{ py: 1.5 }}
                  >
                    Resources
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Recent Announcements */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Notifications sx={{ color: 'primary.main' }} />
                Recent Announcements
              </Typography>
              <List dense>
                {announcements.map((announcement, index) => (
                  <React.Fragment key={announcement.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {announcement.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {announcement.course}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(announcement.date)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < announcements.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default StudentPortal;