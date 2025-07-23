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
  CardContent
} from '@mui/material';
import axios from 'axios';

const AttendanceManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);

  useEffect(() => {
    // Fetch course and section options
    axios.get('/api/courses').then((res) => setCourseOptions(res.data));
    axios.get('/api/sections').then((res) => setSectionOptions(res.data));
  }, []);

  useEffect(() => {
    if (selectedCourse && selectedSection) {
      axios
        .get(`/api/students?course=${selectedCourse}&section=${selectedSection}`)
        .then((res) => setStudents(res.data));
    }
  }, [selectedCourse, selectedSection]);

  const handleMarkAttendance = () => {
    const defaultAttendance = students.map((student) => ({
      student: student.id,
      studentName: student.name,
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

  const handleSubmitAttendance = () => {
    axios
      .post('/api/attendance', {
        date: selectedDate,
        course: selectedCourse,
        section: selectedSection,
        records: attendanceData,
      })
      .then(() => {
        alert('Attendance submitted!');
        setIsDialogOpen(false);
      })
      .catch((err) => {
        console.error(err);
        alert('Error submitting attendance');
      });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Attendance Management
      </Typography>

      <Grid container spacing={2} marginBottom={2}>
        <Grid item xs={12} md={3}>
          <TextField
            type="date"
            fullWidth
            label="Date"
            InputLabelProps={{ shrink: true }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Course</InputLabel>
            <Select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              label="Course"
            >
              {courseOptions.map((course) => (
                <MenuItem key={course} value={course}>
                  {course}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Section</InputLabel>
            <Select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              label="Section"
            >
              {sectionOptions.map((section) => (
                <MenuItem key={section} value={section}>
                  {section}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3} display="flex" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleMarkAttendance}
            fullWidth
            disabled={!selectedDate || !selectedCourse || !selectedSection}
          >
            Mark Attendance
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Student ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceData.map((record) => (
              <TableRow key={record.student}>
                <TableCell>{record.studentName}</TableCell>
                <TableCell>{record.studentId}</TableCell>
                <TableCell>{record.status}</TableCell>
                <TableCell>{record.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog inserted here */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Mark Attendance</DialogTitle>
        <DialogContent>
          {attendanceData.map((record) => (
            <Box key={record.student} display="flex" alignItems="center" mb={2}>
              <Typography sx={{ width: '25%' }}>
                {record.studentName} ({record.studentId})
              </Typography>
              <RadioGroup
                row
                value={record.status}
                onChange={(e) => updateAttendanceStatus(record.student, e.target.value)}
              >
                <FormControlLabel value="present" control={<Radio />} label="Present" />
                <FormControlLabel value="absent" control={<Radio />} label="Absent" />
                <FormControlLabel value="late" control={<Radio />} label="Late" />
                <FormControlLabel value="excused" control={<Radio />} label="Excused" />
              </RadioGroup>
              <TextField
                label="Notes"
                size="small"
                sx={{ ml: 2 }}
                value={record.notes}
                onChange={(e) => updateAttendanceNotes(record.student, e.target.value)}
              />
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitAttendance}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AttendanceManagement;
