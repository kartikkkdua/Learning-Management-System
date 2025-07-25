import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Autocomplete,
  Switch,
  FormControlLabel,
  DateTimePicker,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Send,
  Notifications,
  Group,
  Person,
  Schedule,
  Preview,
  Save,
  Campaign,
  School,
  AdminPanelSettings
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';
import axios from 'axios';

const CreateNotification = ({ user }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'medium',
    category: 'academic',
    recipients: [],
    recipientType: 'individual', // individual, role, course, all
    selectedRole: 'student',
    selectedCourse: '',
    scheduledFor: null,
    actionUrl: '',
    expiresAt: null
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [preview, setPreview] = useState(false);

  const notificationContext = useNotifications();

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      // Faculty should only see their own courses
      const endpoint = user?.role === 'faculty' ? 
        'http://localhost:3001/api/courses/my-courses' : 
        'http://localhost:3001/api/courses';
        
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Handle case where context might not be available
  if (!notificationContext) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Notification system is not available. Please make sure you're logged in.
        </Alert>
      </Container>
    );
  }

  const { createNotification, broadcastNotification } = notificationContext;

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleRecipientsChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      recipients: newValue
    }));
  };

  const getRecipientIds = () => {
    switch (formData.recipientType) {
      case 'individual':
        return formData.recipients.map(user => user._id);
      case 'role':
        return users.filter(u => u.role === formData.selectedRole).map(u => u._id);
      case 'course':
        // In a real app, you'd fetch enrolled students for the course
        return users.filter(u => u.role === 'student').map(u => u._id);
      case 'all':
        return users.map(u => u._id);
      default:
        return [];
    }
  };

  const handleSendNotification = async () => {
    setLoading(true);
    setResult(null);

    try {
      const recipientIds = getRecipientIds();
      
      if (recipientIds.length === 0) {
        setResult({ type: 'error', message: 'Please select at least one recipient' });
        setLoading(false);
        return;
      }

      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        priority: formData.priority,
        category: formData.category,
        actionUrl: formData.actionUrl || undefined,
        scheduledFor: formData.scheduledFor || undefined,
        expiresAt: formData.expiresAt || undefined,
        metadata: {
          course: formData.selectedCourse || undefined,
          sender: user._id,
          senderName: user.username || user.profile?.firstName
        }
      };

      if (recipientIds.length === 1) {
        await createNotification({
          recipient: recipientIds[0],
          ...notificationData
        });
      } else {
        await broadcastNotification(recipientIds, notificationData);
      }

      setResult({ 
        type: 'success', 
        message: `Notification sent successfully to ${recipientIds.length} recipient(s)!` 
      });

      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'general',
        priority: 'medium',
        category: 'academic',
        recipients: [],
        recipientType: 'individual',
        selectedRole: 'student',
        selectedCourse: '',
        scheduledFor: null,
        actionUrl: '',
        expiresAt: null
      });
      setActiveStep(0);
    } catch (error) {
      setResult({ type: 'error', message: `Failed to send notification: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              label="Notification Title"
              value={formData.title}
              onChange={handleChange('title')}
              margin="normal"
              required
              helperText="Enter a clear, descriptive title for your notification"
            />
            
            <TextField
              fullWidth
              label="Message"
              value={formData.message}
              onChange={handleChange('message')}
              margin="normal"
              multiline
              rows={4}
              required
              helperText="Write your notification message. Be clear and concise."
            />

            <Box display="flex" gap={2} mt={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={handleChange('type')}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="assignment_due">Assignment Due</MenuItem>
                  <MenuItem value="grade_posted">Grade Posted</MenuItem>
                  <MenuItem value="announcement">Announcement</MenuItem>
                  <MenuItem value="enrollment_confirmation">Enrollment</MenuItem>
                  <MenuItem value="course_update">Course Update</MenuItem>
                  <MenuItem value="exam_schedule">Exam Schedule</MenuItem>
                  <MenuItem value="class_cancelled">Class Cancelled</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={handleChange('priority')}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={handleChange('category')}
                >
                  <MenuItem value="academic">Academic</MenuItem>
                  <MenuItem value="administrative">Administrative</MenuItem>
                  <MenuItem value="social">Social</MenuItem>
                  <MenuItem value="technical">Technical</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              label="Action URL (Optional)"
              value={formData.actionUrl}
              onChange={handleChange('actionUrl')}
              margin="normal"
              helperText="URL to navigate to when notification is clicked (e.g., /assignments/123)"
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Recipients
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Recipient Type</InputLabel>
              <Select
                value={formData.recipientType}
                label="Recipient Type"
                onChange={handleChange('recipientType')}
              >
                <MenuItem value="individual">
                  <Box display="flex" alignItems="center">
                    <Person sx={{ mr: 1 }} />
                    Individual Users
                  </Box>
                </MenuItem>
                <MenuItem value="role">
                  <Box display="flex" alignItems="center">
                    <Group sx={{ mr: 1 }} />
                    By Role
                  </Box>
                </MenuItem>
                <MenuItem value="course">
                  <Box display="flex" alignItems="center">
                    <School sx={{ mr: 1 }} />
                    Course Students
                  </Box>
                </MenuItem>
                <MenuItem value="all">
                  <Box display="flex" alignItems="center">
                    <Campaign sx={{ mr: 1 }} />
                    All Users
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {formData.recipientType === 'individual' && (
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(option) => `${option.username} (${option.role}) - ${option.profile?.firstName || ''} ${option.profile?.lastName || ''}`}
                value={formData.recipients}
                onChange={handleRecipientsChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Users"
                    placeholder="Search and select users..."
                    margin="normal"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={`${option.username} (${option.role})`}
                      {...getTagProps({ index })}
                      key={option._id}
                    />
                  ))
                }
              />
            )}

            {formData.recipientType === 'role' && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Role</InputLabel>
                <Select
                  value={formData.selectedRole}
                  label="Select Role"
                  onChange={handleChange('selectedRole')}
                >
                  <MenuItem value="student">
                    <Box display="flex" alignItems="center">
                      <Person sx={{ mr: 1 }} />
                      Students ({users.filter(u => u.role === 'student').length})
                    </Box>
                  </MenuItem>
                  <MenuItem value="faculty">
                    <Box display="flex" alignItems="center">
                      <School sx={{ mr: 1 }} />
                      Faculty ({users.filter(u => u.role === 'faculty').length})
                    </Box>
                  </MenuItem>
                  <MenuItem value="admin">
                    <Box display="flex" alignItems="center">
                      <AdminPanelSettings sx={{ mr: 1 }} />
                      Admins ({users.filter(u => u.role === 'admin').length})
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            )}

            {formData.recipientType === 'course' && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Course</InputLabel>
                <Select
                  value={formData.selectedCourse}
                  label="Select Course"
                  onChange={handleChange('selectedCourse')}
                >
                  {courses.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.name || course.title} ({course.code || 'No Code'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {formData.recipientType === 'all' && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This will send the notification to all {users.length} users in the system.
              </Alert>
            )}

            <Box mt={2}>
              <Typography variant="body2" color="textSecondary">
                Recipients: {getRecipientIds().length} user(s)
              </Typography>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Schedule & Settings (Optional)
            </Typography>

            <Box mt={2}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Leave these fields empty to send the notification immediately.
              </Typography>
            </Box>

            {/* Note: DateTimePicker would need @mui/x-date-pickers package */}
            <TextField
              fullWidth
              label="Schedule For (Future Date/Time)"
              type="datetime-local"
              value={formData.scheduledFor || ''}
              onChange={handleChange('scheduledFor')}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              helperText="Leave empty to send immediately"
            />

            <TextField
              fullWidth
              label="Expires At (Optional)"
              type="datetime-local"
              value={formData.expiresAt || ''}
              onChange={handleChange('expiresAt')}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              helperText="Notification will be automatically deleted after this date"
            />
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Preview & Send
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Notifications sx={{ mr: 1 }} />
                  <Typography variant="h6">{formData.title}</Typography>
                  <Chip
                    label={formData.priority.toUpperCase()}
                    color={formData.priority === 'urgent' ? 'error' : formData.priority === 'high' ? 'warning' : 'default'}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Box>
                <Typography variant="body1" paragraph>
                  {formData.message}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip label={formData.type} size="small" variant="outlined" />
                  <Chip label={formData.category} size="small" variant="outlined" />
                  {formData.actionUrl && <Chip label="Has Action" size="small" color="primary" variant="outlined" />}
                  {formData.scheduledFor && <Chip label="Scheduled" size="small" color="info" variant="outlined" />}
                </Box>
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Recipients:</strong> {getRecipientIds().length} user(s)<br/>
                <strong>Type:</strong> {formData.recipientType}<br/>
                {formData.scheduledFor && <><strong>Scheduled for:</strong> {new Date(formData.scheduledFor).toLocaleString()}<br/></>}
                <strong>Sender:</strong> {user.username} ({user.role})
              </Typography>
            </Alert>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  const steps = [
    'Notification Content',
    'Select Recipients',
    'Schedule & Settings',
    'Preview & Send'
  ];

  if (user.role !== 'admin' && user.role !== 'faculty') {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          Access denied. Only admins and faculty can create notifications.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Campaign sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4">
          Create Notification
        </Typography>
      </Box>

      {result && (
        <Alert
          severity={result.type}
          sx={{ mb: 3 }}
          onClose={() => setResult(null)}
        >
          {result.message}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {getStepContent(index)}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <div>
                    {activeStep === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleSendNotification}
                        disabled={loading || !formData.title || !formData.message}
                        startIcon={<Send />}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        {loading ? 'Sending...' : 'Send Notification'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mt: 1, mr: 1 }}
                        disabled={
                          (index === 0 && (!formData.title || !formData.message)) ||
                          (index === 1 && getRecipientIds().length === 0)
                        }
                      >
                        Continue
                      </Button>
                    )}
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Container>
  );
};

export default CreateNotification;