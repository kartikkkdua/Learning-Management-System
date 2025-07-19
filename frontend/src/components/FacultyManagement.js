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
  Chip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete
} from '@mui/icons-material';
import axios from 'axios';

const FacultyManagement = () => {
  const [faculties, setFaculties] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    dean: '',
    established: ''
  });

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/faculties');
      setFaculties(response.data);
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingFaculty) {
        await axios.put(`http://localhost:3001/api/faculties/${editingFaculty._id}`, formData);
      } else {
        await axios.post('http://localhost:3001/api/faculties', formData);
      }
      fetchFaculties();
      handleClose();
    } catch (error) {
      console.error('Error saving faculty:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty?')) {
      try {
        await axios.delete(`http://localhost:3001/api/faculties/${id}`);
        fetchFaculties();
      } catch (error) {
        console.error('Error deleting faculty:', error);
      }
    }
  };

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name,
      code: faculty.code,
      description: faculty.description || '',
      dean: faculty.dean || '',
      established: faculty.established ? faculty.established.split('T')[0] : ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingFaculty(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      dean: '',
      established: ''
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Faculty Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Faculty
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Dean</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Established</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {faculties.map((faculty) => (
              <TableRow key={faculty._id}>
                <TableCell>
                  <Chip label={faculty.code} color="primary" size="small" />
                </TableCell>
                <TableCell>{faculty.name}</TableCell>
                <TableCell>{faculty.dean || 'N/A'}</TableCell>
                <TableCell>{faculty.description || 'N/A'}</TableCell>
                <TableCell>
                  {faculty.established 
                    ? new Date(faculty.established).getFullYear()
                    : 'N/A'
                  }
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(faculty)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(faculty._id)} color="error">
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
          {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Faculty Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Faculty Code"
            fullWidth
            variant="outlined"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Dean"
            fullWidth
            variant="outlined"
            value={formData.dean}
            onChange={(e) => setFormData({ ...formData, dean: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Established Date"
            type="date"
            fullWidth
            variant="outlined"
            slotProps={{
              inputLabel: { shrink: true }
            }}
            value={formData.established}
            onChange={(e) => setFormData({ ...formData, established: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingFaculty ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FacultyManagement;