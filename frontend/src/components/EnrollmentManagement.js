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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  PersonAdd,
  School,
  People,
  Add,
  Remove,
  Search,
  Analytics,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';
import axios from 'axios';

const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [enrollDialog, setEnrollDialog] = useState(false);
  const [bulkEnrollDialog, setBulkEnrollDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('');
  const [enrollmentStats, setEnrollmentStats] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEnrollments();
    fetchCourses();
    fetchStudents();
    fetchEnrollmentStats();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/enrollments');
      setEnrollments(response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchEnrollmentStats = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/enrollments/stats');
      setEnrollmentStats(response.data);
    } catch (error) {
      console.error('Error fetching enrollment stats:', error);
    }
  };

  const fetchAvailableStudents = async (courseId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/enrollments/available-students/${courseId}`);
      setAvailableStudents(response.data);
    } catch (error) {
      console.error('Error fetching available students:', error);
    }
  };

  const handleEnrollStudent = async (studentId, courseId) => {
    try {
      setLoading(true);
      await axios.post('http://localhost:3001/api/enrollments/enroll', {
        studentId,
        courseId
      });
      
      fetchEnrollments();
      fetchCourses();
      setEnrollDialog(false);
      alert('Student enrolled successfully!');
    } catch (error) {
      console.error('Error enrolling student:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkEnroll = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3001/api/enrollments/bulk-enroll', {
        studentIds: selectedStudents,
        courseId: selectedCourse._id
      });
      
      fetchEnrollments();
      fetchCourses();
      setBulkEnrollDialog(false);
      setSelectedStudents([]);
      
      const { results, summary } = response.data;
      let message = `Bulk enrollment completed!\n`;
      message += `Successful: ${summary.successful}\n`;
      message += `Already enrolled: ${summary.alreadyEnrolled}\n`;
      message += `Failed: ${summary.failed}`;
      
      alert(message);
    } catch (error) {
      console.error('Error bulk enrolling students:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenrollStudent = async (studentId, courseId) => {
    if (window.confirm('Are you sure you want to unenroll this student?')) {
      try {
        await axios.post('http://localhost:3001/api/enrollments/unenroll', {
          studentId,
          courseId
        });
        
        fetchEnrollments();
        fetchCourses();
        alert('Student unenrolled successfully!');
      } catch (error) {
        console.error('Error unenrolling student:', error);
        alert(`Error: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const openEnrollDialog = (course) => {
    setSelectedCourse(course);
    fetchAvailableStudents(course._id);
    setEnrollDialog(true);
  };

  const openBulkEnrollDialog = (course) => {
    setSelectedCourse(course);
    fetchAvailableStudents(course._id);
    setBulkEnrollDialog(true);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getEnrollmentStatus = (course) => {
    const enrollmentCount = course.enrolledStudents?.length || 0;
    const capacity = course.capacity;
    const percentage = (enrollmentCount / capacity) * 100;
    
    if (percentage >= 100) return { status: 'full', color: 'error', label: 'Full' };
    if (percentage >= 80) return { status: 'high', color: 'warning', label: 'High' };
    if (percentage >= 50) return { status: 'medium', color: 'info', label: 'Medium' };
    return { status: 'low', color: 'success', label: 'Low' };
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = !searchTerm || 
      enrollment.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = !filterCourse || enrollment.course._id === filterCourse;
    const matchesFaculty = !filterFaculty || enrollment.course.faculty?._id === filterFaculty;
    
    return matchesSearch && matchesCourse && matchesFaculty;
  });

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color: color, fontSize: 40 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Enrollment Management
      </Typography>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Enrollments"
            value={enrollmentStats.totalEnrollments || 0}
            icon={<PersonAdd />}
            color="primary.main"
            subtitle="Active enrollments"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average per Course"
            value={(enrollmentStats.averageEnrollmentPerCourse || 0).toFixed(1)}
            icon={<Analytics />}
            color="info.main"
            subtitle="Students per course"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Courses at Capacity"
            value={enrollmentStats.coursesAtCapacity || 0}
            icon={<Warning />}
            color="warning.main"
            subtitle="Full courses"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Enrollment"
            value={enrollmentStats.coursesWithLowEnrollment || 0}
            icon={<Error />}
            color="error.main"
            subtitle="Courses < 30% capacity"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ px: 2 }}>
          <Tab label="Course Enrollments" />
          <Tab label="All Enrollments" />
          <Tab label="Enrollment Statistics" />
        </Tabs>
      </Paper>

      {/* Course Enrollments Tab */}
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          {courses.map((course) => {
            const status = getEnrollmentStatus(course);
            const enrollmentCount = course.enrolledStudents?.length || 0;
            
            return (
              <Grid item xs={12} md={6} lg={4} key={course._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" component="h2">
                        {course.courseCode}
                      </Typography>
                      <Chip 
                        label={status.label} 
                        color={status.color} 
                        size="small" 
                      />
                    </Box>
                    
                    <Typography variant="body1" gutterBottom>
                      {course.title}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {course.faculty ? `${course.faculty.name} (${course.faculty.code})` : 'No Faculty Assigned'}
                    </Typography>

                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">
                          Enrollment: {enrollmentCount}/{course.capacity}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {((enrollmentCount / course.capacity) * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(enrollmentCount / course.capacity) * 100} 
                        color={status.color}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Typography variant="caption" color="textSecondary">
                      {course.credits} Credits • {course.semester} {course.year}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<Add />}
                      onClick={() => openEnrollDialog(course)}
                      disabled={enrollmentCount >= course.capacity}
                    >
                      Enroll
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<People />}
                      onClick={() => openBulkEnrollDialog(course)}
                      disabled={enrollmentCount >= course.capacity}
                    >
                      Bulk Enroll
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* All Enrollments Tab */}
      {selectedTab === 1 && (
        <>
          {/* Filters */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Students/Courses"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Course</InputLabel>
                <Select
                  value={filterCourse}
                  label="Filter by Course"
                  onChange={(e) => setFilterCourse(e.target.value)}
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
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setFilterCourse('');
                  setFilterFaculty('');
                }}
                sx={{ height: '56px' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>

          {/* Enrollments Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Faculty</TableCell>
                  <TableCell>Credits</TableCell>
                  <TableCell>Enrolled Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment._id}>
                    <TableCell>
                      {enrollment.student.firstName} {enrollment.student.lastName}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={enrollment.student.studentId} 
                        variant="outlined" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {enrollment.course.courseCode}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {enrollment.course.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {enrollment.course.faculty ? (
                        <Chip 
                          label={enrollment.course.faculty.code} 
                          color="primary" 
                          size="small" 
                        />
                      ) : (
                        <Chip 
                          label="No Faculty" 
                          color="default" 
                          size="small" 
                        />
                      )}
                    </TableCell>
                    <TableCell>{enrollment.course.credits}</TableCell>
                    <TableCell>
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Remove />}
                        onClick={() => handleUnenrollStudent(
                          enrollment.student._id, 
                          enrollment.course._id
                        )}
                      >
                        Unenroll
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredEnrollments.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
              <PersonAdd sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Enrollments Found
              </Typography>
              <Typography color="textSecondary">
                {enrollments.length === 0 
                  ? "No students are currently enrolled in any courses." 
                  : "No enrollments match your current filters."
                }
              </Typography>
            </Paper>
          )}
        </>
      )}

      {/* Statistics Tab */}
      {selectedTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Enrollment by Faculty
              </Typography>
              {Object.entries(enrollmentStats.enrollmentByFaculty || {}).map(([facultyName, stats]) => (
                <Box key={facultyName} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body1">{facultyName}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {stats.totalEnrollments} enrollments in {stats.courses} courses
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats.averageEnrollment / 30) * 100} // Assuming max 30 per course
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    Average: {stats.averageEnrollment.toFixed(1)} students per course
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Single Enrollment Dialog */}
      <Dialog open={enrollDialog} onClose={() => setEnrollDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Enroll Student in {selectedCourse?.courseCode}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            Select a student to enroll in {selectedCourse?.title}
          </Typography>
          
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {availableStudents.map((student) => (
              <ListItem 
                key={student._id} 
                button 
                onClick={() => handleEnrollStudent(student._id, selectedCourse._id)}
                disabled={loading}
              >
                <ListItemIcon>
                  <PersonAdd />
                </ListItemIcon>
                <ListItemText
                  primary={`${student.firstName} ${student.lastName}`}
                  secondary={`${student.studentId} • ${student.faculty ? student.faculty.name : 'No Faculty'}`}
                />
              </ListItem>
            ))}
          </List>
          
          {availableStudents.length === 0 && (
            <Alert severity="info">
              No students available for enrollment in this course.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnrollDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Enrollment Dialog */}
      <Dialog open={bulkEnrollDialog} onClose={() => setBulkEnrollDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Bulk Enroll Students in {selectedCourse?.courseCode}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            Select multiple students to enroll in {selectedCourse?.title}
          </Typography>
          
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {availableStudents.map((student) => (
              <ListItem key={student._id}>
                <ListItemIcon>
                  <Checkbox
                    checked={selectedStudents.includes(student._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...selectedStudents, student._id]);
                      } else {
                        setSelectedStudents(selectedStudents.filter(id => id !== student._id));
                      }
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={`${student.firstName} ${student.lastName}`}
                  secondary={`${student.studentId} • ${student.faculty ? student.faculty.name : 'No Faculty'}`}
                />
              </ListItem>
            ))}
          </List>
          
          {availableStudents.length === 0 && (
            <Alert severity="info">
              No students available for enrollment in this course.
            </Alert>
          )}
          
          {selectedStudents.length > 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {selectedStudents.length} student(s) selected for enrollment.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkEnrollDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkEnroll} 
            variant="contained"
            disabled={selectedStudents.length === 0 || loading}
          >
            Enroll Selected ({selectedStudents.length})
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EnrollmentManagement;