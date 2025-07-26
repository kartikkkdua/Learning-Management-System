import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  School,
  Assignment,
  Grade,
  EventNote,
  CheckCircle,
  MenuBook
} from '@mui/icons-material';
import axios from 'axios';

const StudentProgress = ({ user }) => {
  const [progressData, setProgressData] = useState({
    enrolledCourses: [],
    totalCredits: 0,
    completedCredits: 0,
    gpa: 0,
    semesterGPA: 0,
    attendanceRate: 0,
    assignmentCompletion: 0,
    academicStanding: 'Good Standing'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, [user]);

  const fetchProgressData = async () => {
    try {
      const studentId = user.id || user._id;
      
      // Fetch enrolled courses
      const enrollmentRes = await axios.get(`http://localhost:3001/api/enrollments/student/${studentId}`);
      const enrolledCourses = enrollmentRes.data.enrolledCourses || [];
      const totalCredits = enrollmentRes.data.totalCredits || 0;

      // Fetch grades
      const gradesRes = await axios.get(`http://localhost:3001/api/students/${studentId}/grades`);
      const grades = gradesRes.data || [];

      // Fetch assignments
      const assignmentsRes = await axios.get(`http://localhost:3001/api/students/${studentId}/assignments`);
      const assignments = assignmentsRes.data || [];

      // Fetch attendance
      const attendanceRes = await axios.get(`http://localhost:3001/api/students/${studentId}/attendance`);
      const attendanceData = attendanceRes.data || [];

      // Calculate GPA
      let totalGradePoints = 0;
      let totalCreditHours = 0;
      let completedCredits = 0;

      grades.forEach(courseGrade => {
        if (courseGrade.percentage >= 60) { // Passing grade
          const gradePoint = getGradePoint(courseGrade.percentage);
          const credits = courseGrade.course?.credits || 3;
          totalGradePoints += gradePoint * credits;
          totalCreditHours += credits;
          completedCredits += credits;
        }
      });

      const gpa = totalCreditHours > 0 ? totalGradePoints / totalCreditHours : 0;

      // Calculate current semester GPA (assuming current courses)
      let semesterGradePoints = 0;
      let semesterCreditHours = 0;
      
      enrolledCourses.forEach(course => {
        const courseGrade = grades.find(g => g.course?._id === course._id);
        if (courseGrade && courseGrade.percentage > 0) {
          const gradePoint = getGradePoint(courseGrade.percentage);
          semesterGradePoints += gradePoint * course.credits;
          semesterCreditHours += course.credits;
        }
      });

      const semesterGPA = semesterCreditHours > 0 ? semesterGradePoints / semesterCreditHours : 0;

      // Calculate attendance rate
      const totalClasses = attendanceData.reduce((sum, course) => sum + course.totalClasses, 0);
      const attendedClasses = attendanceData.reduce((sum, course) => 
        sum + course.present + course.late + course.excused, 0);
      const attendanceRate = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

      // Calculate assignment completion rate
      const totalAssignments = assignments.length;
      const completedAssignments = assignments.filter(assignment => 
        assignment.submissions?.some(sub => sub.student === studentId)
      ).length;
      const assignmentCompletion = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

      // Determine academic standing
      let academicStanding = 'Good Standing';
      if (gpa < 2.0) {
        academicStanding = 'Academic Probation';
      } else if (gpa >= 3.5) {
        academicStanding = 'Dean\'s List';
      } else if (gpa >= 3.0) {
        academicStanding = 'Good Standing';
      } else {
        academicStanding = 'Satisfactory';
      }

      setProgressData({
        enrolledCourses,
        totalCredits,
        completedCredits,
        gpa: gpa.toFixed(2),
        semesterGPA: semesterGPA.toFixed(2),
        attendanceRate: attendanceRate.toFixed(1),
        assignmentCompletion: assignmentCompletion.toFixed(1),
        academicStanding
      });

    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
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

  const getGPAColor = (gpa) => {
    const numGPA = parseFloat(gpa);
    if (numGPA >= 3.5) return 'success';
    if (numGPA >= 3.0) return 'info';
    if (numGPA >= 2.0) return 'warning';
    return 'error';
  };

  const getStandingColor = (standing) => {
    switch (standing) {
      case 'Dean\'s List': return 'success';
      case 'Good Standing': return 'info';
      case 'Satisfactory': return 'warning';
      case 'Academic Probation': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading academic progress...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Academic Progress
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Track your academic journey and monitor your progress toward graduation.
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Grade sx={{ fontSize: 40, color: getGPAColor(progressData.gpa) + '.main', mb: 1 }} />
              <Typography variant="h4" color={getGPAColor(progressData.gpa) + '.main'}>
                {progressData.gpa}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Cumulative GPA
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <School sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {progressData.totalCredits}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Credits Enrolled
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EventNote sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {progressData.attendanceRate}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Attendance Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {progressData.assignmentCompletion}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Assignments Complete
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Academic Standing & Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Academic Standing
            </Typography>
            
            <Box display="flex" alignItems="center" mb={3}>
              <Chip 
                label={progressData.academicStanding}
                color={getStandingColor(progressData.academicStanding)}
                sx={{ mr: 2 }}
              />
              <Typography variant="body2" color="textSecondary">
                Current Status
              </Typography>
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Degree Progress
            </Typography>
            <Box mb={2}>
              <LinearProgress 
                variant="determinate" 
                value={(progressData.completedCredits / 120) * 100} 
                sx={{ height: 8, borderRadius: 4 }}
                color="primary"
              />
              <Typography variant="caption" color="textSecondary">
                {progressData.completedCredits} of 120 credits completed ({((progressData.completedCredits / 120) * 100).toFixed(1)}%)
              </Typography>
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Current Semester GPA
            </Typography>
            <Box mb={2}>
              <LinearProgress 
                variant="determinate" 
                value={(parseFloat(progressData.semesterGPA) / 4.0) * 100} 
                sx={{ height: 8, borderRadius: 4 }}
                color={getGPAColor(progressData.semesterGPA)}
              />
              <Typography variant="caption" color="textSecondary">
                {progressData.semesterGPA} / 4.0
              </Typography>
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Attendance Rate
            </Typography>
            <Box>
              <LinearProgress 
                variant="determinate" 
                value={parseFloat(progressData.attendanceRate)} 
                sx={{ height: 8, borderRadius: 4 }}
                color="info"
              />
              <Typography variant="caption" color="textSecondary">
                {progressData.attendanceRate}% attendance
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Current Courses */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Current Courses ({progressData.enrolledCourses.length})
            </Typography>
            
            <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
              {progressData.enrolledCourses.map((course, index) => (
                <React.Fragment key={course._id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <MenuBook color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={course.title}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {course.courseCode} • {course.credits} Credits
                          </Typography>
                          <Chip 
                            label={`${course.semester} ${course.year}`} 
                            size="small" 
                            color="secondary" 
                            variant="outlined"
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < progressData.enrolledCourses.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {progressData.enrolledCourses.length === 0 && (
              <Box textAlign="center" py={4}>
                <MenuBook sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="textSecondary">
                  No courses enrolled this semester
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Academic Milestones */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Academic Milestones
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <CheckCircle 
                    sx={{ 
                      fontSize: 32, 
                      color: progressData.completedCredits >= 30 ? 'success.main' : 'text.secondary',
                      mb: 1 
                    }} 
                  />
                  <Typography variant="body2" fontWeight="bold">
                    Freshman Year
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    30 Credits
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <CheckCircle 
                    sx={{ 
                      fontSize: 32, 
                      color: progressData.completedCredits >= 60 ? 'success.main' : 'text.secondary',
                      mb: 1 
                    }} 
                  />
                  <Typography variant="body2" fontWeight="bold">
                    Sophomore Year
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    60 Credits
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <CheckCircle 
                    sx={{ 
                      fontSize: 32, 
                      color: progressData.completedCredits >= 90 ? 'success.main' : 'text.secondary',
                      mb: 1 
                    }} 
                  />
                  <Typography variant="body2" fontWeight="bold">
                    Junior Year
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    90 Credits
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <CheckCircle 
                    sx={{ 
                      fontSize: 32, 
                      color: progressData.completedCredits >= 120 ? 'success.main' : 'text.secondary',
                      mb: 1 
                    }} 
                  />
                  <Typography variant="body2" fontWeight="bold">
                    Graduation
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    120 Credits
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentProgress;