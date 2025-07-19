import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  EventNote,
  CheckCircle,
  Cancel,
  Schedule,
  TrendingUp
} from '@mui/icons-material';
import axios from 'axios';

const StudentAttendance = ({ user }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [attendanceStats, setAttendanceStats] = useState({
    overallPercentage: 92.5,
    totalClasses: 48,
    attended: 44,
    absent: 3,
    late: 1,
    excused: 0
  });

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const studentId = user.id || user._id;
      const response = await axios.get(`http://localhost:3001/api/students/${studentId}/attendance`);
      setAttendanceData(response.data);
      
      // Update overall attendance stats based on real data
      if (response.data.length > 0) {
        const totalClasses = response.data.reduce((sum, course) => sum + course.totalClasses, 0);
        const attended = response.data.reduce((sum, course) => sum + course.present, 0);
        const absent = response.data.reduce((sum, course) => sum + course.absent, 0);
        const late = response.data.reduce((sum, course) => sum + course.late, 0);
        const excused = response.data.reduce((sum, course) => sum + course.excused, 0);
        const overallPercentage = totalClasses > 0 ? ((attended + late + excused) / totalClasses) * 100 : 0;
        
        setAttendanceStats({
          overallPercentage: overallPercentage.toFixed(1),
          totalClasses,
          attended: attended + late + excused, // Count late and excused as attended
          absent,
          late,
          excused
        });
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceData([]); // Fallback to empty array
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'excused': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle />;
      case 'absent': return <Cancel />;
      case 'late': return <Schedule />;
      case 'excused': return <EventNote />;
      default: return null;
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color: color, fontSize: 40 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const filteredData = selectedCourse === 'all' ? attendanceData : 
    attendanceData.filter(item => item.course.courseCode === selectedCourse);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Attendance
      </Typography>
      
      {/* Overall Statistics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overall Attendance"
            value={`${attendanceStats.overallPercentage}%`}
            icon={<TrendingUp />}
            color="primary.main"
            subtitle={`${attendanceStats.attended}/${attendanceStats.totalClasses} classes`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Present"
            value={attendanceStats.attended}
            icon={<CheckCircle />}
            color="success.main"
            subtitle="Classes attended"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Absent"
            value={attendanceStats.absent}
            icon={<Cancel />}
            color="error.main"
            subtitle="Classes missed"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Late"
            value={attendanceStats.late}
            icon={<Schedule />}
            color="warning.main"
            subtitle="Late arrivals"
          />
        </Grid>
      </Grid>

      {/* Course Filter */}
      <Box mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Course</InputLabel>
          <Select
            value={selectedCourse}
            label="Filter by Course"
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <MenuItem value="all">All Courses</MenuItem>
            {attendanceData.map((item) => (
              <MenuItem key={item.course.courseCode} value={item.course.courseCode}>
                {item.course.courseCode} - {item.course.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Course-wise Attendance */}
      <Grid container spacing={3}>
        {filteredData.map((courseData) => (
          <Grid item xs={12} key={courseData.course.courseCode}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6">
                    {courseData.course.title}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    {courseData.course.courseCode}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={3}>
                  <Box textAlign="center">
                    <Typography variant="h5" color={courseData.percentage >= 80 ? 'success.main' : 'warning.main'}>
                      {courseData.percentage.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Attendance Rate
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6">
                      {courseData.attended}/{courseData.totalClasses}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Classes Attended
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box mb={3}>
                <LinearProgress 
                  variant="determinate" 
                  value={courseData.percentage} 
                  color={courseData.percentage >= 80 ? 'success' : 'warning'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="success.main">
                      {courseData.attended}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Present
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="error.main">
                      {courseData.absent}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Absent
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="warning.main">
                      {courseData.late}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Late
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="info.main">
                      {courseData.excused}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Excused
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Recent Attendance
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courseData.recentRecords.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(record.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={record.status.toUpperCase()} 
                            color={getStatusColor(record.status)} 
                            size="small"
                            icon={getStatusIcon(record.status)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {filteredData.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <EventNote sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Attendance Records Found
          </Typography>
          <Typography color="textSecondary">
            Your attendance records will appear here once classes begin.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default StudentAttendance;