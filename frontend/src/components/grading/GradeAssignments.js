import React, { useState, useEffect } from 'react';

// Material UI imports
import {
    Box,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Checkbox,
    RadioGroup,
    Radio,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Publish as PublishIcon,
    Assignment as AssignmentIcon,
    Person as PersonIcon
} from '@mui/icons-material';

const GradeAssignments = ({ courseId, user }) => {
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [rubrics, setRubrics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showGradingModal, setShowGradingModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        if (courseId) {
            fetchAssignments();
            fetchRubrics();
        }
    }, [courseId]);

    useEffect(() => {
        if (selectedAssignment) {
            fetchStudentsAndGrades();
        }
    }, [selectedAssignment]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

            console.log('Fetching assignments for course:', courseId);
            const response = await fetch(`${apiUrl}/api/assignments/course/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('Assignments response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('Assignments data:', data);
                setAssignments(data);
                if (data.length > 0) {
                    setSelectedAssignment(data[0]);
                }
            } else {
                console.error('Failed to fetch assignments:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRubrics = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

            const response = await fetch(`${apiUrl}/api/rubrics/course/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setRubrics(data);
            }
        } catch (error) {
            console.error('Error fetching rubrics:', error);
        }
    };

    const fetchStudentsAndGrades = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

            // Fetching students and grades

            // Fetch course with enrolled students
            const courseResponse = await fetch(`${apiUrl}/api/courses/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (courseResponse.ok) {
                const courseData = await courseResponse.json();
                // Filter valid students
                const validStudents = (courseData.enrolledStudents || []).filter(student =>
                    student && student._id
                );
                setStudents(validStudents);
            } else {
                console.error('Failed to fetch course data:', courseResponse.status);
            }

            // Fetch grades for this assignment
            const gradesResponse = await fetch(`${apiUrl}/api/grading/course/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (gradesResponse.ok) {
                const gradesData = await gradesResponse.json();
                const assignmentGrades = gradesData.filter(grade =>
                    grade.assignment && grade.assignment._id === selectedAssignment._id
                );
                setGrades(assignmentGrades);
            }

            // Fetch assignment details with submissions
            const assignmentResponse = await fetch(`${apiUrl}/api/assignments/${selectedAssignment._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (assignmentResponse.ok) {
                const assignmentData = await assignmentResponse.json();
                // Assignment data fetched with submissions
                // Ensure submissions array exists and filter out invalid entries
                if (assignmentData.submissions) {
                    assignmentData.submissions = assignmentData.submissions.filter(sub =>
                        sub && sub.student
                    );
                }
                // Update the selected assignment with submission data
                setSelectedAssignment(assignmentData);
            } else {
                console.error('Failed to fetch assignment details:', assignmentResponse.status);
            }
        } catch (error) {
            console.error('Error fetching students and grades:', error);
        }
    };

    const getStudentGrade = (studentId) => {
        return grades.find(grade => grade.student._id === studentId);
    };

    const getStudentSubmission = (studentId) => {
        if (!selectedAssignment || !selectedAssignment.submissions) return null;
        return selectedAssignment.submissions.find(submission => {
            if (!submission || !submission.student) return false;
            // Handle both populated and non-populated student references
            const submissionStudentId = typeof submission.student === 'object'
                ? submission.student._id
                : submission.student;
            return submissionStudentId === studentId;
        });
    };

    const handleGradeStudent = (student) => {
        setSelectedStudent(student);
        setShowGradingModal(true);
    };

    const handlePublishGrades = async () => {
        if (!window.confirm('Are you sure you want to publish all grades for this assignment?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

            const gradeIds = grades.map(grade => grade._id);

            const response = await fetch(`${apiUrl}/api/grading/publish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ gradeIds })
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                fetchStudentsAndGrades();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error publishing grades:', error);
            alert('Error publishing grades');
        }
    };

    const getGradeStatusColor = (status) => {
        switch (status) {
            case 'published': return 'success';
            case 'draft': return 'warning';
            case 'returned': return 'info';
            default: return 'default';
        }
    };

    const getLetterGradeColor = (letterGrade) => {
        if (letterGrade.startsWith('A')) return 'success';
        if (letterGrade.startsWith('B')) return 'info';
        if (letterGrade.startsWith('C')) return 'warning';
        if (letterGrade.startsWith('D')) return 'error';
        if (letterGrade.startsWith('F')) return 'error';
        return 'default';
    };

    const calculateClassAverage = () => {
        if (grades.length === 0) return 0;
        const total = grades.reduce((sum, grade) => sum + grade.percentage, 0);
        return (total / grades.length).toFixed(1);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon />
                    Grade Assignments
                </Typography>

                <FormControl sx={{ minWidth: 300 }}>
                    <InputLabel id="assignment-select-label">Select Assignment</InputLabel>
                    <Select
                        labelId="assignment-select-label"
                        value={selectedAssignment?._id || ''}
                        label="Select Assignment"
                        onChange={(e) => {
                            const assignment = assignments.find(a => a._id === e.target.value);
                            setSelectedAssignment(assignment);
                        }}
                        disabled={loading}
                    >
                        <MenuItem value="">
                            <em>Choose an assignment...</em>
                        </MenuItem>
                        {assignments.map(assignment => (
                            <MenuItem key={assignment._id} value={assignment._id}>
                                {assignment.title} (Due: {new Date(assignment.dueDate).toLocaleDateString()})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {selectedAssignment && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            {selectedAssignment.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {selectedAssignment.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                            <Typography variant="body2">
                                <strong>Max Points:</strong> {selectedAssignment.maxPoints}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Due:</strong> {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Category:</strong> {selectedAssignment.category}
                            </Typography>
                        </Box>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h5" color="primary">
                                        {grades.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Graded
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h5" color="warning.main">
                                        {students.length - grades.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Pending
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h5" color="info.main">
                                        {calculateClassAverage()}%
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Class Average
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h5" color="success.main">
                                        {grades.filter(g => g.status === 'published').length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Published
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<PublishIcon />}
                            onClick={handlePublishGrades}
                            disabled={grades.length === 0}
                        >
                            Publish All Grades
                        </Button>
                    </Box>
                </Paper>
            )}

            {selectedAssignment && (
                <Paper>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon />
                            Student Grades
                        </Typography>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell align="center">Submission</TableCell>
                                    <TableCell align="center">Grade</TableCell>
                                    <TableCell align="center">Percentage</TableCell>
                                    <TableCell align="center">Letter Grade</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">Last Updated</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">
                                            <Typography variant="body2" color="text.secondary">
                                                No students enrolled in this course
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.map(student => {
                                        if (!student || !student._id) return null;
                                        const grade = getStudentGrade(student._id);
                                        const submission = getStudentSubmission(student._id);
                                        return (
                                            <TableRow key={student._id} hover>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {student.user?.profile?.firstName} {student.user?.profile?.lastName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            @{student.user?.username}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {student.user?.email}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {submission ? (
                                                        <Box>
                                                            <Chip
                                                                label={submission.isLate ? 'Late' : 'Submitted'}
                                                                color={submission.isLate ? 'warning' : 'success'}
                                                                size="small"
                                                            />
                                                            <Typography variant="caption" display="block" color="text.secondary">
                                                                {new Date(submission.submittedAt).toLocaleDateString()}
                                                            </Typography>
                                                            {submission.files && submission.files.length > 0 && (
                                                                <Typography variant="caption" display="block" color="primary">
                                                                    {submission.files.length} file(s)
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Chip
                                                            label="Not Submitted"
                                                            color="error"
                                                            size="small"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {grade ? `${grade.totalPoints}/${grade.maxPoints}` : '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {grade ? `${grade.percentage.toFixed(1)}%` : '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {grade ? (
                                                        <Chip
                                                            label={grade.letterGrade}
                                                            color={getLetterGradeColor(grade.letterGrade)}
                                                            size="small"
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">-</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={grade ? grade.status : 'Not Graded'}
                                                        color={grade ? getGradeStatusColor(grade.status) : 'default'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2" color="text.secondary">
                                                        {grade ? new Date(grade.updatedAt).toLocaleDateString() : '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<EditIcon />}
                                                        onClick={() => handleGradeStudent(student)}
                                                    >
                                                        {grade ? 'Edit' : 'Grade'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {showGradingModal && selectedStudent && selectedAssignment && (
                <GradingModal
                    student={selectedStudent}
                    assignment={selectedAssignment}
                    existingGrade={getStudentGrade(selectedStudent._id)}
                    rubrics={rubrics}
                    onClose={() => {
                        setShowGradingModal(false);
                        setSelectedStudent(null);
                    }}
                    onSuccess={() => {
                        setShowGradingModal(false);
                        setSelectedStudent(null);
                        fetchStudentsAndGrades();
                    }}
                />
            )}
        </Box>
    );
};

const GradingModal = ({ student, assignment, existingGrade, rubrics, onClose, onSuccess }) => {
    const [gradeData, setGradeData] = useState({
        rubricId: '',
        criteriaGrades: [],
        totalPoints: 0,
        feedback: '',
        privateNotes: '',
        latePenalty: {
            applied: false,
            percentage: 0,
            reason: ''
        }
    });
    const [selectedRubric, setSelectedRubric] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (existingGrade) {
            setGradeData({
                rubricId: existingGrade.rubric?._id || '',
                criteriaGrades: existingGrade.criteriaGrades || [],
                totalPoints: existingGrade.totalPoints,
                feedback: existingGrade.feedback || '',
                privateNotes: existingGrade.privateNotes || '',
                latePenalty: existingGrade.latePenalty || {
                    applied: false,
                    percentage: 0,
                    reason: ''
                }
            });

            if (existingGrade.rubric) {
                const rubric = rubrics.find(r => r._id === existingGrade.rubric._id);
                setSelectedRubric(rubric);
            }
        }
    }, [existingGrade, rubrics]);

    const handleRubricChange = (rubricId) => {
        const rubric = rubrics.find(r => r._id === rubricId);
        setSelectedRubric(rubric);
        setGradeData({
            ...gradeData,
            rubricId,
            criteriaGrades: rubric ? rubric.criteria.map(criterion => ({
                criteriaId: criterion._id,
                criteriaName: criterion.name,
                pointsEarned: 0,
                maxPoints: criterion.maxPoints,
                level: '',
                feedback: ''
            })) : [],
            totalPoints: 0
        });
    };

    const updateCriteriaGrade = (index, field, value) => {
        const newCriteriaGrades = [...gradeData.criteriaGrades];
        newCriteriaGrades[index] = { ...newCriteriaGrades[index], [field]: value };

        // Calculate total points
        const totalPoints = newCriteriaGrades.reduce((sum, criteria) => sum + criteria.pointsEarned, 0);

        setGradeData({
            ...gradeData,
            criteriaGrades: newCriteriaGrades,
            totalPoints
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

            const payload = {
                studentId: student._id,
                assignmentId: assignment._id,
                courseId: assignment.course || assignment.courseId,
                rubricId: gradeData.rubricId || null,
                criteriaGrades: gradeData.criteriaGrades,
                totalPoints: gradeData.totalPoints,
                maxPoints: assignment.maxPoints,
                feedback: gradeData.feedback,
                privateNotes: gradeData.privateNotes,
                latePenalty: gradeData.latePenalty
            };

            // Submitting grade to server

            const response = await fetch(`${apiUrl}/api/grading`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                onSuccess();
            } else {
                const error = await response.json().catch(() => ({ message: 'Unknown server error' }));
                console.error('Server error response:', error);
                console.error('Response status:', response.status);
                console.error('Response statusText:', response.statusText);
                alert(`Error ${response.status}: ${error.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Error saving grade:', error);
            alert('Error saving grade');
        } finally {
            setLoading(false);
        }
    };

    const calculatePercentage = () => {
        if (assignment.maxPoints === 0) return 0;
        let finalPoints = gradeData.totalPoints;

        if (gradeData.latePenalty.applied) {
            finalPoints = finalPoints * (1 - gradeData.latePenalty.percentage / 100);
        }

        return ((finalPoints / assignment.maxPoints) * 100).toFixed(1);
    };

    return (
        <Dialog
            open={true}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { minHeight: '80vh' } }}
        >
            <DialogTitle>
                Grade Assignment: {assignment.title}
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Student Information
                            </Typography>
                            <Typography variant="body1">
                                <strong>Name:</strong> {student.user?.profile?.firstName} {student.user?.profile?.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Email:</strong> {student.user?.email}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Assignment Information
                            </Typography>
                            <Typography variant="body1">
                                <strong>Max Points:</strong> {assignment.maxPoints}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleDateString()}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Box component="form" onSubmit={handleSubmit}>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Select Rubric (Optional)</InputLabel>
                        <Select
                            value={gradeData.rubricId}
                            label="Select Rubric (Optional)"
                            onChange={(e) => handleRubricChange(e.target.value)}
                        >
                            <MenuItem value="">
                                <em>No Rubric - Manual Grading</em>
                            </MenuItem>
                            {rubrics.map(rubric => (
                                <MenuItem key={rubric._id} value={rubric._id}>
                                    {rubric.name} ({rubric.totalPoints} points)
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedRubric ? (
                        <Paper sx={{ p: 2, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Rubric: {selectedRubric.name}
                            </Typography>
                            {gradeData.criteriaGrades.map((criteria, index) => {
                                const rubricCriteria = selectedRubric.criteria[index];
                                return (
                                    <Box key={index} sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            {criteria.criteriaName} (Max: {criteria.maxPoints} points)
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {rubricCriteria?.description}
                                        </Typography>

                                        <FormControl component="fieldset" sx={{ mb: 2 }}>
                                            <RadioGroup
                                                name={`criteria-${index}`}
                                                value={criteria.pointsEarned}
                                                onChange={(e) => {
                                                    const points = parseInt(e.target.value);
                                                    const level = rubricCriteria?.levels.find(l => l.points === points);
                                                    updateCriteriaGrade(index, 'pointsEarned', points);
                                                    updateCriteriaGrade(index, 'level', level?.name || '');
                                                }}
                                            >
                                                {rubricCriteria?.levels.map((level, levelIndex) => (
                                                    <FormControlLabel
                                                        key={levelIndex}
                                                        value={level.points}
                                                        control={<Radio />}
                                                        label={
                                                            <Box>
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    {level.name} ({level.points} pts)
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {level.description}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                    />
                                                ))}
                                            </RadioGroup>
                                        </FormControl>

                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            label="Feedback for this criterion"
                                            placeholder="Optional feedback for this criterion..."
                                            value={criteria.feedback}
                                            onChange={(e) => updateCriteriaGrade(index, 'feedback', e.target.value)}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>
                                );
                            })}
                        </Paper>
                    ) : (
                        <TextField
                            fullWidth
                            type="number"
                            label="Points Earned"
                            value={gradeData.totalPoints}
                            onChange={(e) => setGradeData({ ...gradeData, totalPoints: parseInt(e.target.value) || 0 })}
                            inputProps={{ min: 0, max: assignment.maxPoints }}
                            required
                            sx={{ mb: 3 }}
                        />
                    )}

                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            <strong>Total Points:</strong> {gradeData.totalPoints}/{assignment.maxPoints} |
                            <strong> Percentage:</strong> {calculatePercentage()}%
                        </Typography>
                    </Alert>

                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Late Penalty
                        </Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={gradeData.latePenalty.applied}
                                    onChange={(e) => setGradeData({
                                        ...gradeData,
                                        latePenalty: { ...gradeData.latePenalty, applied: e.target.checked }
                                    })}
                                />
                            }
                            label="Apply late penalty"
                        />

                        {gradeData.latePenalty.applied && (
                            <Box sx={{ mt: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Penalty Percentage"
                                            value={gradeData.latePenalty.percentage}
                                            onChange={(e) => setGradeData({
                                                ...gradeData,
                                                latePenalty: { ...gradeData.latePenalty, percentage: parseInt(e.target.value) || 0 }
                                            })}
                                            inputProps={{ min: 0, max: 100 }}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Reason for penalty"
                                            value={gradeData.latePenalty.reason}
                                            onChange={(e) => setGradeData({
                                                ...gradeData,
                                                latePenalty: { ...gradeData.latePenalty, reason: e.target.value }
                                            })}
                                            size="small"
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </Paper>

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Feedback (Visible to Student)"
                        placeholder="Provide feedback to the student..."
                        value={gradeData.feedback}
                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                        sx={{ mb: 3 }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Private Notes (Only visible to instructors)"
                        placeholder="Private notes for instructors..."
                        value={gradeData.privateNotes}
                        onChange={(e) => setGradeData({ ...gradeData, privateNotes: e.target.value })}
                        sx={{ mb: 3 }}
                    />
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    onClick={handleSubmit}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    {loading ? 'Saving...' : 'Save Grade'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default GradeAssignments;