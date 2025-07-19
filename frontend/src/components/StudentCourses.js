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
  Tabs,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Snackbar
} from '@mui/material';
import {
  MenuBook,
  Person,
  Schedule,
  LocationOn,
  People,
  Assignment,
  Grade,
  EventNote,
  Add,
  School,
  TrendingUp
} from '@mui/icons-material';
import axios from 'axios';

const StudentCourses = ({ user }) => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [mainTab, setMainTab] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [registrationDialog, setRegistrationDialog] = useState(false);
  const [courseToRegister, setCourseToRegister] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchEnrolledCourses();
    fetchAvailableCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const studentId = user.id || user._id;
      const response = await axios.get(`http://localhost:3001/api/enrollments/student/${studentId}`);
      setEnrolledCourses(response.data.enrolledCourses || []);
      setTotalCredits(response.data.totalCredits || 0);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setEnrolledCourses([]);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/courses');
      setAvailableCourses(response.data);
    } catch (error) {
      console.error('Error fetching available courses:', error);
      setAvailableCourses([]);
    }
  };

  const handleEnrollment = async (courseId) => {
    setLoading(true);
    try {
      const studentId = user.id || user._id;
      await axios.post('http://localhost:3001/api/enrollments/enroll', {
        studentId,
        courseId
      });

      setSnackbar({
        open: true,
        message: 'Successfully enrolled in course!',
        severity: 'success'
      });

      // Refresh data
      await fetchEnrolledCourses();
      await fetchAvailableCourses();
      setRegistrationDialog(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to enroll in course',
        severity: 'error'
      });
    }
    setLoading(false);
  };

  const handleUnenrollment = async (courseId) => {
    setLoading(true);
    try {
      const studentId = user.id || user._id;
      await axios.post('http://localhost:3001/api/enrollments/unenroll', {
        studentId,
        courseId
      });

      setSnackbar({
        open: true,
        message: 'Successfully unenrolled from course',
        severity: 'success'
      });

      // Refresh data
      await fetchEnrolledCourses();
      await fetchAvailableCourses();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to unenroll from course',
        severity: 'error'
      });
    }
    setLoading(false);
  };

  const openRegistrationDialog = (course) => {
    setCourseToRegister(course);
    setRegistrationDialog(true);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const EnrolledCourseCard = ({ course }) => (
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
          {course.instructor && (
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Instructor"
                secondary={`${course.instructor.profile?.firstName || ''} ${course.instructor.profile?.lastName || ''}`}
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
        <Button
          size="small"
          color="error"
          onClick={() => handleUnenrollment(course._id)}
          disabled={loading}
        >
          Drop Course
        </Button>
      </CardActions>
    </Card>
  );

  const AvailableCourseCard = ({ course }) => {
    const isEnrolled = enrolledCourses.some(enrolled => enrolled._id === course._id);
    const isFull = course.enrolledStudents?.length >= course.capacity;

    return (
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
            {isFull && (
              <Chip
                label="Full"
                size="small"
                color="error"
              />
            )}
            {isEnrolled && (
              <Chip
                label="Enrolled"
                size="small"
                color="success"
              />
            )}
          </Box>

          <List dense>
            {course.instructor && (
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Instructor"
                  secondary={`${course.instructor.profile?.firstName || ''} ${course.instructor.profile?.lastName || ''}`}
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
          {!isEnrolled && !isFull && (
            <Button
              size="small"
              color="primary"
              variant="contained"
              onClick={() => openRegistrationDialog(course)}
              disabled={loading}
            >
              Enroll
            </Button>
          )}
        </CardActions>
      </Card>
    );
  };

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          My Courses
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            icon={<School />}
            label={`${totalCredits} Credits`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<TrendingUp />}
            label={`${enrolledCourses.length} Enrolled`}
            color="secondary"
            variant="outlined"
          />
        </Box>
      </Box>

      {selectedCourse ? (
        <CourseDetails course={selectedCourse} />
      ) : (
        <>
          <Tabs
            value={mainTab}
            onChange={(e, newValue) => setMainTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="Enrolled Courses" />
            <Tab label="Course Registration" />
          </Tabs>

          {mainTab === 0 && (
            <>
              <Typography variant="body1" color="textSecondary" paragraph>
                Here are the courses you're currently enrolled in for this semester.
              </Typography>

              <Grid container spacing={3}>
                {enrolledCourses.map((course) => (
                  <Grid item xs={12} md={6} lg={4} key={course._id}>
                    <EnrolledCourseCard course={course} />
                  </Grid>
                ))}
              </Grid>

              {enrolledCourses.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
                  <MenuBook sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No Courses Enrolled
                  </Typography>
                  <Typography color="textSecondary" paragraph>
                    You are not currently enrolled in any courses.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setMainTab(1)}
                    startIcon={<Add />}
                  >
                    Browse Available Courses
                  </Button>
                </Paper>
              )}
            </>
          )}

          {mainTab === 1 && (
            <>
              <Typography variant="body1" color="textSecondary" paragraph>
                Browse and enroll in available courses for the current semester.
              </Typography>

              <Grid container spacing={3}>
                {availableCourses.map((course) => (
                  <Grid item xs={12} md={6} lg={4} key={course._id}>
                    <AvailableCourseCard course={course} />
                  </Grid>
                ))}
              </Grid>

              {availableCourses.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
                  <MenuBook sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No Courses Available
                  </Typography>
                  <Typography color="textSecondary">
                    There are no courses available for registration at this time.
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </>
      )}

      {/* Registration Confirmation Dialog */}
      <Dialog open={registrationDialog} onClose={() => setRegistrationDialog(false)}>
        <DialogTitle>Confirm Course Enrollment</DialogTitle>
        <DialogContent>
          {courseToRegister && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {courseToRegister.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {courseToRegister.courseCode} • {courseToRegister.credits} Credits
              </Typography>
              <Typography paragraph>
                Are you sure you want to enroll in this course?
              </Typography>

              {courseToRegister.prerequisites?.length > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Prerequisites: {courseToRegister.prerequisites.join(', ')}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegistrationDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => handleEnrollment(courseToRegister?._id)}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Enrolling...' : 'Confirm Enrollment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StudentCourses;