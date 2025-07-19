import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Card,
    CardContent,
    LinearProgress,
    Tabs,
    Tab
} from '@mui/material';
import {
    Grade,
    Assignment,
    TrendingUp,
    Assessment,
    School
} from '@mui/icons-material';
import axios from 'axios';

const GradingSystem = () => {
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });
    const [tabValue, setTabValue] = useState(0);
    const [courseGrades, setCourseGrades] = useState([]);

    useEffect(() => {
        fetchAssignments();
        fetchCourses();
        fetchStudents();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            calculateCourseGrades();
        }
    }, [selectedCourse, assignments]);

    const fetchAssignments = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/assignments');
            setAssignments(response.data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/courses');
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/students');
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const calculateCourseGrades = () => {
        if (!selectedCourse) return;

        const courseAssignments = assignments.filter(a => a.course && a.course._id === selectedCourse);
        const course = courses.find(c => c._id === selectedCourse);
        const enrolledStudents = course?.enrolledStudents || [];

        const grades = enrolledStudents.map(student => {
            let totalPoints = 0;
            let earnedPoints = 0;
            let submissionCount = 0;

            courseAssignments.forEach(assignment => {
                totalPoints += assignment.maxPoints;
                const submission = assignment.submissions?.find(s => s.student._id === student._id);
                if (submission && submission.grade !== undefined) {
                    earnedPoints += submission.grade;
                    submissionCount++;
                }
            });

            const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
            const letterGrade = getLetterGrade(percentage);

            return {
                student,
                totalPoints,
                earnedPoints,
                percentage: percentage.toFixed(1),
                letterGrade,
                submissionCount,
                totalAssignments: courseAssignments.length
            };
        });

        setCourseGrades(grades);
    };

    const getLetterGrade = (percentage) => {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    };

    const getGradeColor = (letterGrade) => {
        switch (letterGrade) {
            case 'A': return 'success';
            case 'B': return 'info';
            case 'C': return 'warning';
            case 'D': return 'secondary';
            case 'F': return 'error';
            default: return 'default';
        }
    };

    const handleGradeSubmission = (assignment, submission) => {
        setSelectedAssignment(assignment);
        setSelectedSubmission(submission);
        setGradeData({
            grade: submission.grade || '',
            feedback: submission.feedback || ''
        });
        setGradeDialogOpen(true);
    };

    const submitGrade = async () => {
        try {
            await axios.post(`http://localhost:3001/api/assignments/${selectedAssignment._id}/grade`, {
                studentId: selectedSubmission.student._id,
                grade: parseFloat(gradeData.grade),
                feedback: gradeData.feedback
            });

            fetchAssignments();
            setGradeDialogOpen(false);
            setGradeData({ grade: '', feedback: '' });
        } catch (error) {
            console.error('Error submitting grade:', error);
        }
    };

    const filteredAssignments = selectedCourse
        ? assignments.filter(a => a.course && a.course._id === selectedCourse)
        : assignments;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Grading System
            </Typography>

            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Select Course</InputLabel>
                        <Select
                            value={selectedCourse}
                            label="Select Course"
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <MenuItem value="">All Courses</MenuItem>
                            {courses.map((course) => (
                                <MenuItem key={course._id} value={course._id}>
                                    {course.courseCode} - {course.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                    <Tab label="Assignment Grading" />
                    <Tab label="Course Grades" />
                    <Tab label="Grade Analytics" />
                </Tabs>
            </Box>

            {/* Assignment Grading Tab */}
            {tabValue === 0 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Assignment</TableCell>
                                <TableCell>Course</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Submissions</TableCell>
                                <TableCell>Graded</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAssignments.map((assignment) => {
                                const totalSubmissions = assignment.submissions?.length || 0;
                                const gradedSubmissions = assignment.submissions?.filter(s => s.grade !== undefined).length || 0;

                                return (
                                    <TableRow key={assignment._id}>
                                        <TableCell>{assignment.title}</TableCell>
                                        <TableCell>
                                            {assignment.course ? (
                                                <Chip label={assignment.course.courseCode} color="primary" size="small" />
                                            ) : (
                                                <Chip label="No Course Assigned" color="default" size="small" />
                                            )}
                                        </TableCell>
                                        <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{totalSubmissions}</TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={totalSubmissions > 0 ? (gradedSubmissions / totalSubmissions) * 100 : 0}
                                                    sx={{ width: 60 }}
                                                />
                                                <Typography variant="caption">
                                                    {gradedSubmissions}/{totalSubmissions}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => {
                                                    // Show submissions for grading
                                                    console.log('Grade submissions for:', assignment.title);
                                                }}
                                            >
                                                Grade
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Course Grades Tab */}
            {tabValue === 1 && selectedCourse && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Student</TableCell>
                                <TableCell>Student ID</TableCell>
                                <TableCell>Points Earned</TableCell>
                                <TableCell>Total Points</TableCell>
                                <TableCell>Percentage</TableCell>
                                <TableCell>Letter Grade</TableCell>
                                <TableCell>Submissions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {courseGrades.map((grade) => (
                                <TableRow key={grade.student._id}>
                                    <TableCell>
                                        {grade.student.firstName} {grade.student.lastName}
                                    </TableCell>
                                    <TableCell>{grade.student.studentId}</TableCell>
                                    <TableCell>{grade.earnedPoints}</TableCell>
                                    <TableCell>{grade.totalPoints}</TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={parseFloat(grade.percentage)}
                                                sx={{ width: 60 }}
                                                color={
                                                    parseFloat(grade.percentage) >= 70 ? 'success' :
                                                        parseFloat(grade.percentage) >= 60 ? 'warning' : 'error'
                                                }
                                            />
                                            {grade.percentage}%
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={grade.letterGrade}
                                            color={getGradeColor(grade.letterGrade)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {grade.submissionCount}/{grade.totalAssignments}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Grade Analytics Tab */}
            {tabValue === 2 && selectedCourse && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Class Average
                                </Typography>
                                <Typography variant="h3" color="primary">
                                    {courseGrades.length > 0
                                        ? (courseGrades.reduce((sum, g) => sum + parseFloat(g.percentage), 0) / courseGrades.length).toFixed(1)
                                        : 0
                                    }%
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Passing Rate
                                </Typography>
                                <Typography variant="h3" color="success.main">
                                    {courseGrades.length > 0
                                        ? ((courseGrades.filter(g => parseFloat(g.percentage) >= 60).length / courseGrades.length) * 100).toFixed(1)
                                        : 0
                                    }%
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Grade Distribution
                                </Typography>
                                <Box>
                                    {['A', 'B', 'C', 'D', 'F'].map(grade => {
                                        const count = courseGrades.filter(g => g.letterGrade === grade).length;
                                        return (
                                            <Box key={grade} display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="body2">{grade}:</Typography>
                                                <Chip label={count} color={getGradeColor(grade)} size="small" />
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Grade Dialog */}
            <Dialog open={gradeDialogOpen} onClose={() => setGradeDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Grade Submission</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Grade"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={gradeData.grade}
                        onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                        inputProps={{
                            min: 0,
                            max: selectedAssignment?.maxPoints || 100,
                            step: 0.1
                        }}
                        helperText={`Max Points: ${selectedAssignment?.maxPoints || 100}`}
                    />
                    <TextField
                        margin="dense"
                        label="Feedback"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={gradeData.feedback}
                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setGradeDialogOpen(false)}>Cancel</Button>
                    <Button onClick={submitGrade} variant="contained">
                        Submit Grade
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default GradingSystem;