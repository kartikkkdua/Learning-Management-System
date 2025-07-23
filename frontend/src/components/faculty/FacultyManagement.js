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
  Chip
} from '@mui/material';
import axios from 'axios';

const FacultyManagement = () => {
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      // Fetch faculty members
      const membersRes = await axios.get('http://localhost:3001/api/admin/faculty', config);
      setFacultyMembers(membersRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };





  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Faculty Management
      </Typography>

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
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading faculty members...
                </TableCell>
              </TableRow>
            ) : facultyMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default FacultyManagement;