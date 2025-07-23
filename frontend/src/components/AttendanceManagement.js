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
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  Snackbar
} from '@mui/material';
import {
  LocationOn,
  Timer,
  CheckCircle,
  Cancel,
  Schedule,
  Person,
  Analytics,
  Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';

const AttendanceManagement = ({ user }) => {
  // State variables that were missing
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Existing states
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [statsOpen, setStatsOpen] = useState(false);
  const [studentStats, setStudentStats] = useState([]);

  useEffect(() => {
    fetchAttendanceRecords();
    fetchCourses();
    fetchStudents();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get('http://localhost:3001/api/attendance', config);
      setAttendanceRecords(response.data);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get('http://localhost:3001/api/courses', config);
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

  const handleMarkAttendance = () => {
    if (!selectedCourse) {
      alert('Please select a course');
      return;
    }

    const course = courses.find(c => c._id === selectedCourse);
    const enrolledStudents = course?.enrolledStudents || [];

    const initialAttendance = enrolledStudents.map(student => ({
      student: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      studentId: student.studentId,
      status: 'present',
      notes: ''
    }));

    setAttendanceData(initialAttendance);
    setIsOpen(true);
  };

  const handleSubmitAttendance = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const attendancePayload = {
        course: selectedCourse,
        date: selectedDate,
        records: attendanceData.map(record => ({
          student: record.student,
          status: record.status,
          notes: record.notes
        })),
        markedBy: user.id || user._id
      };

      await axios.post('http://localhost:3001/api/attendance', attendancePayload);
      fetchAttendanceRecords();
      setIsOpen(false);
      setAttendanceData([]);
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  };

  const updateAttendanceStatus = (studentId, status) => {
    setAttendanceData(prev =>
      prev.map(record =>
        record.student === studentId
          ? { ...record, status }
          : record
      )
    );
  };

  const updateAttendanceNotes = (studentId, notes) => {
    setAttendanceData(prev =>
      prev.map(record =>
        record.student === studentId
          ? { ...record, notes }
          : record
      )
    );
  };

  const fetchStudentStats = async () => {
    try {
      const statsPromises = students.map(async (student) => {
        const response = await axios.get(`http://localhost:3001/api/attendance/student/${student._id}/stats`);
        return {
          student,
          stats: response.data
        };
      });
      const stats = await Promise.all(statsPromises);
      setStudentStats(stats);
      setStatsOpen(true);
    } catch (error) {
      console.error('Error fetching student stats:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Attendance Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Analytics />}
            onClick={fetchStudentStats}
          >
            View Statistics
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleMarkAttendance}
          >
            Mark Attendance
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Course</InputLabel>
            <Select
              value={selectedCourse}
              label="Select Course"
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              {courses.map((course) => (
                <MenuItem key={course._id} value={course._id}>
                  {course.courseCode} - {course.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Present</TableCell>
              <TableCell>Absent</TableCell>
              <TableCell>Late</TableCell>
              <TableCell>Excused</TableCell>
              <TableCell>Total Students</TableCell>
              <TableCell>Marked By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceRecords.map((record) => {
              const present = record.records.filter(r => r.status === 'present').length;
              const absent = record.records.filter(r => r.status === 'absent').length;
              const late = record.records.filter(r => r.status === 'late').length;
              const excused = record.records.filter(r => r.status === 'excused').length;

              return (
                <TableRow key={record._id}>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {record.course ? (
                      <Chip
                        label={record.course.courseCode}
                        color="primary"
                        size="small"
                      />
                    ) : (
                      <Chip
                        label="No Course Assigned"
                        color="default"
                        size="small"
                      />
                    )}
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
                    />
                  </TableCell>
                  <TableCell>{record.records.length}</TableCell>
                  <TableCell>
                    {record.markedBy?.profile?.firstName} {record.markedBy?.profile?.lastName}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mark Attendance Dialog */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Mark Attendance - {courses.find(c => c._id === selectedCourse)?.courseCode} ({selectedDate})
        </DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {attendanceData.map((record) => (
              <Card key={record.student} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Typography variant="h6">
                        {record.studentName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ID: {record.studentId}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <FormControl component="fieldset">
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
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        size="small"
                        label="Notes"
                        value={record.notes}
                        onChange={(e) => updateAttendanceNotes(record.student, e.target.value)}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitAttendance} variant="contained">
            Save Attendance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Statistics Dialog */}
      <Dialog open={statsOpen} onClose={() => setStatsOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Attendance Statistics</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {studentStats.map((studentStat) => (
              <Grid item xs={12} md={6} lg={4} key={studentStat.student._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {studentStat.student.firstName} {studentStat.student.lastName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      ID: {studentStat.student.studentId}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    {studentStat.stats.map((courseStat) => (
                      <Box key={courseStat._id} mb={2}>
                        <Typography variant="subtitle2">
                          {courseStat.course ? courseStat.course.courseCode : 'Unknown Course'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Attendance: {courseStat.attendancePercentage.toFixed(1)}%
                        </Typography>
                        <Box display="flex" gap={1} mt={1}>
                          <Chip
                            label={`P: ${courseStat.present}`}
                            color="success"
                            size="small"
                          />
                          <Chip
                            label={`A: ${courseStat.absent}`}
                            color="error"
                            size="small"
                          />
                          <Chip
                            label={`L: ${courseStat.late}`}
                            color="warning"
                            size="small"
                          />
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AttendanceManagement;
