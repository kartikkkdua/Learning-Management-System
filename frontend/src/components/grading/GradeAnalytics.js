import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

const GradeAnalytics = ({ courseId }) => {
  const [analytics, setAnalytics] = useState({
    gradeDistribution: {},
    averageGrades: [],
    performanceMetrics: {
      classAverage: 0,
      highestGrade: 0,
      lowestGrade: 0,
      standardDeviation: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    if (courseId) {
      fetchAnalytics();
    }
  }, [courseId, selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/grading/analytics/course/${courseId}?period=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data || {
          gradeDistribution: {},
          averageGrades: [],
          performanceMetrics: {
            classAverage: 0,
            highestGrade: 0,
            lowestGrade: 0,
            standardDeviation: 0
          }
        });
      } else {
        setAnalytics({
          gradeDistribution: {},
          averageGrades: [],
          performanceMetrics: {
            classAverage: 0,
            highestGrade: 0,
            lowestGrade: 0,
            standardDeviation: 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({
        gradeDistribution: {},
        averageGrades: [],
        performanceMetrics: {
          classAverage: 0,
          highestGrade: 0,
          lowestGrade: 0,
          standardDeviation: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getGradeDistributionData = () => {
    const distribution = analytics.gradeDistribution || {};
    return [
      { grade: 'A', count: distribution.A || 0, color: '#4caf50' },
      { grade: 'B', count: distribution.B || 0, color: '#2196f3' },
      { grade: 'C', count: distribution.C || 0, color: '#ff9800' },
      { grade: 'D', count: distribution.D || 0, color: '#f44336' },
      { grade: 'F', count: distribution.F || 0, color: '#9c27b0' }
    ];
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BarChartIcon />
          Grade Analytics
        </Typography>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={selectedPeriod}
            label="Time Period"
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="semester">This Semester</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Performance Metrics */}
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {analytics.performanceMetrics.classAverage.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Class Average
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AssessmentIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {analytics.performanceMetrics.highestGrade.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Highest Grade
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AssessmentIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                <Typography variant="h4" color="error.main">
                  {analytics.performanceMetrics.lowestGrade.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lowest Grade
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <BarChartIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" color="info.main">
                  {analytics.performanceMetrics.standardDeviation.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Std Deviation
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Grade Distribution */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Grade Distribution
              </Typography>
              <Box sx={{ mt: 2 }}>
                {getGradeDistributionData().map((item) => (
                  <Box key={item.grade} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Grade {item.grade}</Typography>
                      <Typography variant="body2">{item.count} students</Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        backgroundColor: 'grey.200',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${(item.count / Math.max(...getGradeDistributionData().map(d => d.count), 1)) * 100}%`,
                          height: '100%',
                          backgroundColor: item.color,
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Recent Trends */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Performance Trends
              </Typography>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Trend analysis will be displayed here
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Chart visualization coming soon
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default GradeAnalytics;