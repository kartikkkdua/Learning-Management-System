import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Send,
  Campaign,
  ExpandMore,
  ExpandLess,
  Notifications,
  Group,
  Person
} from '@mui/icons-material';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const QuickNotificationWidget = ({ user }) => {
  const [expanded, setExpanded] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'medium',
    recipientType: 'all'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const navigate = useNavigate();
  const notificationContext = useNotifications();

  if (!notificationContext || (user.role !== 'admin' && user.role !== 'faculty')) {
    return null;
  }

  const { broadcastNotification } = notificationContext;

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleQuickSend = async () => {
    if (!formData.title || !formData.message) {
      setResult({ type: 'error', message: 'Please fill in title and message' });
      return;
    }

    setLoading(true);
    try {
      // For quick send, we'll send to all users (simplified)
      const recipientIds = [user._id]; // Send to self for demo

      await broadcastNotification(recipientIds, {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        priority: formData.priority,
        category: 'administrative',
        metadata: {
          sender: user._id,
          senderName: user.username || user.profile?.firstName
        }
      });

      setResult({ type: 'success', message: 'Quick notification sent!' });

      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'general',
        priority: 'medium',
        recipientType: 'all'
      });

      // Auto-collapse after success
      setTimeout(() => {
        setExpanded(false);
        setResult(null);
      }, 2000);
    } catch (error) {
      setResult({ type: 'error', message: `Failed to send: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const quickTemplates = [
    {
      title: 'Class Reminder',
      message: 'Don\'t forget about today\'s class session.',
      type: 'announcement',
      priority: 'medium'
    },
    {
      title: 'Assignment Due Soon',
      message: 'Assignment deadline is approaching. Please submit on time.',
      type: 'assignment_due',
      priority: 'high'
    },
    {
      title: 'System Maintenance',
      message: 'The system will be under maintenance tonight from 11 PM to 1 AM.',
      type: 'general',
      priority: 'medium'
    }
  ];

  const applyTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      ...template
    }));
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Campaign sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Quick Notification
            </Typography>
          </Box>
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        {!expanded && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Send quick notifications to users
          </Typography>
        )}

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {result && (
              <Alert
                severity={result.type}
                sx={{ mb: 2 }}
                onClose={() => setResult(null)}
              >
                {result.message}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={handleChange('title')}
              margin="normal"
              size="small"
            />

            <TextField
              fullWidth
              label="Message"
              value={formData.message}
              onChange={handleChange('message')}
              margin="normal"
              multiline
              rows={2}
              size="small"
            />

            <Box display="flex" gap={1} mt={2} mb={2}>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={handleChange('type')}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="announcement">Announcement</MenuItem>
                  <MenuItem value="assignment_due">Assignment</MenuItem>
                  <MenuItem value="course_update">Course Update</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 100 }}>
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
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Quick Templates:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              {quickTemplates.map((template, index) => (
                <Chip
                  key={index}
                  label={template.title}
                  onClick={() => applyTemplate(template)}
                  size="small"
                  variant="outlined"
                  clickable
                />
              ))}
            </Box>
          </Box>
        </Collapse>
      </CardContent>

      {expanded && (
        <CardActions>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleQuickSend}
            disabled={loading || !formData.title || !formData.message}
            size="small"
          >
            {loading ? 'Sending...' : 'Quick Send'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Notifications />}
            onClick={() => navigate('/create-notification')}
            size="small"
          >
            Advanced
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default QuickNotificationWidget;