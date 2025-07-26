import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  VideoCall,
  Schedule,
  People,
  PlayArrow,
  Upcoming,
  History,
  TrendingUp
} from '@mui/icons-material';
import { API_URL } from '../../config/api';

const VirtualClassroomDashboard = ({ userRole }) => {
  const [dashboardData, setDashboardData] = useState({
    upcomingClasses: [],
    liveClasses: [],
    recentClasses: [],
    stats: {
      totalClasses: 0,
      attendedClasses: 0,
      averageAttendance: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch different data based on user role
      const endpoint = userRole === 'faculty' 
        ? '/virtual-classroom/faculty/my-classes'
        : '/virtual-classroom/student/dashboard';

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        processDashboardData(data.classrooms || []);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (error) {
      setError('Network error while fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const processDashboardData = (classrooms) => {
    const now = new Date();
    
    const upcomingClasses = classrooms.filter(c => 
      new Date(c.scheduledTime) > now && c.status === 'scheduled'
    ).slice(0, 5);

    const liveClasses = classrooms.filter(c => c.status === 'live');

    const recentClasses = classrooms.filter(c => 
      c.status === 'ended' || new Date(c.scheduledTime) < now
    ).slice(0, 5);

    const stats = {
      totalClasses: classrooms.length,
      attendedClasses: recentClasses.length,
      averageAttendance: calculateAverageAttendance(recentClasses)
    };

    setDashboardData({
      upcomingClasses,
      liveClasses,
      recentClasses,
      stats
    });
  };

  const calculateAverageAttendance = (classes) => {
    if (classes.length === 0) return 0;
    
    const totalAttendance = classes.reduce((sum, classroom) => {
      const attendees = classroom.attendees || [];
      const avgAttendance = attendees.length > 0
        ? attendees.reduce((a, b) => a + (b.attendancePercentage || 0), 0) / attendees.length
        : 0;
      return sum + avgAttendance;
    }, 0);
    
    return Math.round(totalAttendance / classes.length);
  };

  const handleJoinClass = async (classroomId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/virtual-classroom/${classroomId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        window.open(data.joinUrl, '_blank');
      } else {
        setError(data.message || 'Failed to join classroom');
      }
    } catch (error) {
      setError('Network error while joining classroom');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'live': return 'success';
      case 'ended': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatTimeUntil = (scheduledTime) => {
    const now = new Date();
    const meetingTime = new Date(scheduledTime);
    const diffMs = meetingTime - now;
    
    if (diffMs < 0) return 'Started';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `in ${diffHours}h ${diffMinutes}m`;
    } else {
      return `in ${diffMinutes}m`;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <VideoCall sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {dashboardData.stats.totalClasses}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Classes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {dashboardData.upcomingClasses.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Upcoming
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PlayArrow sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {dashboardData.liveClasses.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Live Now
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {dashboardData.stats.averageAttendance}%
                  </Typography>
                  <Typography color="text.secondary">
                    Avg Attendance
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Live Classes */}
        {dashboardData.liveClasses.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="success.main">
                  🔴 Live Classes
                </Typography>
                <List>
                  {dashboardData.liveClasses.map((classroom, index) => (
                    <React.Fragment key={classroom._id}>
                      <ListItem
                        secondaryAction={
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<PlayArrow />}
                            onClick={() => handleJoinClass(classroom._id)}
                          >
                            Join Now
                          </Button>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            <VideoCall />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={classroom.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {classroom.courseId?.name} • Started {formatTimeUntil(classroom.scheduledTime)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < dashboardData.liveClasses.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Upcoming Classes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Upcoming sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Upcoming Classes
                </Typography>
              </Box>
              
              {dashboardData.upcomingClasses.length > 0 ? (
                <List>
                  {dashboardData.upcomingClasses.map((classroom, index) => (
                    <React.Fragment key={classroom._id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Schedule />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={classroom.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {classroom.courseId?.name}
                              </Typography>
                              <Typography variant="caption" color="primary.main">
                                {formatTimeUntil(classroom.scheduledTime)}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip
                          label={classroom.status}
                          color={getStatusColor(classroom.status)}
                          size="small"
                        />
                      </ListItem>
                      {index < dashboardData.upcomingClasses.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={3}>
                  <Schedule sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">
                    No upcoming classes
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Classes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <History sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6">
                  Recent Classes
                </Typography>
              </Box>
              
              {dashboardData.recentClasses.length > 0 ? (
                <List>
                  {dashboardData.recentClasses.map((classroom, index) => (
                    <React.Fragment key={classroom._id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'grey.400' }}>
                            <VideoCall />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={classroom.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {classroom.courseId?.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(classroom.scheduledTime).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box display="flex" alignItems="center" gap={1}>
                          <People fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {classroom.attendees?.length || 0}
                          </Typography>
                        </Box>
                      </ListItem>
                      {index < dashboardData.recentClasses.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={3}>
                  <History sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">
                    No recent classes
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VirtualClassroomDashboard;