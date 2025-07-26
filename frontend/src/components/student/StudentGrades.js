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
  Grade,
  TrendingUp,
  Assignment,
  MenuBook
} from '@mui/icons-material';
import axios from 'axios';

const StudentGrades = ({ user }) => {
  const [grades, setGrades] = useState([]);
  const [setCourses] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [gradeStats, setGradeStats] = useState({
    currentGPA: 3.7,
    cumulativeGPA: 3.6,
    totalCredits: 45,
    completedCourses: 12
  });

  useEffect(() => {
    fetchGrades();
    fetchCourses();
  }, []);

  const fetchGrades = async () => {
    try {
      const studentId = user.id || user._id;
      const response = await axios.get(`http://localhost:3001/api/students/${studentId}/grades`);
      setGrades(response.data);
      
      // Update grade stats based on real data
      if (response.data.length > 0) {
        let totalGradePoints = 0;
        let totalCredits = 0;
        let completedCourses = 0;
        
        response.data.forEach(courseGrade => {
          if (courseGrade.percentage > 0) {
            const gradePoint = getGradePoint(courseGrade.percentage);
            totalGradePoints += gradePoint * courseGrade.course.credits;
            totalCredits += courseGrade.course.credits;
            completedCourses++;
          }
        });
        
        const currentGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
        
        setGradeStats({
          currentGPA: currentGPA.toFixed(1),
          cumulativeGPA: currentGPA.toFixed(1), // Same as current for now
          totalCredits,
          completedCourses
        });
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      setGrades([]); // Fallback to empty array
    }
  };

  const getGradePoint = (percentage) => {
    if (percentage >= 90) return 4.0;
    if (percentage >= 85) return 3.7;
    if (percentage >= 80) return 3.3;
    if (percentage >= 75) return 3.0;
    if (percentage >= 70) return 2.7;
    if (percentage >= 65) return 2.3;
    if (percentage >= 60) return 2.0;
    if (percentage >= 55) return 1.7;
    if (percentage >= 50) return 1.0;
    return 0.0;
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/courses');
      setCourses(response.data.slice(0, 4)); // Mock enrolled courses
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'success';
    if (grade >= 80) return 'info';
    if (grade >= 70) return 'warning';
    return 'error';
  };

  const getLetterGradeColor = (letterGrade) => {
    if (['A', 'A-'].includes(letterGrade)) return 'success';
    if (['B+', 'B', 'B-'].includes(letterGrade)) return 'info';
    if (['C+', 'C', 'C-'].includes(letterGrade)) return 'warning';
    return 'error';
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Grades
      </Typography>
      
      {/* Grade Statistics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Current GPA"
            value={gradeStats.currentGPA}
            icon={<Grade />}
            color="primary.main"
            subtitle="This semester"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Cumulative GPA"
            value={gradeStats.cumulativeGPA}
            icon={<TrendingUp />}
            color="success.main"
            subtitle="Overall"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Credits"
            value={gradeStats.totalCredits}
            icon={<MenuBook />}
            color="info.main"
            subtitle="Completed"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Courses"
            value={gradeStats.completedCourses}
            icon={<Assignment />}
            color="secondary.main"
            subtitle="Completed"
          />
        </Grid>
      </Grid>

      {/* Semester Filter */}
      <Box mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Semester</InputLabel>
          <Select
            value={selectedSemester}
            label="Semester"
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <MenuItem value="current">Current Semester</MenuItem>
            <MenuItem value="fall2024">Fall 2024</MenuItem>
            <MenuItem value="spring2024">Spring 2024</MenuItem>
            <MenuItem value="all">All Semesters</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Course Grades */}
      <Grid container spacing={3}>
        {grades.map((courseGrade, index) => (
          <Grid item xs={12} key={courseGrade.course._id || index}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6">
                    {courseGrade.course.title}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    {courseGrade.course.courseCode} • {courseGrade.course.credits} Credits
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box textAlign="center">
                    <Typography variant="h5" color={getLetterGradeColor(courseGrade.letterGrade)}>
                      {courseGrade.letterGrade}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Final Grade
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6">
                      {courseGrade.percentage.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Average
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {courseGrade.assignments.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Assignment</TableCell>
                        <TableCell align="center">Grade</TableCell>
                        <TableCell align="center">Max Points</TableCell>
                        <TableCell align="center">Percentage</TableCell>
                        <TableCell align="center">Type</TableCell>
                        <TableCell align="center">Progress</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {courseGrade.assignments.map((assignment, assignmentIndex) => (
                        <TableRow key={assignmentIndex}>
                          <TableCell>{assignment.title}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={assignment.earnedPoints} 
                              color={getGradeColor(assignment.percentage)} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell align="center">{assignment.maxPoints}</TableCell>
                          <TableCell align="center">
                            <Typography 
                              variant="body2" 
                              color={assignment.percentage >= 80 ? 'success.main' : assignment.percentage >= 70 ? 'warning.main' : 'error.main'}
                            >
                              {assignment.percentage.toFixed(1)}%
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={assignment.type.toUpperCase()} 
                              variant="outlined" 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ width: 120 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={assignment.percentage} 
                              color={getGradeColor(assignment.percentage)}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={3}>
                  <Typography variant="body2" color="textSecondary">
                    No graded assignments yet for this course.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {grades.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Grade sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Grades Available
          </Typography>
          <Typography color="textSecondary">
            Your grades will appear here once assignments are graded by your instructors.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default StudentGrades;