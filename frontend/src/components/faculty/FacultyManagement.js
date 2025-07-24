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
  Paper,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel
} from '@mui/icons-material';
import axios from 'axios';

const FacultyManagement = () => {
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    employeeId: '',
    position: '',
    department: '',
    status: '',
    firstName: '',
    lastName: '',
    email: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      // Fetch faculty members and departments
      const [membersRes, departmentsRes] = await Promise.all([
        axios.get('http://localhost:3001/api/admin/faculty', config),
        axios.get('http://localhost:3001/api/faculties', config).catch(() => ({ data: [] }))
      ]);
      
      setFacultyMembers(membersRes.data.data || []);
      setDepartments(departmentsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load faculty data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      employeeId: faculty.employeeId || '',
      position: faculty.position || '',
      department: faculty.department?._id || '',
      status: faculty.status || 'pending',
      firstName: faculty.user?.profile?.firstName || '',
      lastName: faculty.user?.profile?.lastName || '',
      email: faculty.user?.email || ''
    });
    setEditDialog(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      // Update faculty member details
      const facultyUpdateData = {
        employeeId: formData.employeeId,
        position: formData.position,
        department: formData.department,
        status: formData.status
      };

      // Update user profile
      const userUpdateData = {
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName
        },
        email: formData.email
      };

      // Update faculty member
      await axios.put(`http://localhost:3001/api/admin/faculty/${editingFaculty._id}`, facultyUpdateData, config);
      
      // Update user profile
      if (editingFaculty.user?._id) {
        await axios.put(`http://localhost:3001/api/admin/users/${editingFaculty.user._id}`, userUpdateData, config);
      }

      setSuccess('Faculty member updated successfully!');
      setEditDialog(false);
      setEditingFaculty(null);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating faculty:', error);
      setError('Failed to update faculty member: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancel = () => {
    setEditDialog(false);
    setEditingFaculty(null);
    setFormData({
      employeeId: '',
      position: '',
      department: '',
      status: '',
      firstName: '',
      lastName: '',
      email: ''
    });
  };





  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Faculty Management
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Join Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading faculty members...
                </TableCell>
              </TableRow>
            ) : facultyMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No faculty members found
                </TableCell>
              </TableRow>
            ) : (
              facultyMembers.map((faculty) => (
                <TableRow key={faculty._id}>
                  <TableCell>
                    <Chip label={faculty.employeeId} color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    {faculty.user?.profile?.firstName} {faculty.user?.profile?.lastName}
                    <br />
                    <Typography variant="caption" color="textSecondary">
                      @{faculty.user?.username}
                    </Typography>
                  </TableCell>
                  <TableCell>{faculty.user?.email}</TableCell>
                  <TableCell>{faculty.department?.name || 'N/A'}</TableCell>
                  <TableCell>{faculty.position}</TableCell>
                  <TableCell>
                    <Chip
                      label={faculty.status}
                      color={
                        faculty.status === 'approved' ? 'success' :
                          faculty.status === 'pending' ? 'warning' : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {faculty.joinDate
                      ? new Date(faculty.joinDate).toLocaleDateString()
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleEdit(faculty)} 
                      color="primary"
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Faculty Dialog */}
      <Dialog open={editDialog} onClose={handleCancel} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit Faculty Member
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Employee ID"
                fullWidth
                variant="outlined"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="First Name"
                fullWidth
                variant="outlined"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Last Name"
                fullWidth
                variant="outlined"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                fullWidth
                variant="outlined"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Position"
                fullWidth
                variant="outlined"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g., Professor, Associate Professor, Lecturer"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  label="Department"
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <MenuItem key={dept._id} value={dept._id}>
                        {dept.name} ({dept.code})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="">
                      No departments available
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<Save />}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FacultyManagement;