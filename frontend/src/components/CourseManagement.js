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
  IconButton,
  Box,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  People
} from '@mui/icons-material';
import axios from 'axios';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);

  const [open, setOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    title: '',
    description: '',
    credits: 3,
    semester: 'Fall',
    year: new Date().getFullYear(),
    capacity: 30,
    schedule: {
      days: [],
      startTime: '',
      endTime: '',
      room: ''
    }
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('http://localhost:3001/api/courses', config);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };



  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      // Don't include faculty assignment - that's handled by Course-Faculty Assignment
      const courseData = { ...formData };

      if (editingCourse) {
        await axios.put(`http://localhost:3001/api/courses/${editingCourse._id}`, courseData, config);
      } else {
        await axios.post('http://localhost:3001/api/courses', courseData, config);
      }
      fetchCourses();
      handleClose();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };
        await axios.delete(`http://localhost:3001/api/courses/${id}`, config);
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode,
      title: course.title,
      description: course.description || '',
      credits: course.credits,

      semester: course.semester,
      year: course.year,
      capacity: course.capacity,
      schedule: course.schedule || {
        days: [],
        startTime: '',
        endTime: '',
        room: ''
      }
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCourse(null);
    setFormData({
      courseCode: '',
      title: '',
      description: '',
      credits: 3,

      semester: 'Fall',
      year: new Date().getFullYear(),
      capacity: 30,
      schedule: {
        days: [],
        startTime: '',
        endTime: '',
        room: ''
      }
    });
  };

  const getSemesterColor = (semester) => {
    switch (semester) {
      case 'Fall': return 'warning';
      case 'Spring': return 'success';
      case 'Summer': return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Course Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Course
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course Code</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Assigned Faculty</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Enrolled</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course._id}>
                <TableCell>
                  <Chip label={course.courseCode} color="primary" size="small" />
                </TableCell>
                <TableCell>{course.title}</TableCell>
                <TableCell>
                  {course.faculty || course.instructor ? (
                    <Chip 
                      label={`${(course.faculty?.user?.profile?.firstName || course.instructor?.user?.profile?.firstName) || ''} ${(course.faculty?.user?.profile?.lastName || course.instructor?.user?.profile?.lastName) || ''} (${(course.faculty?.employeeId || course.instructor?.employeeId) || 'No ID'})`} 
                      color="secondary" 
                      size="small" 
                    />
                  ) : (
                    <Chip 
                      label="No Faculty Assigned" 
                      color="default" 
                      size="small" 
                    />
                  )}
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
                    {course.enrolledStudents?.length || 0}/{course.capacity}
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
                    </Box>
                  ) : 'TBA'}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(course)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(course._id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCourse ? 'Edit Course' : 'Add New Course'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="info.contrastText">
              📝 Note: Faculty assignment is managed through the "Course-Faculty Assignment" section
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                autoFocus
                margin="dense"
                label="Course Code"
                fullWidth
                variant="outlined"
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Credits"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                slotProps={{
                  htmlInput: { min: 1, max: 6 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Course Title"
                fullWidth
                variant="outlined"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Semester</InputLabel>
                <Select
                  value={formData.semester}
                  label="Semester"
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                >
                  <MenuItem value="Fall">Fall</MenuItem>
                  <MenuItem value="Spring">Spring</MenuItem>
                  <MenuItem value="Summer">Summer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                label="Year"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Capacity"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Room"
                fullWidth
                variant="outlined"
                value={formData.schedule.room}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  schedule: { ...formData.schedule, room: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Start Time"
                type="time"
                fullWidth
                variant="outlined"
                slotProps={{
                  inputLabel: { shrink: true }
                }}
                value={formData.schedule.startTime}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  schedule: { ...formData.schedule, startTime: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="End Time"
                type="time"
                fullWidth
                variant="outlined"
                slotProps={{
                  inputLabel: { shrink: true }
                }}
                value={formData.schedule.endTime}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  schedule: { ...formData.schedule, endTime: e.target.value }
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCourse ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseManagement;