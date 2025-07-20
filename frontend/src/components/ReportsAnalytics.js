import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import {
  TrendingUp,
  People,
  School,
  Assignment,
  Download,
  Analytics
} from '@mui/icons-material';
import axios from 'axios';

const ReportsAnalytics = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      // Fetch various statistics with proper error handling
      const requests = [
        axios.get('http://localhost:3001/api/users', { headers }).catch(() => ({ data: [] })),
        axios.get('http://localhost:3001/api/courses', { headers }).catch(() => ({ data: [] })),
        axios.get('http://localhost:3001/api/enrollments', { headers }).catch(() => ({ data: [] }))
      ];

      const [usersRes, coursesRes, enrollmentsRes] = await Promise.all(requests);

      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const courses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
      const enrollments = Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : [];

      setStats({
        totalUsers: users.length,
        totalStudents: users.filter(u => u.role === 'student').length,
        totalFaculty: users.filter(u => u.role === 'faculty').length,
        totalCourses: courses.length,
        totalEnrollments: enrollments.length,
        recentActivity: [
          { action: 'New user registration', count: users.filter(u => {
            const createdDate = new Date(u.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return createdDate > weekAgo;
          }).length, date: new Date().toISOString().split('T')[0] },
          { action: 'Total course enrollments', count: enrollments.length, date: new Date().toISOString().split('T')[0] },
          { action: 'Active courses', count: courses.length, date: new Date().toISOString().split('T')[0] }
        ]
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set default values if API calls fail
      setStats({
        totalUsers: 0,
        totalStudents: 0,
        totalFaculty: 0,
        totalCourses: 0,
        totalEnrollments: 0,
        recentActivity: [
          { action: 'No data available', count: 0, date: new Date().toISOString().split('T')[0] }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const generateReport = () => {
    // Mock report generation
    const reportData = {
      overview: stats,
      timestamp: new Date().toISOString(),
      reportType
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
        <Typography>Loading analytics...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Reports & Analytics
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              label="Report Type"
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="overview">Overview</MenuItem>
              <MenuItem value="users">Users</MenuItem>
              <MenuItem value="courses">Courses</MenuItem>
              <MenuItem value="enrollments">Enrollments</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={generateReport}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<People sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Students"
            value={stats.totalStudents}
            icon={<School sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Faculty"
            value={stats.totalFaculty}
            icon={<Analytics sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Courses"
            value={stats.totalCourses}
            icon={<Assignment sx={{ fontSize: 40 }} />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Detailed Reports */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Overview
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Total Enrollments</TableCell>
                    <TableCell align="right">{stats.totalEnrollments}</TableCell>
                    <TableCell align="right">
                      <Chip label="Active" color="success" size="small" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Student-Faculty Ratio</TableCell>
                    <TableCell align="right">
                      {stats.totalFaculty > 0 ? Math.round(stats.totalStudents / stats.totalFaculty) : 0}:1
                    </TableCell>
                    <TableCell align="right">
                      <Chip label="Optimal" color="success" size="small" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Course Utilization</TableCell>
                    <TableCell align="right">
                      {stats.totalCourses > 0 ? Math.round((stats.totalEnrollments / stats.totalCourses) * 100) / 100 : 0}
                    </TableCell>
                    <TableCell align="right">
                      <Chip label="Good" color="primary" size="small" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {stats.recentActivity.map((activity, index) => (
              <Box key={index} mb={2}>
                <Typography variant="body2" color="textSecondary">
                  {activity.date}
                </Typography>
                <Typography variant="body1">
                  {activity.action}
                </Typography>
                <Typography variant="h6" color="primary">
                  {activity.count}
                </Typography>
                {index < stats.recentActivity.length - 1 && <Box mt={1} mb={1}><hr /></Box>}
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ReportsAnalytics;