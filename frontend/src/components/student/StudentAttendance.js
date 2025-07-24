import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Schedule,
  Person,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import axios from 'axios';

const StudentAttendance = ({ user }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendanceData();
  }, [user]);

  const fetchAttendanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      // Get student's attendance data
      const studentId = user.id || user._id;
      const response = await axios.get(`http://localhost:3001/api/students/${studentId}/attendance`, config);
      setAttendanceData(response.data || []);
      
      // Extract unique courses
      const uniqueCourses = response.data.map(item => item.course).filter((course, index, self) => 
        index === self.findIndex(c => c._id === course._id)
      );
      setCourses(uniqueCourses);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'excused': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle />;
      case 'absent': return <Cancel />;
      case 'late': return <Schedule />;
      case 'excused': return <Person />;
      default: return null;
    }
  };

  const getAttendancePercentage = (courseData) => {
    if (!courseData || courseData.totalClasses === 0) return 0;
    return ((courseData.present + courseData.late + courseData.excused) / courseData.totalClasses) * 100;
  };

  const filteredData = selectedCourse 
    ? attendanceData.filter(item => item.course._id === selectedCourse)
    : attendanceData;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading attendance data...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Attendance
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Overall Statistics */}
      <Grid container spacing={3} mb={4}>
        {attendanceData.map((courseData) => {
          const percentage = getAttendancePercentage(courseData);
          const isGood = percentage >= 75;
          
          return (
            <Grid item xs={12} md={6} lg={4} key={courseData.course._id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    {isGood ? (
                      <TrendingUp color="success" sx={{ mr: 1 }} />
                    ) : (
                      <TrendingDown color="error" sx={{ mr: 1 }} />
                    )}
                    <Typography variant="h6">
                      {courseData.course.courseCode}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {courseData.course.title}
                  </Typography>
                  
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">
                        Attendance: {percentage.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {courseData.present + courseData.late + courseData.excused}/{courseData.totalClasses}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={percentage} 
                      color={isGood ? 'success' : 'error'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Grid container spacing={1}>
                    <Grid item xs={3}>
                      <Box textAlign="center">
                        <Typography variant="h6" color="success.main">
                          {courseData.present}
                        </Typography>
                        <Typography variant="caption">Present</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box textAlign="center">
                        <Typography variant="h6" color="error.main">
                          {courseData.absent}
                        </Typography>
                        <Typography variant="caption">Absent</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box textAlign="center">
                        <Typography variant="h6" color="warning.main">
                          {courseData.late}
                        </Typography>
                        <Typography variant="caption">Late</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box textAlign="center">
                        <Typography variant="h6" color="info.main">
                          {courseData.excused}
                        </Typography>
                        <Typography variant="caption">Excused</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Course</InputLabel>
                <Select
                  value={selectedCourse}
                  label="Filter by Course"
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <MenuItem value="">All Courses</MenuItem>
                  {courses.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.courseCode} - {course.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Detailed Records */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Attendance Records
          </Typography>
          
          {filteredData.length === 0 ? (
            <Alert severity="info">
              No attendance records found.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((courseData) => 
                    courseData.recentRecords?.map((record, index) => (
                      <TableRow key={`${courseData.course._id}-${index}`}>
                        <TableCell>
                          {new Date(record.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {courseData.course.courseCode} - {courseData.course.title}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(record.status)}
                            label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            color={getStatusColor(record.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {record.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default StudentAttendance;