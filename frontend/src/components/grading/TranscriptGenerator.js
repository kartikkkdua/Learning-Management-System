import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    School as SchoolIcon,
    Download as DownloadIcon,
    Print as PrintIcon,
    Email as EmailIcon
} from '@mui/icons-material';

const TranscriptGenerator = ({ courseId }) => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [transcript, setTranscript] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (courseId) {
            fetchStudents();
        }
    }, [courseId]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

            const response = await fetch(`${apiUrl}/api/courses/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setStudents(data.enrolledStudents || []);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateTranscript = async () => {
        if (!selectedStudent) return;

        try {
            setGenerating(true);
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

            const response = await fetch(`${apiUrl}/api/transcripts/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId: selectedStudent,
                    courseId: courseId,
                    academicYear: new Date().getFullYear(),
                    semester: new Date().getMonth() < 6 ? 'Spring' : 'Fall'
                })
            });

            if (response.ok) {
                const data = await response.json();
                setTranscript(data);
            } else {
                const error = await response.json().catch(() => ({ message: 'Failed to generate transcript' }));
                console.error('Error generating transcript:', error);
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error generating transcript:', error);
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = () => {
        // Implementation for downloading transcript as PDF
        console.log('Download transcript for student:', selectedStudent);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleEmail = () => {
        // Implementation for emailing transcript
        console.log('Email transcript for student:', selectedStudent);
    };

    const calculateGPA = (grades) => {
        if (!grades || grades.length === 0) return 0;
        const total = grades.reduce((sum, grade) => sum + getGradePoints(grade.letterGrade), 0);
        return (total / grades.length).toFixed(2);
    };

    const getGradePoints = (letterGrade) => {
        const gradeMap = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'D-': 0.7,
            'F': 0.0
        };
        return gradeMap[letterGrade] || 0;
    };

    const selectedStudentData = students.find(s => s._id === selectedStudent);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon />
                    Transcript Generator
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Generate Transcript
                        </Typography>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Select Student</InputLabel>
                            <Select
                                value={selectedStudent}
                                label="Select Student"
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                disabled={loading}
                            >
                                {students.map((student) => (
                                    <MenuItem key={student._id} value={student._id}>
                                        {student.user?.profile?.firstName} {student.user?.profile?.lastName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={generateTranscript}
                            disabled={!selectedStudent || generating}
                            sx={{ mb: 2 }}
                        >
                            {generating ? <CircularProgress size={24} /> : 'Generate Transcript'}
                        </Button>

                        {transcript && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<DownloadIcon />}
                                    onClick={handleDownload}
                                    size="small"
                                >
                                    Download PDF
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<PrintIcon />}
                                    onClick={handlePrint}
                                    size="small"
                                >
                                    Print
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<EmailIcon />}
                                    onClick={handleEmail}
                                    size="small"
                                >
                                    Email Student
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    {transcript ? (
                        <Paper sx={{ p: 3 }}>
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Typography variant="h4" gutterBottom>
                                    Official Transcript
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    {selectedStudentData?.user?.profile?.firstName} {selectedStudentData?.user?.profile?.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Student ID: {selectedStudentData?.user?.username}
                                </Typography>
                            </Box>

                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} sm={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" color="primary">
                                                {calculateGPA(transcript.grades)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Cumulative GPA
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" color="primary">
                                                {transcript.totalCredits || 0}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Credits
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Assignment</TableCell>
                                            <TableCell align="center">Points</TableCell>
                                            <TableCell align="center">Percentage</TableCell>
                                            <TableCell align="center">Letter Grade</TableCell>
                                            <TableCell align="center">Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transcript.grades?.map((grade, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {grade.assignment?.title}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {grade.assignment?.category}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {grade.totalPoints}/{grade.maxPoints}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {grade.percentage.toFixed(1)}%
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={grade.letterGrade}
                                                        color={grade.letterGrade.startsWith('A') ? 'success' :
                                                            grade.letterGrade.startsWith('B') ? 'info' :
                                                                grade.letterGrade.startsWith('C') ? 'warning' : 'error'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={grade.status}
                                                        color={grade.status === 'published' ? 'success' : 'default'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                <Typography variant="caption" color="text.secondary">
                                    Generated on: {new Date().toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Paper>
                    ) : (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No Transcript Generated
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Select a student and click "Generate Transcript" to view their academic record.
                            </Typography>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default TranscriptGenerator;