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
    Alert
} from '@mui/material';
import {
    TrendingUp,
    School,
    Grade,
    Assessment
} from '@mui/icons-material';
import axios from 'axios';

const GPACalculator = ({ user }) => {
    const [gpaData, setGpaData] = useState({
        currentGPA: 0,
        semesterGPA: 0,
        totalCredits: 0,
        qualityPoints: 0,
        academicStanding: 'Good Standing',
        semesterCourses: [],
        transcriptData: []
    });

    useEffect(() => {
        fetchGPAData();
    }, [user]);

    const fetchGPAData = async () => {
        try {
            const studentId = user.id || user._id;

            // Fetch grades and calculate GPA
            const gradesResponse = await axios.get(`http://localhost:3001/api/students/${studentId}/grades`);
            const grades = gradesResponse.data;

            let totalQualityPoints = 0;
            let totalCredits = 0;
            let currentSemesterQP = 0;
            let currentSemesterCredits = 0;

            const transcriptData = [];

            grades.forEach(courseGrade => {
                if (courseGrade.percentage > 0) {
                    const gradePoint = getGradePoint(courseGrade.percentage);
                    const credits = courseGrade.course.credits;
                    const qualityPoints = gradePoint * credits;

                    totalQualityPoints += qualityPoints;
                    totalCredits += credits;

                    // Check if it's current semester
                    const currentYear = new Date().getFullYear();
                    const currentMonth = new Date().getMonth();
                    const currentSemester = currentMonth >= 8 ? 'Fall' : currentMonth >= 1 ? 'Spring' : 'Summer';

                    if (courseGrade.course.year === currentYear && courseGrade.course.semester === currentSemester) {
                        currentSemesterQP += qualityPoints;
                        currentSemesterCredits += credits;
                    }

                    transcriptData.push({
                        course: courseGrade.course,
                        percentage: courseGrade.percentage,
                        letterGrade: getLetterGrade(courseGrade.percentage),
                        gradePoint: gradePoint,
                        credits: credits,
                        qualityPoints: qualityPoints
                    });
                }
            });

            const currentGPA = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
            const semesterGPA = currentSemesterCredits > 0 ? currentSemesterQP / currentSemesterCredits : 0;

            // Determine academic standing
            let academicStanding = 'Good Standing';
            if (currentGPA < 2.0) {
                academicStanding = 'Academic Probation';
            } else if (currentGPA >= 3.75) {
                academicStanding = 'Dean\'s List';
            } else if (currentGPA >= 3.5) {
                academicStanding = 'Honor Roll';
            }

            setGpaData({
                currentGPA: currentGPA.toFixed(2),
                semesterGPA: semesterGPA.toFixed(2),
                totalCredits,
                qualityPoints: totalQualityPoints.toFixed(1),
                academicStanding,
                transcriptData
            });

        } catch (error) {
            console.error('Error fetching GPA data:', error);
        }
    };

    const getGradePoint = (percentage) => {
        if (percentage >= 97) return 4.0;  // A+
        if (percentage >= 93) return 4.0;  // A
        if (percentage >= 90) return 3.7;  // A-
        if (percentage >= 87) return 3.3;  // B+
        if (percentage >= 83) return 3.0;  // B
        if (percentage >= 80) return 2.7;  // B-
        if (percentage >= 77) return 2.3;  // C+
        if (percentage >= 73) return 2.0;  // C
        if (percentage >= 70) return 1.7;  // C-
        if (percentage >= 67) return 1.3;  // D+
        if (percentage >= 65) return 1.0;  // D
        return 0.0;  // F
    };

    const getLetterGrade = (percentage) => {
        if (percentage >= 97) return 'A+';
        if (percentage >= 93) return 'A';
        if (percentage >= 90) return 'A-';
        if (percentage >= 87) return 'B+';
        if (percentage >= 83) return 'B';
        if (percentage >= 80) return 'B-';
        if (percentage >= 77) return 'C+';
        if (percentage >= 73) return 'C';
        if (percentage >= 70) return 'C-';
        if (percentage >= 67) return 'D+';
        if (percentage >= 65) return 'D';
        return 'F';
    };

    const getStandingColor = (standing) => {
        switch (standing) {
            case 'Dean\'s List': return 'success';
            case 'Honor Roll': return 'info';
            case 'Good Standing': return 'primary';
            case 'Academic Probation': return 'error';
            default: return 'default';
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Academic Performance
            </Typography>

            {/* GPA Overview Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Grade sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h4" color="primary.main">
                                {gpaData.currentGPA}
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
                            <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                            <Typography variant="h4" color="info.main">
                                {gpaData.semesterGPA}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Semester GPA
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <School sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                            <Typography variant="h4" color="success.main">
                                {gpaData.totalCredits}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Total Credits
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Assessment sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                            <Typography variant="h4" color="warning.main">
                                {gpaData.qualityPoints}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Quality Points
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Academic Standing */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Academic Standing
                        </Typography>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Chip
                                label={gpaData.academicStanding}
                                color={getStandingColor(gpaData.academicStanding)}
                                sx={{ mr: 2 }}
                            />
                        </Box>

                        {gpaData.academicStanding === 'Academic Probation' && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                Your GPA is below 2.0. Please meet with your academic advisor to discuss improvement strategies.
                            </Alert>
                        )}

                        {(gpaData.academicStanding === 'Dean\'s List' || gpaData.academicStanding === 'Honor Roll') && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                Congratulations on your excellent academic performance!
                            </Alert>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Degree Progress
                        </Typography>
                        <Box mb={2}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="body2">
                                    Credits Completed
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {gpaData.totalCredits}/120
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={(gpaData.totalCredits / 120) * 100}
                                sx={{ height: 8, borderRadius: 4 }}
                                color="primary"
                            />
                            <Typography variant="caption" color="textSecondary">
                                {((gpaData.totalCredits / 120) * 100).toFixed(1)}% Complete
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Transcript */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Academic Transcript
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Course</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell align="center">Credits</TableCell>
                                <TableCell align="center">Grade</TableCell>
                                <TableCell align="center">Points</TableCell>
                                <TableCell align="center">Quality Points</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {gpaData.transcriptData.map((record, index) => (
                                <TableRow key={index}>
                                    <TableCell>{record.course.courseCode}</TableCell>
                                    <TableCell>{record.course.title}</TableCell>
                                    <TableCell align="center">{record.credits}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={record.letterGrade}
                                            color={record.gradePoint >= 3.0 ? 'success' : record.gradePoint >= 2.0 ? 'warning' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">{record.gradePoint.toFixed(1)}</TableCell>
                                    <TableCell align="center">{record.qualityPoints.toFixed(1)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {gpaData.transcriptData.length === 0 && (
                    <Box textAlign="center" py={4}>
                        <Typography variant="body2" color="textSecondary">
                            No completed courses found
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default GPACalculator;