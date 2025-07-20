import React, { useState } from 'react';
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
  Divider
} from '@mui/material';
import {
  Send,
  Notifications,
  Group,
  Person,
  Science
} from '@mui/icons-material';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationTester = ({ user }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'medium',
    category: 'system',
    recipient: '',
    broadcast: false
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const notificationContext = useNotifications();

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

  const handleSendNotification = async () => {
    setLoading(true);
    setResult(null);

    try {
      if (formData.broadcast) {
        // For demo purposes, we'll broadcast to a few test user IDs
        const testUserIds = [user.id || user._id]; // Send to self for testing
        await broadcastNotification(testUserIds, {
          title: formData.title,
          message: formData.message,
          type: formData.type,
          priority: formData.priority,
          category: formData.category
        });
        setResult({ type: 'success', message: 'Broadcast notification sent successfully!' });
      } else {
        await createNotification({
          recipient: formData.recipient || user.id || user._id,
          title: formData.title,
          message: formData.message,
          type: formData.type,
          priority: formData.priority,
          category: formData.category
        });
        setResult({ type: 'success', message: 'Notification sent successfully!' });
      }

      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'general',
        priority: 'medium',
        category: 'system',
        recipient: '',
        broadcast: false
      });
    } catch (error) {
      setResult({ type: 'error', message: `Failed to send notification: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const sendQuickNotification = async (template) => {
    setLoading(true);
    try {
      await createNotification({
        recipient: user.id || user._id,
        ...template
      });
      setResult({ type: 'success', message: 'Quick notification sent!' });
    } catch (error) {
      setResult({ type: 'error', message: `Failed to send notification: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const quickTemplates = [
    {
      title: 'Assignment Due Soon',
      message: 'Your assignment "React Components" is due in 2 hours',
      type: 'assignment_due',
      priority: 'high',
      category: 'academic'
    },
    {
      title: 'New Grade Posted',
      message: 'Your grade for "Midterm Exam" has been posted: 95/100',
      type: 'grade_posted',
      priority: 'medium',
      category: 'academic'
    },
    {
      title: 'Course Announcement',
      message: 'Class will be held online tomorrow due to weather conditions',
      type: 'announcement',
      priority: 'high',
      category: 'academic'
    },
    {
      title: 'System Maintenance',
      message: 'The system will be under maintenance from 2 AM to 4 AM',
      type: 'general',
      priority: 'medium',
      category: 'system'
    }
  ];

  if (user.role !== 'admin' && user.role !== 'faculty') {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          Access denied. Only admins and faculty can access the notification tester.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Science sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4">
          Notification Testing Center
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

      <Grid container spacing={3}>
        {/* Custom Notification Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Send Custom Notification
            </Typography>

            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={handleChange('title')}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Message"
                value={formData.message}
                onChange={handleChange('message')}
                margin="normal"
                multiline
                rows={3}
                required
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
                label="Recipient ID (leave empty to send to yourself)"
                value={formData.recipient}
                onChange={handleChange('recipient')}
                margin="normal"
                helperText="For testing, leave empty to send to yourself"
              />

              <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                <Box display="flex" gap={1}>
                  <Chip
                    icon={<Person />}
                    label="Single User"
                    color={!formData.broadcast ? 'primary' : 'default'}
                    onClick={() => setFormData(prev => ({ ...prev, broadcast: false }))}
                    clickable
                  />
                  <Chip
                    icon={<Group />}
                    label="Broadcast"
                    color={formData.broadcast ? 'primary' : 'default'}
                    onClick={() => setFormData(prev => ({ ...prev, broadcast: true }))}
                    clickable
                  />
                </Box>

                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handleSendNotification}
                  disabled={loading || !formData.title || !formData.message}
                >
                  {loading ? 'Sending...' : 'Send Notification'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Templates */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Templates
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Send pre-configured notifications for testing
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
              {quickTemplates.map((template, index) => (
                <Card key={index} variant="outlined">
                  <CardContent sx={{ pb: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {template.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {template.message}
                    </Typography>
                    <Box display="flex" gap={0.5}>
                      <Chip
                        label={template.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={template.priority}
                        size="small"
                        color={template.priority === 'high' ? 'warning' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<Notifications />}
                      onClick={() => sendQuickNotification(template)}
                      disabled={loading}
                    >
                      Send
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Instructions */}
      <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          Testing Instructions
        </Typography>
        <Typography variant="body2" paragraph>
          1. <strong>Real-time Testing:</strong> Send a notification and watch it appear instantly in the notification bell
        </Typography>
        <Typography variant="body2" paragraph>
          2. <strong>Browser Notifications:</strong> Make sure browser notifications are enabled to see desktop alerts
        </Typography>
        <Typography variant="body2" paragraph>
          3. <strong>Multiple Tabs:</strong> Open multiple tabs to test real-time synchronization
        </Typography>
        <Typography variant="body2" paragraph>
          4. <strong>Different Priorities:</strong> Test different priority levels to see visual differences
        </Typography>
        <Typography variant="body2">
          5. <strong>Broadcast Testing:</strong> Use broadcast mode to send to multiple users (currently sends to yourself for demo)
        </Typography>
      </Paper>
    </Container>
  );
};

export default NotificationTester;