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
  Divider,
  Alert
} from '@mui/material';
import {
  Schedule,
  LocationOn,
  Person,
  AccessTime,
  Event,
  Today
} from '@mui/icons-material';
import axios from 'axios';

const StudentSchedule = ({ user }) => {
  const [schedule, setSchedule] = useState({
    weeklySchedule: {},
    upcomingEvents: [],
    conflicts: []
  });

  useEffect(() => {
    fetchSchedule();
  }, [user]);

  const fetchSchedule = async () => {
    try {
      const studentId = user.id || user._id;
      
      // Fetch enrolled courses
      const enrollmentResponse = await axios.get(`http://localhost:3001/api/enrollments/student/${studentId}`);
      const courses = enrollmentResponse.data.enrolledCourses || [];
      
      // Organize courses by day and time
      const weeklySchedule = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
      };
      
      const conflicts = [];
      
      courses.forEach(course => {
        if (course.schedule && course.schedule.days) {
          course.schedule.days.forEach(day => {
            const scheduleItem = {
              course: course,
              startTime: course.schedule.startTime,
              endTime: course.schedule.endTime,
              room: course.schedule.room,
              instructor: course.instructor
            };
            
            // Check for time conflicts
            const existingClasses = weeklySchedule[day] || [];
            const hasConflict = existingClasses.some(existing => {
              return timeOverlap(
                course.schedule.startTime,
                course.schedule.endTime,
                existing.startTime,
                existing.endTime
              );
            });
            
            if (hasConflict) {
              conflicts.push({
                day,
                course1: course.courseCode,
                course2: existingClasses.find(existing => 
                  timeOverlap(
                    course.schedule.startTime,
                    course.schedule.endTime,
                    existing.startTime,
                    existing.endTime
                  )
                ).course.courseCode,
                time: `${course.schedule.startTime} - ${course.schedule.endTime}`
              });
            }
            
            weeklySchedule[day].push(scheduleItem);
          });
        }
      });
      
      // Sort each day's schedule by start time
      Object.keys(weeklySchedule).forEach(day => {
        weeklySchedule[day].sort((a, b) => {
          return a.startTime.localeCompare(b.startTime);
        });
      });
      
      setSchedule({
        weeklySchedule,
        upcomingEvents: [], // This would come from academic calendar
        conflicts
      });
      
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const timeOverlap = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDaySchedule = (day) => {
    return schedule.weeklySchedule[day] || [];
  };

  const ScheduleCard = ({ day }) => {
    const daySchedule = getDaySchedule(day);
    
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            {day}
          </Typography>
          
          {daySchedule.length === 0 ? (
            <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
              No classes scheduled
            </Typography>
          ) : (
            <List dense>
              {daySchedule.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <AccessTime fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {item.course.courseCode}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {item.course.title}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                          </Typography>
                          {item.room && (
                            <Typography variant="caption" display="block">
                              📍 {item.room}
                            </Typography>
                          )}
                          {item.instructor && (
                            <Typography variant="caption" display="block">
                              👨‍🏫 {item.instructor.profile?.firstName} {item.instructor.profile?.lastName}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < daySchedule.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Schedule
      </Typography>
      
      {/* Schedule Conflicts Alert */}
      {schedule.conflicts.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Schedule Conflicts Detected:
          </Typography>
          {schedule.conflicts.map((conflict, index) => (
            <Typography key={index} variant="body2">
              • {conflict.day}: {conflict.course1} and {conflict.course2} overlap at {conflict.time}
            </Typography>
          ))}
        </Alert>
      )}
      
      {/* Weekly Schedule */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Weekly Class Schedule
      </Typography>
      
      <Grid container spacing={2}>
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
          <Grid item xs={12} md={2.4} key={day}>
            <ScheduleCard day={day} />
          </Grid>
        ))}
      </Grid>
      
      {/* Schedule Summary */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Schedule Summary
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Total Classes per Week
              </Typography>
              <Typography variant="h4" color="primary">
                {Object.values(schedule.weeklySchedule).flat().length}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Busiest Day
              </Typography>
              <Typography variant="h6" color="secondary">
                {Object.entries(schedule.weeklySchedule)
                  .reduce((max, [day, classes]) => 
                    classes.length > (schedule.weeklySchedule[max] || []).length ? day : max, 'Monday'
                  )}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Free Days
              </Typography>
              <Typography variant="h6" color="success.main">
                {Object.entries(schedule.weeklySchedule)
                  .filter(([day, classes]) => classes.length === 0).length}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default StudentSchedule;