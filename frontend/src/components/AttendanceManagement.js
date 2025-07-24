import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Schedule,
  Person,
  Class
} from '@mui/icons-material';
import axios from 'axios';

const AttendanceManagement = ({ user }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchCourses();
    fetchAttendanceRecords();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsForCourse();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      let response;
      if (user?.role === 'faculty') {
        // Faculty can only see their courses
        response = await axios.get('http://localhost:3001/api/courses/my-courses', config);
      } else {
        // Admin can see all courses
        response = await axios.get('http://localhost:3001/api/courses', config);
      }
      
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
    }
  };

  const syncInstructors = async () => {
    if (user?.role !== 'admin') return;
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      const response = await axios.post('http://localhost:3001/api/courses/admin/sync-instructors', {}, config);
      
      if (response.data.success) {
        setError('');
        alert(`Successfully synced ${response.data.updatedCount} courses with instructor assignments`);
        fetchCourses(); // Refresh courses
      }
    } catch (error) {
      console.error('Error syncing instructors:', error);
      setError('Failed to sync instructors: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchStudentsForCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      // Get course details with enrolled students
      const response = await axios.get(`http://localhost:3001/api/courses/${selectedCourse}`, config);
      const course = response.data;
      
      if (course.enrolledStudents) {
        setStudents(course.enrolledStudents);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students for this course');
      setStudents([]);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      const response = await axios.get('http://localhost:3001/api/attendance', config);
      setAttendanceRecords(response.data || []);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  const handleMarkAttendance = () => {
    if (!selectedCourse || !selectedDate || students.length === 0) {
      setError('Please select a course, date, and ensure students are enrolled');
      return;
    }

    const defaultAttendance = students.map((student) => ({
      student: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      studentId: student.studentId,
      status: 'present',
      notes: '',
    }));
    setAttendanceData(defaultAttendance);
    setIsDialogOpen(true);
  };

  const updateAttendanceStatus = (studentId, status) => {
    setAttendanceData((prev) =>
      prev.map((record) =>
        record.student === studentId ? { ...record, status } : record
      )
    );
  };

  const updateAttendanceNotes = (studentId, notes) => {
    setAttendanceData((prev) =>
      prev.map((record) =>
        record.student === studentId ? { ...record, notes } : record
      )
    );
  };

  const handleSubmitAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const attendancePayload = {
        course: selectedCourse,
        date: selectedDate,
        records: attendanceData.map(record => ({
          student: record.student,
          status: record.status,
          notes: record.notes
        }))
      };

      await axios.post('http://localhost:3001/api/attendance', attendancePayload, config);
      
      setIsDialogOpen(false);
      setError('');
      fetchAttendanceRecords(); // Refresh the records
      alert('Attendance submitted successfully!');
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setError('Failed to submit attendance: ' + (error.response?.data?.message || error.message));
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Attendance Management
        </Typography>
        {user?.role === 'admin' && (
          <Button
            variant="outlined"
            onClick={syncInstructors}
            disabled={loading}
          >
            Sync Course Instructors
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Mark Attendance" />
        <Tab label="View Records" />
      </Tabs>

      {tabValue === 0 && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    type="date"
                    fullWidth
                    label="Date"
                    InputLabelProps={{ shrink: true }}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Course</InputLabel>
                    <Select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      label="Course"
                    >
                      {courses.length === 0 ? (
                        <MenuItem disabled>
                          {user?.role === 'faculty' ? 'No courses assigned to you' : 'No courses available'}
                        </MenuItem>
                      ) : (
                        courses.map((course) => (
                          <MenuItem key={course._id} value={course._id}>
                            {course.courseCode} - {course.title}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleMarkAttendance}
                    disabled={!selectedCourse || !selectedDate || students.length === 0}
                    sx={{ height: '56px' }}
                  >
                    Mark Attendance
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {courses.length === 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {user?.role === 'faculty' ? (
                <>
                  <Typography variant="body1" gutterBottom>
                    No courses are assigned to you yet.
                  </Typography>
                  <Typography variant="body2">
                    Please contact an administrator to assign courses to your faculty account.
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="body1" gutterBottom>
                    No courses are available in the system.
                  </Typography>
                  <Typography variant="body2">
                    Create courses in Course Management and assign faculty members to them. 
                    You can also use the "Sync Course Instructors" button above to sync existing course assignments.
                  </Typography>
                </>
              )}
            </Alert>
          )}

          {selectedCourse && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Students in Selected Course
                </Typography>
                {students.length === 0 ? (
                  <Alert severity="info">
                    No students enrolled in this course.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Student ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student._id}>
                            <TableCell>
                              <Chip label={student.studentId} size="small" />
                            </TableCell>
                            <TableCell>
                              {student.firstName} {student.lastName}
                            </TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>
                              <Chip 
                                label="Active" 
                                color="success" 
                                size="small" 
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Attendance Records
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Present</TableCell>
                    <TableCell>Absent</TableCell>
                    <TableCell>Late</TableCell>
                    <TableCell>Excused</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Box py={4}>
                          <Class sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="textSecondary">
                            No attendance records found
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Start by marking attendance for your courses
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendanceRecords.map((record) => {
                      const present = record.records?.filter(r => r.status === 'present').length || 0;
                      const absent = record.records?.filter(r => r.status === 'absent').length || 0;
                      const late = record.records?.filter(r => r.status === 'late').length || 0;
                      const excused = record.records?.filter(r => r.status === 'excused').length || 0;
                      const total = present + absent + late + excused;
                      
                      return (
                        <TableRow key={record._id}>
                          <TableCell>
                            {new Date(record.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {record.course?.courseCode || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {record.course?.title || 'Course not found'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={present} 
                              color="success" 
                              size="small" 
                              icon={<CheckCircle />}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={absent} 
                              color="error" 
                              size="small" 
                              icon={<Cancel />}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={late} 
                              color="warning" 
                              size="small" 
                              icon={<Schedule />}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={excused} 
                              color="info" 
                              size="small" 
                              icon={<Person />}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {total}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" color="primary">
                              <Edit />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Attendance Marking Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Mark Attendance - {courses.find(c => c._id === selectedCourse)?.courseCode} 
          ({new Date(selectedDate).toLocaleDateString()})
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData.map((record) => (
                  <TableRow key={record.student}>
                    <TableCell>
                      <Chip label={record.studentId} size="small" />
                    </TableCell>
                    <TableCell>{record.studentName}</TableCell>
                    <TableCell>
                      <RadioGroup
                        row
                        value={record.status}
                        onChange={(e) => updateAttendanceStatus(record.student, e.target.value)}
                      >
                        <FormControlLabel 
                          value="present" 
                          control={<Radio color="success" />} 
                          label="Present" 
                        />
                        <FormControlLabel 
                          value="absent" 
                          control={<Radio color="error" />} 
                          label="Absent" 
                        />
                        <FormControlLabel 
                          value="late" 
                          control={<Radio color="warning" />} 
                          label="Late" 
                        />
                        <FormControlLabel 
                          value="excused" 
                          control={<Radio color="info" />} 
                          label="Excused" 
                        />
                      </RadioGroup>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        placeholder="Notes (optional)"
                        value={record.notes}
                        onChange={(e) => updateAttendanceNotes(record.student, e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitAttendance} 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Attendance'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AttendanceManagement;