import React, { useState, useEffect } from 'react';
import RubricManager from './RubricManager';
import GradeCategoryManager from './GradeCategoryManager';
import GradeAssignments from './GradeAssignments';
import GradeAnalytics from './GradeAnalytics';
import TranscriptGenerator from './TranscriptGenerator';

// Material UI imports
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Tabs, 
  Tab, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { 
  Assignment as AssignmentIcon, 
  List as ListIcon, 
  Category as CategoryIcon, 
  BarChart as BarChartIcon, 
  School as SchoolIcon 
} from '@mui/icons-material';


const GradingDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('grade-assignments');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalGrades: 0,
    averageGrade: 0,
    pendingGrades: 0,
    publishedGrades: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStats();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      console.log('Fetching courses from:', `${apiUrl}/api/courses`);
      console.log('User:', user);
      
      // Try to get courses for the current instructor first
      let url = `${apiUrl}/api/courses`;
      if (user && user._id) {
        // If we have user info, we could filter by instructor, but for now let's get all courses
        // and filter on the frontend if needed
      }
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Courses response status:', response.status);
      console.log('Token being used:', token ? 'Token exists' : 'No token found');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Courses data received:', data);
        
        // For now, show all courses to debug the issue
        // TODO: Filter courses where the current user is the instructor
        let filteredCourses = data;
        console.log('All courses:', data);
        console.log('User object:', user);
        
        // Temporarily disable filtering to see all courses
        /*
        if (user && user._id) {
          filteredCourses = data.filter(course => 
            course.instructor && course.instructor._id === user._id
          );
          console.log('Filtered courses for instructor:', filteredCourses);
        }
        */
        
        setCourses(filteredCourses);
        if (filteredCourses.length > 0) {
          setSelectedCourse(filteredCourses[0]._id);
        }
      } else {
        console.error('Failed to fetch courses:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/grading/stats/course/${selectedCourse}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.statistics || {
          totalGrades: 0,
          averageGrade: 0,
          pendingGrades: 0,
          publishedGrades: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };



  const renderTabContent = () => {
    switch (activeTab) {
      case 'grade-assignments':
        return <GradeAssignments courseId={selectedCourse} user={user} />;
      case 'rubrics':
        return <RubricManager courseId={selectedCourse} user={user} />;
      case 'categories':
        return <GradeCategoryManager courseId={selectedCourse} user={user} />;
      case 'analytics':
        return <GradeAnalytics courseId={selectedCourse} user={user} />;
      case 'transcripts':
        return <TranscriptGenerator courseId={selectedCourse} user={user} />;
      default:
        return <GradeAssignments courseId={selectedCourse} user={user} />;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Advanced Grading System
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage rubrics, grade categories, and student assessments
            </Typography>
          </Box>
          
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel id="course-select-label">Select Course</InputLabel>
            <Select
              labelId="course-select-label"
              id="course-select"
              value={selectedCourse}
              label="Select Course"
              onChange={handleCourseChange}
              disabled={loading}
            >
              {courses.length === 0 ? (
                <MenuItem disabled>
                  <em>No courses available</em>
                </MenuItem>
              ) : (
                courses.map(course => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.title} ({course.courseCode})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : selectedCourse ? (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Total Grades
                    </Typography>
                    <Typography variant="h3">
                      {stats.totalGrades || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Average Grade
                    </Typography>
                    <Typography variant="h3">
                      {stats.averageGrade?.toFixed(1) || '0.0'}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Pending Grades
                    </Typography>
                    <Typography variant="h3">
                      {stats.pendingGrades || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Published Grades
                    </Typography>
                    <Typography variant="h3">
                      {stats.publishedGrades || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper sx={{ mb: 4 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="grading system tabs"
              >
                <Tab 
                  icon={<AssignmentIcon />} 
                  label="Grade Assignments" 
                  value="grade-assignments" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<ListIcon />} 
                  label="Rubric Manager" 
                  value="rubrics" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<CategoryIcon />} 
                  label="Grade Categories" 
                  value="categories" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<BarChartIcon />} 
                  label="Grade Analytics" 
                  value="analytics" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<SchoolIcon />} 
                  label="Transcripts" 
                  value="transcripts" 
                  iconPosition="start"
                />
              </Tabs>
            </Paper>

            <Paper sx={{ p: 3 }}>
              {renderTabContent()}
            </Paper>
          </>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Please select a course to continue
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Choose a course from the dropdown above to access grading features
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default GradingDashboard;