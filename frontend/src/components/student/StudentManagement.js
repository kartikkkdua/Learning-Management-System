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
  Delete
} from '@mui/icons-material';
import axios from 'axios';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    year: 1,
    status: 'active'
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    setFilteredStudents(students);
  }, [students]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.get('http://localhost:3001/api/admin/students', config);
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const syncStudentUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const response = await axios.post('http://localhost:3001/api/admin/students/sync-users', {}, config);
      
      if (response.data.success) {
        alert(`Sync completed: ${response.data.data.created} created, ${response.data.data.updated} updated`);
        fetchStudents(); // Refresh the list
      }
    } catch (error) {
      console.error('Error syncing student users:', error);
      alert('Error syncing student users: ' + (error.response?.data?.message || error.message));
    }
  };



  const handleSubmit = async () => {
    try {
      if (editingStudent) {
        await axios.put(`http://localhost:3001/api/students/${editingStudent._id}`, formData);
      } else {
        await axios.post('http://localhost:3001/api/students', formData);
      }
      fetchStudents();
      handleClose();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`http://localhost:3001/api/students/${id}`);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      year: student.year,
      status: student.status
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingStudent(null);
    setFormData({
      studentId: '',
      firstName: '',
      lastName: '',
      email: '',
      year: 1,
      status: 'active'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'graduated': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Student Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={syncStudentUsers}
          >
            Sync Student Users
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
          >
            Add Student
          </Button>
        </Box>
      </Box>



      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Enrolled</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student._id}>
                <TableCell>
                  <Chip label={student.studentId} variant="outlined" size="small" />
                </TableCell>
                <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>Year {student.year}</TableCell>
                <TableCell>
                  <Chip
                    label={student.status.toUpperCase()}
                    color={getStatusColor(student.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(student.enrollmentDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(student)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(student._id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingStudent ? 'Edit Student' : 'Add New Student'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Student ID"
                fullWidth
                variant="outlined"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="First Name"
                fullWidth
                variant="outlined"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Last Name"
                fullWidth
                variant="outlined"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Year</InputLabel>
                <Select
                  value={formData.year}
                  label="Year"
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                >
                  <MenuItem value={1}>Year 1</MenuItem>
                  <MenuItem value={2}>Year 2</MenuItem>
                  <MenuItem value={3}>Year 3</MenuItem>
                  <MenuItem value={4}>Year 4</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="graduated">Graduated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingStudent ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentManagement;