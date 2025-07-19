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
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Tab,
  Tabs
} from '@mui/material';
import {
  MenuBook,
  Person,
  Schedule,
  LocationOn,
  People,
  Assignment,
  Grade,
  EventNote
} from '@mui/icons-material';
import axios from 'axios';

const StudentCourses = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const studentId = user.id || user._id;
      const response = await axios.get(`http://localhost:3001/api/students/${studentId}/courses`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]); // Fallback to empty array
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const CourseCard = ({ course }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h2">
            {course.title}
          </Typography>
          <Chip 
            label={course.courseCode} 
            color="primary" 
            size="small" 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
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
          {course.faculty && (
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Faculty" 
                secondary={`${course.faculty.name} (${course.faculty.code})`}
              />
            </ListItem>
          )}
          
          {course.schedule?.days?.length > 0 && (
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <Schedule fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Schedule" 
                secondary={`${course.schedule.days.join(', ')} ${course.schedule.startTime}-${course.schedule.endTime}`}
              />
            </ListItem>
          )}
          
          {course.schedule?.room && (
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <LocationOn fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Room" 
                secondary={course.schedule.room}
              />
            </ListItem>
          )}
          
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
      </CardContent>
      
      <CardActions>
        <Button 
          size="small" 
          onClick={() => setSelectedCourse(course)}
          variant="outlined"
        >
          View Details
        </Button>
        <Button size="small" color="primary">
          Course Materials
        </Button>
      </CardActions>
    </Card>
  );

  const CourseDetails = ({ course }) => (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h5" gutterBottom>
            {course.title}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {course.courseCode} • {course.credits} Credits
          </Typography>
        </Box>
        <Chip 
          label={`${course.semester} ${course.year}`} 
          color="primary" 
        />
      </Box>

      <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Assignments" />
        <Tab label="Grades" />
        <Tab label="Attendance" />
      </Tabs>

      {selectedTab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Course Description
          </Typography>
          <Typography paragraph>
            {course.description || 'Detailed course description will be available here.'}
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Course Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon><Person /></ListItemIcon>
                  <ListItemText 
                    primary="Instructor" 
                    secondary={course.instructor ? 
                      `${course.instructor.profile?.firstName} ${course.instructor.profile?.lastName}` : 
                      'TBA'
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Schedule /></ListItemIcon>
                  <ListItemText 
                    primary="Schedule" 
                    secondary={course.schedule?.days?.length > 0 ? 
                      `${course.schedule.days.join(', ')} ${course.schedule.startTime}-${course.schedule.endTime}` : 
                      'TBA'
                    }
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon><LocationOn /></ListItemIcon>
                  <ListItemText 
                    primary="Location" 
                    secondary={course.schedule?.room || 'TBA'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><People /></ListItemIcon>
                  <ListItemText 
                    primary="Class Size" 
                    secondary={`${course.enrolledStudents?.length || 0}/${course.capacity} students`}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Box>
      )}

      {selectedTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Course Assignments
          </Typography>
          <Typography color="textSecondary">
            Assignment details will be loaded here from the assignments API.
          </Typography>
        </Box>
      )}

      {selectedTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            My Grades
          </Typography>
          <Typography color="textSecondary">
            Grade information will be displayed here.
          </Typography>
        </Box>
      )}

      {selectedTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Attendance Record
          </Typography>
          <Typography color="textSecondary">
            Attendance history will be shown here.
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Button onClick={() => setSelectedCourse(null)} variant="outlined">
          Back to Courses
        </Button>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Courses
      </Typography>
      
      {selectedCourse ? (
        <CourseDetails course={selectedCourse} />
      ) : (
        <>
          <Typography variant="body1" color="textSecondary" paragraph>
            Here are the courses you're currently enrolled in for this semester.
          </Typography>
          
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} md={6} lg={4} key={course._id}>
                <CourseCard course={course} />
              </Grid>
            ))}
          </Grid>
          
          {courses.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
              <MenuBook sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Courses Enrolled
              </Typography>
              <Typography color="textSecondary">
                You are not currently enrolled in any courses. Please contact your academic advisor for course registration.
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

export default StudentCourses;