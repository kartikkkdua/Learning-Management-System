import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Box,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Paper,
    Tab,
    Tabs,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
} from '@mui/material';
import {
    Assignment,
    Schedule,
    CheckCircle,
    Warning,
    Error,
    Upload,
    Visibility
} from '@mui/icons-material';
import axios from 'axios';

const StudentAssignments = ({ user }) => {
    const [assignments, setAssignments] = useState([]);
    const [selectedTab, setSelectedTab] = useState(0);
    const [submitDialog, setSubmitDialog] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissionText, setSubmissionText] = useState('');

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const studentId = user.id || user._id;
            const response = await axios.get(`http://localhost:3001/api/students/${studentId}/assignments`);
            setAssignments(response.data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setAssignments([]); // Fallback to empty array
        }
    };

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const getAssignmentStatus = (assignment) => {
        const now = new Date();
        const dueDate = new Date(assignment.dueDate);

        // Check for submission - handle both populated and non-populated student references
        const hasSubmission = assignment.submissions?.some(sub => {
            if (!sub || !sub.student) return false;

            // Handle populated student object
            if (typeof sub.student === 'object') {
                return sub.student._id === user.id ||
                    sub.student.user === user.id ||
                    sub.student.email === user.email;
            }

            // Handle non-populated student ID
            return sub.student === user.id;
        });

        // Debug assignment status (remove in production)
        if (assignment.title === 'Debug Assignment') {
            console.log('Assignment status check:', {
                title: assignment.title,
                hasSubmission,
                submissions: assignment.submissions?.map(s => ({
                    student: s.student,
                    studentType: typeof s.student,
                    submittedAt: s.submittedAt
                })),
                userId: user.id,
                userEmail: user.email
            });
        }

        if (hasSubmission) {
            return { status: 'submitted', color: 'success', label: 'Submitted' };
        } else if (now > dueDate) {
            return { status: 'overdue', color: 'error', label: 'Overdue' };
        } else if (dueDate - now < 24 * 60 * 60 * 1000) { // Due within 24 hours
            return { status: 'due-soon', color: 'warning', label: 'Due Soon' };
        } else {
            return { status: 'pending', color: 'info', label: 'Pending' };
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'assignment': return 'primary';
            case 'quiz': return 'secondary';
            case 'exam': return 'error';
            case 'project': return 'success';
            default: return 'default';
        }
    };

    const filterAssignments = (status) => {
        return assignments.filter(assignment => {
            const assignmentStatus = getAssignmentStatus(assignment);
            switch (status) {
                case 'pending':
                    return assignmentStatus.status === 'pending' || assignmentStatus.status === 'due-soon';
                case 'submitted':
                    return assignmentStatus.status === 'submitted';
                case 'overdue':
                    return assignmentStatus.status === 'overdue';
                default:
                    return true;
            }
        });
    };

    const handleSubmit = async () => {
        try {
            // Mock submission - in real app, this would handle file uploads
            const submissionData = {
                studentId: user.id || user._id,
                files: [{ filename: 'submission.txt', content: submissionText }]
            };

            await axios.post(`http://localhost:3001/api/assignments/${selectedAssignment._id}/submit`, submissionData);

            setSubmitDialog(false);
            setSubmissionText('');
            setSelectedAssignment(null);
            fetchAssignments();

            alert('Assignment submitted successfully!');
        } catch (error) {
            console.error('Error submitting assignment:', error);
            alert('Error submitting assignment. Please try again.');
        }
    };

    const AssignmentCard = ({ assignment }) => {
        const status = getAssignmentStatus(assignment);
        const daysUntilDue = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

        return (
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="h6" component="h2">
                            {assignment.title}
                        </Typography>
                        <Box display="flex" gap={1}>
                            <Chip
                                label={assignment.type.toUpperCase()}
                                color={getTypeColor(assignment.type)}
                                size="small"
                            />
                            <Chip
                                label={status.label}
                                color={status.color}
                                size="small"
                            />
                        </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                        {assignment.description.length > 150
                            ? `${assignment.description.substring(0, 150)}...`
                            : assignment.description
                        }
                    </Typography>

                    <List dense>
                        <ListItem sx={{ px: 0 }}>
                            <ListItemIcon>
                                <Assignment fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Course"
                                secondary={assignment.course ? assignment.course.courseCode : 'Unknown Course'}
                            />
                        </ListItem>

                        <ListItem sx={{ px: 0 }}>
                            <ListItemIcon>
                                <Schedule fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Due Date"
                                secondary={`${new Date(assignment.dueDate).toLocaleDateString()} (${daysUntilDue > 0 ? `${daysUntilDue} days left` : 'Overdue'})`}
                            />
                        </ListItem>

                        <ListItem sx={{ px: 0 }}>
                            <ListItemIcon>
                                {status.status === 'submitted' ? <CheckCircle fontSize="small" /> :
                                    status.status === 'overdue' ? <Error fontSize="small" /> :
                                        <Warning fontSize="small" />}
                            </ListItemIcon>
                            <ListItemText
                                primary="Max Points"
                                secondary={`${assignment.maxPoints} points`}
                            />
                        </ListItem>
                    </List>
                </CardContent>

                <CardActions>
                    <Button
                        size="small"
                        startIcon={<Visibility />}
                        variant="outlined"
                    >
                        View Details
                    </Button>
                    {status.status !== 'submitted' && (
                        <Button
                            size="small"
                            startIcon={<Upload />}
                            color="primary"
                            onClick={() => {
                                setSelectedAssignment(assignment);
                                setSubmitDialog(true);
                            }}
                        >
                            Submit
                        </Button>
                    )}
                </CardActions>
            </Card>
        );
    };

    const getTabAssignments = () => {
        switch (selectedTab) {
            case 0: return assignments; // All
            case 1: return filterAssignments('pending'); // Pending
            case 2: return filterAssignments('submitted'); // Submitted
            case 3: return filterAssignments('overdue'); // Overdue
            default: return assignments;
        }
    };

    const tabAssignments = getTabAssignments();

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                My Assignments
            </Typography>

            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    sx={{ px: 2 }}
                >
                    <Tab label={`All (${assignments.length})`} />
                    <Tab label={`Pending (${filterAssignments('pending').length})`} />
                    <Tab label={`Submitted (${filterAssignments('submitted').length})`} />
                    <Tab label={`Overdue (${filterAssignments('overdue').length})`} />
                </Tabs>
            </Paper>

            {/* Quick Stats */}
            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                            {assignments.length}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Total Assignments
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                            {filterAssignments('submitted').length}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Submitted
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">
                            {filterAssignments('pending').length}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Pending
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="error.main">
                            {filterAssignments('overdue').length}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Overdue
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Assignments Grid */}
            <Grid container spacing={3}>
                {tabAssignments.map((assignment) => (
                    <Grid item xs={12} md={6} lg={4} key={assignment._id}>
                        <AssignmentCard assignment={assignment} />
                    </Grid>
                ))}
            </Grid>

            {tabAssignments.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
                    <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        No Assignments Found
                    </Typography>
                    <Typography color="textSecondary">
                        {selectedTab === 0 ?
                            "You don't have any assignments yet." :
                            `No ${['all', 'pending', 'submitted', 'overdue'][selectedTab]} assignments found.`
                        }
                    </Typography>
                </Paper>
            )}

            {/* Submit Assignment Dialog */}
            <Dialog open={submitDialog} onClose={() => setSubmitDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Submit Assignment: {selectedAssignment?.title}
                </DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Due: {selectedAssignment && new Date(selectedAssignment.dueDate).toLocaleString()}
                    </Alert>

                    <Typography variant="body2" paragraph>
                        {selectedAssignment?.description}
                    </Typography>

                    <TextField
                        fullWidth
                        multiline
                        rows={6}
                        label="Assignment Submission"
                        placeholder="Enter your assignment text here or describe your file uploads..."
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <Box sx={{ border: '2px dashed #ccc', p: 3, textAlign: 'center', borderRadius: 1 }}>
                        <Upload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="textSecondary">
                            Drag and drop files here or click to browse
                        </Typography>
                        <Button variant="outlined" sx={{ mt: 1 }}>
                            Choose Files
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSubmitDialog(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!submissionText.trim()}
                    >
                        Submit Assignment
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default StudentAssignments;