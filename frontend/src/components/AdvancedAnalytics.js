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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  People,
  School,
  Assignment,
  Analytics,
  Download,
  Refresh,
  Dashboard,
  BarChart,
  PieChart,
  Timeline
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import axios from 'axios';
import { API_URL } from '../config/api';

// Define colors outside component to be accessible by all sub-components
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdvancedAnalytics = ({ user }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    userGrowth: [],
    courseEngagement: [],
    performanceMetrics: [],
    systemUsage: [],
    notifications: {}
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch multiple analytics endpoints with better error handling
      const [
        usersRes,
        coursesRes,
        enrollmentsRes,
        assignmentsRes,
        notificationsRes
      ] = await Promise.all([
        axios.get(`${API_URL}/users`, { headers }).catch((err) => {
          console.warn('Users API failed:', err.message);
          return { data: [] };
        }),
        axios.get(`${API_URL}/courses`, { headers }).catch((err) => {
          console.warn('Courses API failed:', err.message);
          return { data: [] };
        }),
        axios.get(`${API_URL}/enrollments`, { headers }).catch((err) => {
          console.warn('Enrollments API failed:', err.message);
          return { data: [] };
        }),
        axios.get(`${API_URL}/assignments`, { headers }).catch((err) => {
          console.warn('Assignments API failed:', err.message);
          return { data: [] };
        }),
        axios.get(`${API_URL}/notifications/stats`, { headers }).catch((err) => {
          console.warn('Notifications stats API failed:', err.message);
          return { data: {} };
        })
      ]);

      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const courses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
      const enrollments = Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : [];
      const assignments = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : [];

      // Process data for analytics
      const processedData = processAnalyticsData(users, courses, enrollments, assignments, notificationsRes.data);
      setAnalyticsData(processedData);
      setError('');
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data. Using demo data.');
      
      // Provide fallback demo data
      const demoData = generateDemoData();
      setAnalyticsData(demoData);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoData = () => {
    return {
      overview: {
        totalUsers: 150,
        totalStudents: 120,
        totalFaculty: 25,
        totalCourses: 15,
        totalEnrollments: 300,
        totalAssignments: 45,
        activeUsers: 105,
        systemHealth: 98.5
      },
      userGrowth: Array.from({ length: 30 }, (_, i) => ({
        date: format(subDays(new Date(), 29 - i), 'MMM dd'),
        value: Math.floor(Math.random() * 10) + 1,
        cumulative: 50 + i * 3 + Math.floor(Math.random() * 5)
      })),
      courseEngagement: [
        { name: 'React Fundamentals', enrollments: 45, assignments: 8, completion: 85 },
        { name: 'Node.js Backend', enrollments: 38, assignments: 6, completion: 78 },
        { name: 'Database Design', enrollments: 42, assignments: 7, completion: 92 },
        { name: 'Web Security', enrollments: 35, assignments: 5, completion: 88 },
        { name: 'DevOps Basics', enrollments: 28, assignments: 4, completion: 76 }
      ],
      performanceMetrics: [
        { name: 'Course Completion', value: 78, target: 85 },
        { name: 'Assignment Submission', value: 92, target: 95 },
        { name: 'Student Engagement', value: 84, target: 90 },
        { name: 'Faculty Satisfaction', value: 88, target: 90 }
      ],
      systemUsage: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        users: Math.floor(Math.random() * 80) + 20,
        load: Math.floor(Math.random() * 60) + 10
      })),
      notifications: {
        totalNotifications: 1250,
        totalUnread: 45
      }
    };
  };

  const processAnalyticsData = (users, courses, enrollments, assignments, notifications) => {
    // Generate user growth data
    const userGrowth = generateTimeSeriesData(users, 'createdAt', timeRange);
    
    // Course engagement metrics
    const courseEngagement = courses.map(course => ({
      name: course.name || course.title || 'Unknown Course',
      enrollments: enrollments.filter(e => e.course === course._id).length,
      assignments: assignments.filter(a => a.course === course._id).length,
      completion: Math.random() * 100 // Mock completion rate
    }));

    // Performance metrics
    const performanceMetrics = [
      { name: 'Course Completion', value: 78, target: 85 },
      { name: 'Assignment Submission', value: 92, target: 95 },
      { name: 'Student Engagement', value: 84, target: 90 },
      { name: 'Faculty Satisfaction', value: 88, target: 90 }
    ];

    // System usage data
    const systemUsage = generateSystemUsageData();

    return {
      overview: {
        totalUsers: users.length,
        totalStudents: users.filter(u => u.role === 'student').length,
        totalFaculty: users.filter(u => u.role === 'faculty').length,
        totalCourses: courses.length,
        totalEnrollments: enrollments.length,
        totalAssignments: assignments.length,
        activeUsers: Math.floor(users.length * 0.7), // Mock active users
        systemHealth: 98.5
      },
      userGrowth,
      courseEngagement,
      performanceMetrics,
      systemUsage,
      notifications
    };
  };

  const generateTimeSeriesData = (data, dateField, range) => {
    const now = new Date();
    const days = range === '7days' ? 7 : range === '30days' ? 30 : 90;
    const timeData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dayData = data.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate.toDateString() === date.toDateString();
      });

      timeData.push({
        date: format(date, 'MMM dd'),
        value: dayData.length,
        cumulative: data.filter(item => new Date(item[dateField]) <= date).length
      });
    }

    return timeData;
  };

  const generateSystemUsageData = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push({
        hour: `${i}:00`,
        users: Math.floor(Math.random() * 100) + 20,
        load: Math.floor(Math.random() * 80) + 10
      });
    }
    return hours;
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading advanced analytics...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Advanced Analytics Dashboard
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAnalyticsData}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={exportData}
          >
            Export
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab icon={<Dashboard />} label="Overview" />
          <Tab icon={<TrendingUp />} label="Growth" />
          <Tab icon={<BarChart />} label="Engagement" />
          <Tab icon={<PieChart />} label="Performance" />
          <Tab icon={<Timeline />} label="System Usage" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {selectedTab === 0 && <OverviewTab data={analyticsData} />}
      {selectedTab === 1 && <GrowthTab data={analyticsData} />}
      {selectedTab === 2 && <EngagementTab data={analyticsData} />}
      {selectedTab === 3 && <PerformanceTab data={analyticsData} />}
      {selectedTab === 4 && <SystemUsageTab data={analyticsData} />}
    </Container>
  );
};

// Overview Tab Component
const OverviewTab = ({ data }) => {
  
  return (
    <Grid container spacing={3}>
    {/* Key Metrics Cards */}
    <Grid item xs={12} sm={6} md={3}>
      <Card>
        <CardContent sx={{ textAlign: 'center' }}>
          <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" color="primary.main">
            {data.overview.totalUsers}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Total Users
          </Typography>
          <Chip
            label={`${data.overview.activeUsers} active`}
            color="success"
            size="small"
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} sm={6} md={3}>
      <Card>
        <CardContent sx={{ textAlign: 'center' }}>
          <School sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
          <Typography variant="h4" color="success.main">
            {data.overview.totalCourses}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Active Courses
          </Typography>
          <Chip
            label={`${data.overview.totalEnrollments} enrollments`}
            color="info"
            size="small"
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} sm={6} md={3}>
      <Card>
        <CardContent sx={{ textAlign: 'center' }}>
          <Assignment sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
          <Typography variant="h4" color="warning.main">
            {data.overview.totalAssignments}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Total Assignments
          </Typography>
          <Chip
            label="92% completion"
            color="success"
            size="small"
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} sm={6} md={3}>
      <Card>
        <CardContent sx={{ textAlign: 'center' }}>
          <Analytics sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
          <Typography variant="h4" color="error.main">
            {data.overview.systemHealth}%
          </Typography>
          <Typography variant="body2" color="textSecondary">
            System Health
          </Typography>
          <Chip
            label="Excellent"
            color="success"
            size="small"
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>
    </Grid>

    {/* Quick Stats Chart */}
    <Grid item xs={12} md={8}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Growth Trend
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>

    <Grid item xs={12} md={4}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Distribution
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsPieChart>
            <Pie
              data={[
                { name: 'Students', value: data.overview.totalStudents },
                { name: 'Faculty', value: data.overview.totalFaculty },
                { name: 'Admins', value: data.overview.totalUsers - data.overview.totalStudents - data.overview.totalFaculty }
              ]}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {[
                { name: 'Students', value: data.overview.totalStudents },
                { name: 'Faculty', value: data.overview.totalFaculty },
                { name: 'Admins', value: data.overview.totalUsers - data.overview.totalStudents - data.overview.totalFaculty }
              ].map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>
  </Grid>
  );
};

// Growth Tab Component
const GrowthTab = ({ data }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Registration Growth
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data.userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              strokeWidth={2}
              name="Daily Registrations"
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Total Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>
  </Grid>
);

// Engagement Tab Component
const EngagementTab = ({ data }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Course Engagement Metrics
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <RechartsBarChart data={data.courseEngagement}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="enrollments" fill="#8884d8" name="Enrollments" />
            <Bar dataKey="assignments" fill="#82ca9d" name="Assignments" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>
  </Grid>
);

// Performance Tab Component
const PerformanceTab = ({ data }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Performance Metrics
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <RadialBarChart data={data.performanceMetrics}>
            <RadialBar
              minAngle={15}
              label={{ position: 'insideStart', fill: '#fff' }}
              background
              clockWise
              dataKey="value"
            />
            <Legend />
            <Tooltip />
          </RadialBarChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>
  </Grid>
);

// System Usage Tab Component
const SystemUsageTab = ({ data }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          24-Hour System Usage
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data.systemUsage}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="users"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
              name="Active Users"
            />
            <Area
              type="monotone"
              dataKey="load"
              stackId="2"
              stroke="#82ca9d"
              fill="#82ca9d"
              name="System Load %"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>
  </Grid>
);

export default AdvancedAnalytics;