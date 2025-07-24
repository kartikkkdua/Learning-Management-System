import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Chip,
    Alert,
    Card,
    CardContent,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Search,
    People,
    School,
    Email,
    Person
} from '@mui/icons-material';
import axios from 'axios';

const FacultyStudents = ({ user }) => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');

    useEffect(() => {
        fetchStudents();
        fetchMyCourses();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };

            // Faculty can only see students in their courses
            const response = await axios.get('http://localhost:3001/api/students', config);
            setStudents(response.data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
            setError('Failed to load students. You can only view students enrolled in your courses.');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };

            const response = await axios.get('http://localhost:3001/api/courses/my-courses', config);
            setCourses(response.data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchStudentsByCourse = async (courseId) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };

            const response = await axios.get(`http://localhost:3001/api/students/course/${courseId}`, config);
            setStudents(response.data || []);
        } catch (error) {
            console.error('Error fetching students by course:', error);
            setError('Failed to load students for the selected course.');
        }
    };

    const handleCourseChange = (courseId) => {
        setSelectedCourse(courseId);
        if (courseId) {
            fetchStudentsByCourse(courseId);
        } else {
            fetchStudents(); // Fetch all students from faculty's courses
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = !searchTerm ||
            student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography>Loading students...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                My Students
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    As a faculty member, you can only view students who are enrolled in your courses.
                </Typography>
            </Alert>

            {error && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Statistics Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <People color="primary" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography variant="h4">{filteredStudents.length}</Typography>
                                    <Typography color="textSecondary">Total Students</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <School color="secondary" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography variant="h4">{courses.length}</Typography>
                                    <Typography color="textSecondary">My Courses</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Search and Filter */}
            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Search Students"
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Filter by Course</InputLabel>
                        <Select
                            value={selectedCourse}
                            label="Filter by Course"
                            onChange={(e) => handleCourseChange(e.target.value)}
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

            {/* Students Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Year</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Enrolled Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredStudents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Box py={4}>
                                        <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                        <Typography variant="h6" color="textSecondary">
                                            No students found
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Students will appear here when they enroll in your courses
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStudents.map((student) => (
                                <TableRow key={student._id}>
                                    <TableCell>
                                        <Chip label={student.studentId} variant="outlined" size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <Person sx={{ mr: 1, color: 'text.secondary' }} />
                                            {student.firstName} {student.lastName}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <Email sx={{ mr: 1, color: 'text.secondary' }} />
                                            {student.email}
                                        </Box>
                                    </TableCell>
                                    <TableCell>Year {student.year}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={student.status?.toUpperCase() || 'ACTIVE'}
                                            color={student.status === 'active' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {student.enrollmentDate
                                            ? new Date(student.enrollmentDate).toLocaleDateString()
                                            : 'N/A'
                                        }
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {filteredStudents.length > 0 && (
                <Box mt={2}>
                    <Typography variant="body2" color="textSecondary">
                        Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                        {searchTerm && ` matching "${searchTerm}"`}
                    </Typography>
                </Box>
            )}
        </Container>
    );
};

export default FacultyStudents;