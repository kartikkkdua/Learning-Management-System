import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  LinearProgress,
  Grid,
  Divider
} from '@mui/material';
import {
  Download,
  Person,
  Schedule,
  Assessment,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { API_URL } from '../../config/api';

const AttendanceReport = ({ classroomId, onClose }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendanceReport();
  }, [classroomId]);

  const fetchAttendanceReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/virtual-classroom/${classroomId}/attendance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAttendanceData(data.attendanceReport);
      } else {
        setError(data.message || 'Failed to fetch attendance report');
      }
    } catch (error) {
      setError('Network error while fetching attendance report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!attendanceData) return;

    const csvContent = [
      ['Name', 'Email', 'Joined At', 'Left At', 'Duration (minutes)', 'Attendance %'].join(','),
      ...attendanceData.attendees.map(attendee => [
        attendee.user.name,
        attendee.user.email,
        attendee.joinedAt ? new Date(attendee.joinedAt).toLocaleString() : 'N/A',
        attendee.leftAt ? new Date(attendee.leftAt).toLocaleString() : 'Still in meeting',
        attendee.duration || 0,
        attendee.attendancePercentage || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${attendanceData.classroomInfo.title}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!attendanceData) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No attendance data available
      </Alert>
    );
  }

  const { classroomInfo, totalAttendees, attendees } = attendanceData;
  const averageAttendance = attendees.length > 0 
    ? Math.round(attendees.reduce((sum, a) => sum + (a.attendancePercentage || 0), 0) / attendees.length)
    : 0;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Attendance Report
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportToCSV}
            sx={{ mr: 1 }}
          >
            Export CSV
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>

      {/* Classroom Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {classroomInfo.title}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center">
                <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Scheduled Time
                  </Typography>
                  <Typography variant="body1">
                    {new Date(classroomInfo.scheduledTime).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center">
                <Assessment sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">
                    {formatDuration(classroomInfo.duration)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center">
                <Person sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Attendees
                  </Typography>
                  <Typography variant="body1">
                    {totalAttendees}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center">
                <CheckCircle sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Average Attendance
                  </Typography>
                  <Typography variant="body1">
                    {averageAttendance}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detailed Attendance
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Joined At</TableCell>
                  <TableCell>Left At</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Attendance %</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendees.map((attendee, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                          {attendee.user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {attendee.user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {attendee.user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {attendee.joinedAt 
                        ? new Date(attendee.joinedAt).toLocaleTimeString()
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      {attendee.leftAt 
                        ? new Date(attendee.leftAt).toLocaleTimeString()
                        : 'Still in meeting'
                      }
                    </TableCell>
                    <TableCell>
                      {formatDuration(attendee.duration)}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={attendee.attendancePercentage || 0}
                          sx={{ width: 60, height: 6 }}
                          color={getAttendanceColor(attendee.attendancePercentage || 0)}
                        />
                        <Typography variant="body2">
                          {attendee.attendancePercentage || 0}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={
                          (attendee.attendancePercentage || 0) >= 80 
                            ? <CheckCircle /> 
                            : <Cancel />
                        }
                        label={
                          (attendee.attendancePercentage || 0) >= 80 
                            ? 'Present' 
                            : 'Absent'
                        }
                        color={getAttendanceColor(attendee.attendancePercentage || 0)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {attendees.length === 0 && (
            <Box textAlign="center" py={4}>
              <Person sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No attendance data available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Attendance will be recorded when the meeting starts
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AttendanceReport;