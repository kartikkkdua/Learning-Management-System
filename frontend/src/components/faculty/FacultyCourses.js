import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Button
} from '@mui/material';
import {
  People,
  Schedule,
  Assignment,
  Grade,
  EventNote
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FacultyCourses = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('http://localhost:3001/api/courses/my-courses', config);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching my courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSemesterColor = (semester) => {
    switch (semester) {
      case 'Fall': return 'warning';
      case 'Spring': return 'success';
      case 'Summer': return 'info';
      default: return 'default';
    }
  };

  const getEnrollmentPercentage = (enrolled, capacity) => {
    return capacity > 0 ? (enrolled / capacity) * 100 : 0;
  };

  const getEnrollmentColor = (percentage) => {
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading your courses...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          My Courses
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {courses.length} course{courses.length !== 1 ? 's' : ''} assigned
        </Typography>
      </Box>

      {courses.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Courses Assigned
            </Typography>
            <Typography variant="body2" color="textSecondary">
              You don't have any courses assigned yet. Please contact your administrator.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Course Cards Grid */}
          <Grid container spacing={3} mb={4}>
            {courses.map((course) => {
              const enrolledCount = course.enrolledStudents?.length || 0;
              const enrollmentPercentage = getEnrollmentPercentage(enrolledCount, course.capacity);
              
              return (
                <Grid item xs={12} md={6} lg={4} key={course._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Chip 
                          label={course.courseCode} 
                          color="primary" 
                          size="small" 
                        />
                        <Chip 
                          label={`${course.semester} ${course.year}`} 
                          color={getSemesterColor(course.semester)} 
                          size="small" 
                        />
                      </Box>
                      
                      <Typography variant="h6" gutterBottom>
                        {course.title}
                      </Typography>
                      
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {course.description || 'No description available'}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <People fontSize="small" />
                        <Typography variant="body2">
                          {enrolledCount}/{course.capacity} students
                        </Typography>
                      </Box>
                      
                      <LinearProgress
                        variant="determinate"
                        value={enrollmentPercentage}
                        color={getEnrollmentColor(enrollmentPercentage)}
                        sx={{ mb: 2, height: 6, borderRadius: 3 }}
                      />
                      
                      {course.schedule?.days?.length > 0 && (
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <Schedule fontSize="small" />
                          <Typography variant="body2">
                            {course.schedule.days.join(', ')} • {course.schedule.startTime} - {course.schedule.endTime}
                          </Typography>
                        </Box>
                      )}
                      
                      {course.schedule?.room && (
                        <Typography variant="body2" color="textSecondary">
                          Room: {course.schedule.room}
                        </Typography>
                      )}
                    </CardContent>
                    
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            startIcon={<People />}
                            onClick={() => navigate('/students')}
                          >
                            Students
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            startIcon={<Assignment />}
                            onClick={() => navigate('/assignments')}
                          >
                            Assignments
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            startIcon={<Grade />}
                            onClick={() => navigate('/grading')}
                          >
                            Grades
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            startIcon={<EventNote />}
                            onClick={() => navigate('/attendance')}
                          >
                            Attendance
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Detailed Table View */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Course Details
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Course Code</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Credits</TableCell>
                      <TableCell>Semester</TableCell>
                      <TableCell>Enrollment</TableCell>
                      <TableCell>Schedule</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course._id}>
                        <TableCell>
                          <Chip label={course.courseCode} color="primary" size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {course.title}
                          </Typography>
                        </TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`${course.semester} ${course.year}`} 
                            color={getSemesterColor(course.semester)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <People fontSize="small" />
                            <Typography variant="body2">
                              {course.enrolledStudents?.length || 0}/{course.capacity}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={getEnrollmentPercentage(course.enrolledStudents?.length || 0, course.capacity)}
                              color={getEnrollmentColor(getEnrollmentPercentage(course.enrolledStudents?.length || 0, course.capacity))}
                              sx={{ width: 60, height: 4, borderRadius: 2 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          {course.schedule?.days?.length > 0 ? (
                            <Box>
                              <Typography variant="caption">
                                {course.schedule.days.join(', ')}
                              </Typography>
                              <br />
                              <Typography variant="caption">
                                {course.schedule.startTime} - {course.schedule.endTime}
                              </Typography>
                              {course.schedule.room && (
                                <>
                                  <br />
                                  <Typography variant="caption" color="textSecondary">
                                    Room: {course.schedule.room}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          ) : 'TBA'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default FacultyCourses;