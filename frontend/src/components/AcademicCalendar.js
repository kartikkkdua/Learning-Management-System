import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Event,
  Schedule,
  School,
  Assignment,
  Warning,
  Info,
  CheckCircle,
  AccessTime
} from '@mui/icons-material';
import axios from 'axios';

const AcademicCalendar = ({ user }) => {
  const [calendarData, setCalendarData] = useState({
    currentCalendar: null,
    upcomingEvents: [],
    registrationPeriods: null
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      
      // Fetch current academic calendar
      const calendarResponse = await axios.get('http://localhost:3001/api/calendar/current');
      
      // Fetch upcoming events
      const eventsResponse = await axios.get('http://localhost:3001/api/calendar/upcoming-events?days=60&audience=students');
      
      // Fetch registration periods
      const registrationResponse = await axios.get('http://localhost:3001/api/calendar/registration-periods');
      
      setCalendarData({
        currentCalendar: calendarResponse.data,
        upcomingEvents: eventsResponse.data,
        registrationPeriods: registrationResponse.data
      });
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      // Set default data if API fails
      setCalendarData({
        currentCalendar: null,
        upcomingEvents: [],
        registrationPeriods: null
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'registration': return <Assignment color="primary" />;
      case 'classes_start': return <School color="success" />;
      case 'classes_end': return <School color="warning" />;
      case 'exam_period': return <Assignment color="error" />;
      case 'holiday': return <Event color="info" />;
      case 'deadline': return <Warning color="warning" />;
      case 'graduation': return <School color="success" />;
      default: return <Event color="action" />;
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'registration': return 'primary';
      case 'classes_start': return 'success';
      case 'classes_end': return 'warning';
      case 'exam_period': return 'error';
      case 'holiday': return 'info';
      case 'deadline': return 'warning';
      case 'graduation': return 'success';
      default: return 'default';
    }
  };

  const getPriorityIcon = (isImportant) => {
    return isImportant ? <Warning color="error" /> : <Info color="info" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateRange = (startDate, endDate) => {
    if (!endDate) return formatDate(startDate);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return formatDate(startDate);
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const getDaysUntil = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffTime = eventDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Past';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  const getRegistrationStatus = () => {
    if (!calendarData.registrationPeriods) return null;
    
    const { currentPeriod, nextPeriod } = calendarData.registrationPeriods;
    
    if (currentPeriod) {
      return {
        status: 'open',
        message: `${currentPeriod.type.charAt(0).toUpperCase() + currentPeriod.type.slice(1)} registration is currently open`,
        color: 'success',
        endDate: currentPeriod.endDate
      };
    } else if (nextPeriod) {
      return {
        status: 'upcoming',
        message: `${nextPeriod.type.charAt(0).toUpperCase() + nextPeriod.type.slice(1)} registration opens soon`,
        color: 'warning',
        startDate: nextPeriod.startDate
      };
    } else {
      return {
        status: 'closed',
        message: 'Registration is currently closed',
        color: 'error'
      };
    }
  };

  const registrationStatus = getRegistrationStatus();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading academic calendar...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Academic Calendar
      </Typography>
      
      {/* Current Academic Year Info */}
      {calendarData.currentCalendar && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {calendarData.currentCalendar.academicYear} - {calendarData.currentCalendar.semester} Semester
          </Typography>
        </Alert>
      )}

      {/* Registration Status */}
      {registrationStatus && (
        <Alert severity={registrationStatus.color} sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2">
              {registrationStatus.message}
            </Typography>
            {registrationStatus.endDate && (
              <Typography variant="caption">
                Ends: {formatDate(registrationStatus.endDate)}
              </Typography>
            )}
            {registrationStatus.startDate && (
              <Typography variant="caption">
                Starts: {formatDate(registrationStatus.startDate)}
              </Typography>
            )}
          </Box>
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={selectedTab} 
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{ px: 2 }}
        >
          <Tab 
            label={
              <Badge badgeContent={calendarData.upcomingEvents.length} color="primary">
                Upcoming Events
              </Badge>
            } 
          />
          <Tab label="Registration Periods" />
          <Tab label="Important Dates" />
        </Tabs>
      </Paper>

      {/* Upcoming Events Tab */}
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          {calendarData.upcomingEvents.map((event, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="flex-start" mb={2}>
                    <Box sx={{ mr: 2, mt: 0.5 }}>
                      {getEventIcon(event.type)}
                    </Box>
                    <Box flexGrow={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="h6" component="h3">
                          {event.title}
                        </Typography>
                        <Box display="flex" gap={1}>
                          <Chip 
                            label={getDaysUntil(event.startDate)}
                            color={getDaysUntil(event.startDate) === 'Today' ? 'error' : 'default'}
                            size="small"
                          />
                          {event.isImportant && (
                            <Chip 
                              label="Important" 
                              color="error" 
                              size="small"
                              icon={<Warning />}
                            />
                          )}
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {event.description}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDateRange(event.startDate, event.endDate)}
                        </Typography>
                      </Box>
                      
                      <Chip 
                        label={event.type.replace('_', ' ').toUpperCase()}
                        color={getEventColor(event.type)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          
          {calendarData.upcomingEvents.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Event sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Upcoming Events
                </Typography>
                <Typography color="textSecondary">
                  There are no upcoming events in the next 60 days.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Registration Periods Tab */}
      {selectedTab === 1 && (
        <Grid container spacing={3}>
          {calendarData.registrationPeriods && (
            <>
              {Object.entries(calendarData.registrationPeriods.allPeriods || {}).map(([periodType, period]) => (
                <Grid item xs={12} md={4} key={periodType}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        {periodType.charAt(0).toUpperCase() + periodType.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Typography>
                      
                      {period.startDate && period.endDate ? (
                        <>
                          <Typography variant="body2" gutterBottom>
                            <strong>Period:</strong> {formatDateRange(period.startDate, period.endDate)}
                          </Typography>
                          
                          {period.eligibleStudents && (
                            <Typography variant="body2" gutterBottom>
                              <strong>Eligible:</strong> {period.eligibleStudents.join(', ')}
                            </Typography>
                          )}
                          
                          {period.lateFee && (
                            <Typography variant="body2" color="error">
                              <strong>Late Fee:</strong> ${period.lateFee}
                            </Typography>
                          )}
                          
                          <Box mt={2}>
                            <Chip 
                              label={getDaysUntil(period.startDate)}
                              color={
                                calendarData.registrationPeriods.currentPeriod?.type === periodType 
                                  ? 'success' 
                                  : 'default'
                              }
                              size="small"
                            />
                          </Box>
                        </>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Dates not yet announced
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </>
          )}
        </Grid>
      )}

      {/* Important Dates Tab */}
      {selectedTab === 2 && (
        <List>
          {calendarData.upcomingEvents
            .filter(event => event.isImportant)
            .map((event, index) => (
              <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                <ListItemIcon>
                  {getEventIcon(event.type)}
                </ListItemIcon>
                <ListItemText
                  primary={event.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {formatDateRange(event.startDate, event.endDate)}
                      </Typography>
                      {event.description && (
                        <Typography variant="body2" color="textSecondary">
                          {event.description}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <Chip 
                  label={getDaysUntil(event.startDate)}
                  color={getDaysUntil(event.startDate) === 'Today' ? 'error' : 'warning'}
                  size="small"
                />
              </ListItem>
            ))}
          
          {calendarData.upcomingEvents.filter(event => event.isImportant).length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Important Dates
              </Typography>
              <Typography color="textSecondary">
                There are no important dates marked in the upcoming period.
              </Typography>
            </Paper>
          )}
        </List>
      )}
    </Container>
  );
};

export default AcademicCalendar;