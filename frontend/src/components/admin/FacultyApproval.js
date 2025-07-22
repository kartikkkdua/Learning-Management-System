import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Person,
  Email,
  School,
  AccessTime
} from '@mui/icons-material';
import axios from 'axios';

const FacultyApproval = () => {
  const [pendingFaculty, setPendingFaculty] = useState([]);
  const [allFaculty, setAllFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const [pendingRes, allRes, statsRes] = await Promise.all([
        axios.get('http://localhost:3001/api/admin/faculty/pending', config),
        axios.get('http://localhost:3001/api/admin/faculty', config),
        axios.get('http://localhost:3001/api/admin/stats', config)
      ]);

      setPendingFaculty(pendingRes.data.data);
      setAllFaculty(allRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      await axios.post(
        `http://localhost:3001/api/admin/faculty/${selectedFaculty._id}/approve`,
        { position: selectedPosition },
        config
      );

      showSnackbar('Faculty member approved successfully', 'success');
      setApprovalDialog(false);
      setSelectedFaculty(null);
      setSelectedPosition('');
      fetchData();
    } catch (error) {
      console.error('Error approving faculty:', error);
      showSnackbar('Error approving faculty member', 'error');
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      await axios.post(
        `http://localhost:3001/api/admin/faculty/${selectedFaculty._id}/reject`,
        { reason: rejectionReason },
        config
      );

      showSnackbar('Faculty member rejected', 'info');
      setRejectionDialog(false);
      setSelectedFaculty(null);
      setRejectionReason('');
      fetchData();
    } catch (error) {
      console.error('Error rejecting faculty:', error);
      showSnackbar('Error rejecting faculty member', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Faculty Management
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Person color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.faculty?.total || 0}</Typography>
                  <Typography color="textSecondary">Total Faculty</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AccessTime color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.faculty?.pending || 0}</Typography>
                  <Typography color="textSecondary">Pending Approval</Typography>
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
                  <Typography variant="h4">{stats.faculty?.approved || 0}</Typography>
                  <Typography color="textSecondary">Approved</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Cancel color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.faculty?.rejected || 0}</Typography>
                  <Typography color="textSecondary">Rejected</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Approvals */}
      {pendingFaculty.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pending Faculty Approvals ({pendingFaculty.length})
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              These faculty members are waiting for approval to access the system.
            </Alert>
            <Grid container spacing={2}>
              {pendingFaculty.map((faculty) => (
                <Grid item xs={12} md={6} key={faculty._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ mr: 2 }}>
                          {faculty.user.profile?.firstName?.[0] || faculty.user.username[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {faculty.user.profile?.firstName} {faculty.user.profile?.lastName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            @{faculty.user.username}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mb={1}>
                        <Email sx={{ mr: 1, fontSize: 16 }} />
                        <Typography variant="body2">{faculty.user.email}</Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mb={2}>
                        <School sx={{ mr: 1, fontSize: 16 }} />
                        <Typography variant="body2">
                          {faculty.department?.name} ({faculty.position})
                        </Typography>
                      </Box>
                      
                      <Typography variant="caption" color="textSecondary" display="block" mb={2}>
                        Applied: {new Date(faculty.createdAt).toLocaleDateString()}
                      </Typography>
                      
                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircle />}
                          onClick={() => {
                            setSelectedFaculty(faculty);
                            setSelectedPosition(faculty.position);
                            setApprovalDialog(true);
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Cancel />}
                          onClick={() => {
                            setSelectedFaculty(faculty);
                            setRejectionDialog(true);
                          }}
                        >
                          Reject
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* All Faculty Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Faculty Members
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Join Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allFaculty.map((faculty) => (
                  <TableRow key={faculty._id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                          {faculty.user.profile?.firstName?.[0] || faculty.user.username[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {faculty.user.profile?.firstName} {faculty.user.profile?.lastName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            @{faculty.user.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{faculty.user.email}</TableCell>
                    <TableCell>{faculty.department?.name}</TableCell>
                    <TableCell>{faculty.position}</TableCell>
                    <TableCell>
                      <Chip
                        label={faculty.status}
                        color={getStatusColor(faculty.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(faculty.joinDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)}>
        <DialogTitle>Approve Faculty Member</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Approve {selectedFaculty?.user.profile?.firstName} {selectedFaculty?.user.profile?.lastName} as faculty?
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Position</InputLabel>
            <Select
              value={selectedPosition}
              label="Position"
              onChange={(e) => setSelectedPosition(e.target.value)}
            >
              <MenuItem value="Professor">Professor</MenuItem>
              <MenuItem value="Associate Professor">Associate Professor</MenuItem>
              <MenuItem value="Assistant Professor">Assistant Professor</MenuItem>
              <MenuItem value="Lecturer">Lecturer</MenuItem>
              <MenuItem value="Instructor">Instructor</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
          <Button onClick={handleApprove} variant="contained" color="success">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialog} onClose={() => setRejectionDialog(false)}>
        <DialogTitle>Reject Faculty Application</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Reject {selectedFaculty?.user.profile?.firstName} {selectedFaculty?.user.profile?.lastName}'s faculty application?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for rejection (optional)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialog(false)}>Cancel</Button>
          <Button onClick={handleReject} variant="contained" color="error">
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FacultyApproval;