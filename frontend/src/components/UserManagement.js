import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Person,
  AdminPanelSettings,
  School
} from '@mui/icons-material';
import axios from 'axios';

const UserManagement = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [addDialog, setAddDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    role: '',
    profile: {
      firstName: '',
      lastName: '',
      phone: ''
    }
  });
  const [addForm, setAddForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student',
    profile: {
      firstName: '',
      lastName: '',
      phone: ''
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data);
      setError(''); // Clear any previous errors
    } catch (error) {
      if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError(`Failed to fetch users: ${error.response?.data?.message || error.message}`);
      }
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userToEdit) => {
    setSelectedUser(userToEdit);
    setEditForm({
      username: userToEdit.username,
      email: userToEdit.email,
      role: userToEdit.role,
      profile: {
        firstName: userToEdit.profile?.firstName || '',
        lastName: userToEdit.profile?.lastName || '',
        phone: userToEdit.profile?.phone || ''
      }
    });
    setEditDialog(true);
  };

  const handleAdd = () => {
    setAddForm({
      username: '',
      email: '',
      password: '',
      role: 'student',
      profile: {
        firstName: '',
        lastName: '',
        phone: ''
      }
    });
    setAddDialog(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/api/users/${selectedUser._id}`, editForm, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setEditDialog(false);
      fetchUsers();
      setError('');
    } catch (error) {
      setError(`Failed to update user: ${error.response?.data?.message || error.message}`);
      console.error('Error updating user:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/users', addForm, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAddDialog(false);
      fetchUsers();
      setError('');
    } catch (error) {
      setError(`Failed to create user: ${error.response?.data?.message || error.message}`);
      console.error('Error creating user:', error);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3001/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        fetchUsers();
        setError('');
      } catch (error) {
        setError(`Failed to delete user: ${error.response?.data?.message || error.message}`);
        console.error('Error deleting user:', error);
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettings />;
      case 'faculty':
        return <School />;
      default:
        return <Person />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'faculty':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (loading) return <div>Loading users...</div>;

  // Show message if no users found
  if (!loading && users.length === 0 && !error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>User Management</Typography>
        <Alert severity="info">
          No users found. This could mean:
          <ul>
            <li>The database is empty</li>
            <li>The backend server is not running</li>
            <li>You don't have admin privileges</li>
          </ul>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">User Management</Typography>
        <Button variant="contained" startIcon={<Add />}>
          Add User
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((userRow) => (
              <TableRow key={userRow._id}>
                <TableCell>{userRow.username}</TableCell>
                <TableCell>
                  {userRow.profile?.firstName && userRow.profile?.lastName
                    ? `${userRow.profile.firstName} ${userRow.profile.lastName}`
                    : 'N/A'}
                </TableCell>
                <TableCell>{userRow.email}</TableCell>
                <TableCell>
                  <Chip
                    icon={getRoleIcon(userRow.role)}
                    label={userRow.role.toUpperCase()}
                    color={getRoleColor(userRow.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{userRow.profile?.phone || 'N/A'}</TableCell>
                <TableCell>
                  {new Date(userRow.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(userRow)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(userRow._id)} 
                    color="error"
                    disabled={userRow._id === user._id}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit User Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Username"
            fullWidth
            value={editForm.username}
            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box display="flex" gap={2} mb={2}>
            <TextField
              label="First Name"
              value={editForm.profile.firstName}
              onChange={(e) => setEditForm({
                ...editForm,
                profile: { ...editForm.profile, firstName: e.target.value }
              })}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={editForm.profile.lastName}
              onChange={(e) => setEditForm({
                ...editForm,
                profile: { ...editForm.profile, lastName: e.target.value }
              })}
              fullWidth
            />
          </Box>
          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            value={editForm.profile.phone}
            onChange={(e) => setEditForm({
              ...editForm,
              profile: { ...editForm.profile, phone: e.target.value }
            })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={editForm.role}
              label="Role"
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="faculty">Faculty</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;