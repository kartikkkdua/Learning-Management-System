import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import {
  HourglassEmpty,
  Schedule,
  People,
  CheckCircle,
  Warning,
  Info,
  School,
  TrendingUp
} from '@mui/icons-material';
import axios from 'axios';

const StudentWaitlist = ({ user }) => {
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, course: null, action: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWaitlistEntries();
    fetchAvailableCourses();
  }, [user]);

  const fetchWaitlistEntries = async () => {
    try {
      const studentId = user.id || user._id;
      const response = await axios.get(`http://localhost:3001/api/waitlist/student/${studentId}`);
      setWaitlistEntries(response.data);
    } catch (error) {
      console.error('Error fetching waitlist entries:', error);
      setWaitlistEntries([]);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/courses');
      // Filter courses that are at capacity
      const fullCourses = response.data.filter(course => 
        course.enrolledStudents?.length >= course.capacity
      );
      setAvailableCourses(fullCourses);
    } catch (error) {
      console.error('Error fetching available courses:', error);
      setAvailableCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const joinWaitlist = async (courseId) => {
    try {
      const studentId = user.id || user._id;
      await axios.post('http://localhost:3001/api/waitlist/join', {
        studentId,
        courseId
      });
      
      // Refresh data
      await fetchWaitlistEntries();
      await fetchAvailableCourses();
      
      setConfirmDialog({ open: false, course: null, action: null });
    } catch (error) {
      console.error('Error joining waitlist:', error);
      alert(error.response?.data?.message || 'Failed to join waitlist');
    }
  };

  const leaveWaitlist = async (courseId) => {
    try {
      const studentId = user.id || user._id;
      await axios.post('http://localhost:3001/api/waitlist/leave', {
        studentId,
        courseId
      });
      
      // Refresh data
      await fetchWaitlistEntries();
      await fetchAvailableCourses();
      
      setConfirmDialog({ open: false, course: null, action: null });
    } catch (error) {
      console.error('Error leaving waitlist:', error);
      alert(error.response?.data?.message || 'Failed to leave waitlist');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'info';
      case 'notified': return 'success';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting': return <HourglassEmpty />;
      case 'notified': return <CheckCircle />;
      case 'expired': return <Warning />;
      default: return <Info />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'senior': return 'success';
      case 'honors': return 'primary';
      case 'special': return 'secondary';
      default: return 'default';
    }
  };

  const isOnWaitlist = (courseId) => {
    return waitlistEntries.some(entry => entry.course._id === courseId);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading waitlist information...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Course Waitlists
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Join waitlists for full courses and get notified when spots become available.
      </Typography>

      {/* Current Waitlist Entries */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        My Waitlist Entries
      </Typography>
      
      {waitlistEntries.length > 0 ? (
        <Grid container spacing={3} mb={4}>
          {waitlistEntries.map((entry) => (
            <Grid item xs={12} md={6} key={entry._id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h3">
                      {entry.course.courseCode}
                    </Typography>
                    <Box display="flex" gap={1}>
                      <Chip 
                        label={`Position #${entry.position}`}
                        color="primary"
                        size="small"
                        icon={<TrendingUp />}
                      />
                      <Chip 
                        label={entry.status.toUpperCase()}
                        color={getStatusColor(entry.status)}
                        size="small"
                        icon={getStatusIcon(entry.status)}
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" gutterBottom>
                    {entry.course.title}
                  </Typography>
                  
                  <Box display="flex" gap={1} mb={2}>
                    <Chip 
                      label={`${entry.course.semester} ${entry.course.year}`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip 
                      label={entry.priority.toUpperCase()}
                      color={getPriorityColor(entry.priority)}
                      size="small"
                    />
                  </Box>

                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Schedule fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Joined Waitlist"
                        secondary={new Date(entry.createdAt).toLocaleDateString()}
                      />
                    </ListItem>
                    
                    {entry.status === 'notified' && entry.expiresAt && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Warning fontSize="small" color="warning" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Response Deadline"
                          secondary={new Date(entry.expiresAt).toLocaleString()}
                        />
                      </ListItem>
                    )}
                  </List>

                  {entry.status === 'notified' && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        A spot is available! You have until {new Date(entry.expiresAt).toLocaleString()} to enroll.
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => setConfirmDialog({ 
                      open: true, 
                      course: entry.course, 
                      action: 'leave' 
                    })}
                  >
                    Leave Waitlist
                  </Button>
                  
                  {entry.status === 'notified' && (
                    <Button 
                      size="small" 
                      color="primary"
                      variant="contained"
                      href="/courses"
                    >
                      Enroll Now
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', mb: 4 }}>
          <HourglassEmpty sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Waitlist Entries
          </Typography>
          <Typography color="textSecondary">
            You are not currently on any course waitlists.
          </Typography>
        </Paper>
      )}

      {/* Available Full Courses */}
      <Typography variant="h5" gutterBottom>
        Full Courses Available for Waitlist
      </Typography>
      
      {availableCourses.length > 0 ? (
        <Grid container spacing={3}>
          {availableCourses.map((course) => {
            const onWaitlist = isOnWaitlist(course._id);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={course._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" component="h3">
                        {course.courseCode}
                      </Typography>
                      <Chip 
                        label="FULL"
                        color="error"
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body1" gutterBottom>
                      {course.title}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {course.description || 'Course description not available.'}
                    </Typography>

                    <Box display="flex" gap={1} mb={2}>
                      <Chip 
                        label={`${course.credits} Credits`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip 
                        label={`${course.semester} ${course.year}`}
                        size="small"
                        color="secondary"
                      />
                    </Box>

                    <List dense>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <People fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Enrollment"
                          secondary={`${course.enrolledStudents?.length || 0}/${course.capacity} students`}
                        />
                      </ListItem>
                    </List>

                    <Box mt={2}>
                      <Typography variant="caption" color="textSecondary">
                        Course Capacity
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={100} 
                        color="error"
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </CardContent>
                  
                  <CardActions>
                    {onWaitlist ? (
                      <Button 
                        size="small" 
                        color="error"
                        onClick={() => setConfirmDialog({ 
                          open: true, 
                          course, 
                          action: 'leave' 
                        })}
                      >
                        Leave Waitlist
                      </Button>
                    ) : (
                      <Button 
                        size="small" 
                        color="primary"
                        variant="contained"
                        onClick={() => setConfirmDialog({ 
                          open: true, 
                          course, 
                          action: 'join' 
                        })}
                      >
                        Join Waitlist
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <School sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Full Courses
          </Typography>
          <Typography color="textSecondary">
            All courses currently have available spots for enrollment.
          </Typography>
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={() => setConfirmDialog({ open: false, course: null, action: null })}
      >
        <DialogTitle>
          {confirmDialog.action === 'join' ? 'Join Waitlist' : 'Leave Waitlist'}
        </DialogTitle>
        <DialogContent>
          {confirmDialog.course && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {confirmDialog.course.courseCode} - {confirmDialog.course.title}
              </Typography>
              <Typography paragraph>
                {confirmDialog.action === 'join' 
                  ? 'Are you sure you want to join the waitlist for this course? You will be notified if a spot becomes available.'
                  : 'Are you sure you want to leave the waitlist for this course?'
                }
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, course: null, action: null })}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (confirmDialog.action === 'join') {
                joinWaitlist(confirmDialog.course._id);
              } else {
                leaveWaitlist(confirmDialog.course._id);
              }
            }}
            variant="contained"
            color={confirmDialog.action === 'join' ? 'primary' : 'error'}
          >
            {confirmDialog.action === 'join' ? 'Join Waitlist' : 'Leave Waitlist'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentWaitlist;