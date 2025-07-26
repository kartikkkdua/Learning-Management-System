import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Send,
  Notifications,
  Group,
  Person,
  School,
  Add,
  Delete,
  Edit,
  NotificationImportant,
  Email,
  Sms,
  Push
} from '@mui/icons-material';
import { API_URL } from '../../config/api';

const FacultyNotifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    recipients: 'all',
    courseId: '',
    studentIds: [],
    priority: 'normal',
    channels: {
      inApp: true,
      email: false,
      sms: false
    },
    scheduledFor: '',
    expiresAt: ''
  });

  useEffect(() => {
    fetchNotifications();
    fetchCourses();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/notifications/faculty/sent`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/courses/faculty/my-courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudentsForCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/courses/${courseId}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCreateNotification = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/notifications/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Notification sent successfully!');
        setCreateDialogOpen(false);
        resetForm();
        fetchNotifications();
      } else {
        setError(data.message || 'Failed to send notification');
      }
    } catch (error) {
      setError('Network error while sending notification');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      recipients: 'all',
      courseId: '',
      studentIds: [],
      priority: 'normal',
      channels: {
        inApp: true,
        email: false,
        sms: false
      },
      scheduledFor: '',
      expiresAt: ''
    });
    setStudents([]);
  };

  const handleCourseChange = (courseId) => {
    setFormData({ ...formData, courseId, studentIds: [] });
    if (courseId) {
      fetchStudentsForCourse(courseId);
    } else {
      setStudents([]);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'urgent': return 'error';
      default: return 'info';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'urgent': return 'error';
      case 'low': return 'default';
      default: return 'primary';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Faculty Notifications
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Send Notification
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Group sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">All Students</Typography>
              <Typography variant="body2" color="text.secondary">
                Send to all enrolled students
              </Typography>
              <Button
                size="small"
                sx={{ mt: 1 }}
                onClick={() => {
                  setFormData({ ...formData, recipients: 'all' });
                  setCreateDialogOpen(true);
                }}
              >
                Send Alert
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <School sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">Course Students</Typography>
              <Typography variant="body2" color="text.secondary">
                Send to specific course
              </Typography>
              <Button
                size="small"
                sx={{ mt: 1 }}
                onClick={() => {
                  setFormData({ ...formData, recipients: 'course' });
                  setCreateDialogOpen(true);
                }}
              >
                Send Alert
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <NotificationImportant sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6">Urgent Alert</Typography>
              <Typography variant="body2" color="text.secondary">
                High priority notification
              </Typography>
              <Button
                size="small"
                sx={{ mt: 1 }}
                onClick={() => {
                  setFormData({ ...formData, priority: 'urgent', type: 'urgent' });
                  setCreateDialogOpen(true);
                }}
              >
                Send Alert
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Email sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6">Email Blast</Typography>
              <Typography variant="body2" color="text.secondary">
                Send via email + in-app
              </Typography>
              <Button
                size="small"
                sx={{ mt: 1 }}
                onClick={() => {
                  setFormData({ 
                    ...formData, 
                    channels: { inApp: true, email: true, sms: false }
                  });
                  setCreateDialogOpen(true);
                }}
              >
                Send Alert
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Notifications */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Notifications Sent
          </Typography>
          
          {notifications.length > 0 ? (
            <List>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification._id}>
                  <ListItem>
                    <ListItemIcon>
                      <Notifications color={getTypeColor(notification.type)} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.type}
                            color={getTypeColor(notification.type)}
                            size="small"
                          />
                          <Chip
                            label={notification.priority}
                            color={getPriorityColor(notification.priority)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Sent: {new Date(notification.createdAt).toLocaleString()} • 
                            Recipients: {notification.recipientCount || 0} • 
                            Read: {notification.readCount || 0}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box display="flex" gap={1}>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={4}>
              <Notifications sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No notifications sent yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first notification to get started
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create Notification Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="info">Information</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priority"
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Recipients</InputLabel>
                  <Select
                    value={formData.recipients}
                    label="Recipients"
                    onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                  >
                    <MenuItem value="all">All Students</MenuItem>
                    <MenuItem value="course">Specific Course</MenuItem>
                    <MenuItem value="selected">Selected Students</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formData.recipients === 'course' && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Course</InputLabel>
                    <Select
                      value={formData.courseId}
                      label="Course"
                      onChange={(e) => handleCourseChange(e.target.value)}
                    >
                      {courses.map((course) => (
                        <MenuItem key={course._id} value={course._id}>
                          {course.name} ({course.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Delivery Channels
                </Typography>
                <Box display="flex" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.channels.inApp}
                        onChange={(e) => setFormData({
                          ...formData,
                          channels: { ...formData.channels, inApp: e.target.checked }
                        })}
                      />
                    }
                    label="In-App Notification"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.channels.email}
                        onChange={(e) => setFormData({
                          ...formData,
                          channels: { ...formData.channels, email: e.target.checked }
                        })}
                      />
                    }
                    label="Email"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.channels.sms}
                        onChange={(e) => setFormData({
                          ...formData,
                          channels: { ...formData.channels, sms: e.target.checked }
                        })}
                      />
                    }
                    label="SMS"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateDialogOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateNotification}
            disabled={loading || !formData.title || !formData.message}
            startIcon={<Send />}
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacultyNotifications;