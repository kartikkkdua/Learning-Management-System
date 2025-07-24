import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Alert,
  Grid
} from '@mui/material';
import {
  Assignment,
  Person,
  School,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import axios from 'axios';

const CourseAssignment = () => {
  const [courses, setCourses] = useState([]);
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [summary, setSummary] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.get('http://localhost:3001/api/courses/admin/debug', config);
      
      if (response.data.success) {
        setCourses(response.data.data.courses);
        setFacultyMembers(response.data.data.facultyMembers);
        setSummary(response.data.data.summary);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load course assignment data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignInstructor = async () => {
    if (!selectedCourse || !selectedFaculty) {
      setError('Please select both course and faculty member');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.post('http://localhost:3001/api/courses/admin/assign-instructor', {
        courseId: selectedCourse.id,
        facultyMemberId: selectedFaculty
      }, config);

      if (response.data.success) {
        setSuccess('Instructor assigned successfully!');
        setAssignDialog(false);
        setSelectedCourse(null);
        setSelectedFaculty('');
        // Add a small delay to ensure backend has processed the change
        setTimeout(() => {
          fetchData(); // Refresh data
        }, 500);
      }
    } catch (error) {
      console.error('Error assigning instructor:', error);
      setError('Failed to assign instructor: ' + (error.response?.data?.message || error.message));
    }
  };

  const openAssignDialog = (course) => {
    setSelectedCourse(course);
    setAssignDialog(true);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading course assignment data...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Course-Faculty Assignment
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <School color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{summary.totalCourses || 0}</Typography>
                  <Typography color="textSecondary">Total Courses</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{summary.coursesWithInstructor || 0}</Typography>
                  <Typography color="textSecondary">Assigned</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Warning color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{summary.coursesWithoutInstructor || 0}</Typography>
                  <Typography color="textSecondary">Unassigned</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Person color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{summary.totalFacultyMembers || 0}</Typography>
                  <Typography color="textSecondary">Faculty Available</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Course Assignment Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Course Assignments
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Course Code</TableCell>
                  <TableCell>Course Title</TableCell>
                  <TableCell>Assigned Instructor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <Chip label={course.courseCode} color="primary" size="small" />
                    </TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>
                      {course.instructor ? (
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {course.instructor.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {course.instructor.employeeId} • {course.instructor.email}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No instructor assigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {course.instructor ? (
                        <Chip 
                          label="Assigned" 
                          color="success" 
                          size="small" 
                          icon={<CheckCircle />}
                        />
                      ) : (
                        <Chip 
                          label="Unassigned" 
                          color="warning" 
                          size="small" 
                          icon={<Warning />}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Assignment />}
                        onClick={() => openAssignDialog(course)}
                      >
                        {course.instructor ? 'Reassign' : 'Assign'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign Instructor to {selectedCourse?.courseCode}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Select a faculty member to assign as instructor for "{selectedCourse?.title}"
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Faculty Member</InputLabel>
            <Select
              value={selectedFaculty}
              label="Select Faculty Member"
              onChange={(e) => setSelectedFaculty(e.target.value)}
            >
              {facultyMembers.map((faculty) => (
                <MenuItem key={faculty.id} value={faculty.id}>
                  <Box>
                    <Typography variant="body2">
                      {faculty.name} ({faculty.employeeId})
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {faculty.email}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignInstructor} 
            variant="contained"
            disabled={!selectedFaculty}
          >
            Assign Instructor
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseAssignment;