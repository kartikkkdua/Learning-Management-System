import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  VideoCall,
  Add,
  Edit,
  Delete,
  People,
  Schedule,
  PlayArrow,
  Stop,
  Settings,
  Assessment
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { API_URL } from '../../config/api';

const VirtualClassroomManager = ({ courseId, userRole }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledTime: new Date(),
    duration: 60,
    platform: 'meet',
    courseId: courseId || '',
    recordingEnabled: false,
    settings: {
      waitingRoom: true,
      muteOnEntry: true,
      allowScreenShare: false,
      allowChat: true
    }
  });

  useEffect(() => {
    fetchClassrooms();
    if (!courseId) {
      fetchCourses();
    }
  }, [courseId]);

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

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // If courseId is provided, fetch for specific course, otherwise fetch all for faculty
      const endpoint = courseId 
        ? `/virtual-classroom/course/${courseId}`
        : '/virtual-classroom/faculty/my-classes';
        
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setClassrooms(data.classrooms);
      } else {
        setError('Failed to fetch virtual classrooms');
      }
    } catch (error) {
      setError('Network error while fetching classrooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClassroom = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/virtual-classroom/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          courseId: formData.courseId || courseId
        })
      });

      const data = await response.json();
      if (data.success) {
        const platformName = formData.platform === 'meet' ? 'Google Meet' : 
                            formData.platform === 'zoom' ? 'Zoom' : 
                            formData.platform === 'teams' ? 'Teams' : formData.platform;
        setSuccess(`${platformName} virtual classroom created successfully! Students can join using the meeting link.`);
        setCreateDialogOpen(false);
        resetForm();
        fetchClassrooms();
      } else {
        setError(data.message || 'Failed to create virtual classroom');
      }
    } catch (error) {
      setError('Network error while creating classroom');
    }
  };

  const handleUpdateClassroom = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/virtual-classroom/${selectedClassroom._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Virtual classroom updated successfully');
        setEditDialogOpen(false);
        resetForm();
        fetchClassrooms();
      } else {
        setError(data.message || 'Failed to update virtual classroom');
      }
    } catch (error) {
      setError('Network error while updating classroom');
    }
  };

  const handleDeleteClassroom = async (classroomId) => {
    if (!window.confirm('Are you sure you want to delete this virtual classroom?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/virtual-classroom/${classroomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Virtual classroom deleted successfully');
        fetchClassrooms();
      } else {
        setError(data.message || 'Failed to delete virtual classroom');
      }
    } catch (error) {
      setError('Network error while deleting classroom');
    }
  };

  const handleJoinClassroom = async (classroomId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/virtual-classroom/${classroomId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        // Open Zoom meeting in new window
        window.open(data.joinUrl, '_blank');
      } else {
        setError(data.message || 'Failed to join virtual classroom');
      }
    } catch (error) {
      setError('Network error while joining classroom');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      scheduledTime: new Date(),
      duration: 60,
      platform: 'meet',
      courseId: courseId || '',
      recordingEnabled: false,
      settings: {
        waitingRoom: true,
        muteOnEntry: true,
        allowScreenShare: false,
        allowChat: true
      }
    });
    setSelectedClassroom(null);
  };

  const openEditDialog = (classroom) => {
    setSelectedClassroom(classroom);
    setFormData({
      title: classroom.title,
      description: classroom.description || '',
      scheduledTime: new Date(classroom.scheduledTime),
      duration: classroom.duration,
      platform: classroom.platform,
      recordingEnabled: classroom.recordingEnabled,
      settings: classroom.settings
    });
    setEditDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'live': return 'success';
      case 'ended': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'meet':
      case 'google-meet':
        return '🎥'; // Google Meet icon
      case 'zoom':
        return '📹'; // Zoom icon
      case 'teams':
        return '💼'; // Teams icon
      default:
        return '🎥';
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'meet':
      case 'google-meet':
        return '#4285f4'; // Google blue
      case 'zoom':
        return '#2d8cff'; // Zoom blue
      case 'teams':
        return '#6264a7'; // Teams purple
      default:
        return '#4285f4';
    }
  };

  const isUpcoming = (scheduledTime) => {
    const now = new Date();
    const meetingTime = new Date(scheduledTime);
    return meetingTime > now;
  };

  const canJoin = (classroom) => {
    const now = new Date();
    const meetingTime = new Date(classroom.scheduledTime);
    const timeDiff = Math.abs(now - meetingTime);
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return classroom.status === 'live' || hoursDiff <= 2;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            Virtual Classrooms
          </Typography>
          {userRole === 'faculty' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Classroom
            </Button>
          )}
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

        {/* Classrooms Grid */}
        <Grid container spacing={3}>
          {classrooms.map((classroom) => (
            <Grid item xs={12} md={6} lg={4} key={classroom._id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h3" noWrap>
                      {classroom.title}
                    </Typography>
                    <Chip
                      label={classroom.status}
                      color={getStatusColor(classroom.status)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {classroom.description}
                  </Typography>

                  <Box display="flex" alignItems="center" mb={1}>
                    <Schedule fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {new Date(classroom.scheduledTime).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={2}>
                    <VideoCall fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {classroom.duration} minutes
                    </Typography>
                    <Box 
                      sx={{ 
                        ml: 1, 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1, 
                        bgcolor: getPlatformColor(classroom.platform),
                        color: 'white',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      <span>{getPlatformIcon(classroom.platform)}</span>
                      {classroom.platform === 'meet' ? 'Google Meet' : 
                       classroom.platform === 'zoom' ? 'Zoom' : 
                       classroom.platform === 'teams' ? 'Teams' : classroom.platform}
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {canJoin(classroom) && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PlayArrow />}
                        onClick={() => handleJoinClassroom(classroom._id)}
                        color={classroom.status === 'live' ? 'success' : 'primary'}
                      >
                        {classroom.status === 'live' ? 'Join Live' : 'Join'}
                      </Button>
                    )}

                    {userRole === 'faculty' && (
                      <>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(classroom)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Attendance">
                          <IconButton size="small">
                            <People />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClassroom(classroom._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {classrooms.length === 0 && (
          <Box textAlign="center" py={4}>
            <VideoCall sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No virtual classrooms scheduled
            </Typography>
            {userRole === 'faculty' && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                Create your first virtual classroom to get started
              </Typography>
            )}
          </Box>
        )}

        {/* Create/Edit Dialog */}
        <Dialog
          open={createDialogOpen || editDialogOpen}
          onClose={() => {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
            resetForm();
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {createDialogOpen ? 'Create Virtual Classroom' : 'Edit Virtual Classroom'}
          </DialogTitle>
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
                
                {!courseId && (
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Course</InputLabel>
                      <Select
                        value={formData.courseId}
                        label="Course"
                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                      >
                        {courses.map((course) => (
                          <MenuItem key={course._id} value={course._id}>
                            {course.title || course.name} ({course.courseCode || course.code})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="Scheduled Time"
                    value={formData.scheduledTime}
                    onChange={(newValue) => setFormData({ ...formData, scheduledTime: newValue })}
                    slotProps={{
                      textField: {
                        fullWidth: true
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duration (minutes)"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    inputProps={{ min: 15, max: 480 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Platform</InputLabel>
                    <Select
                      value={formData.platform}
                      label="Platform"
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    >
                      <MenuItem value="meet">
                        <Box display="flex" alignItems="center" gap={1}>
                          <span>🎥</span>
                          Google Meet
                          <Chip label="Recommended" size="small" color="success" sx={{ ml: 1 }} />
                        </Box>
                      </MenuItem>
                      <MenuItem value="zoom">
                        <Box display="flex" alignItems="center" gap={1}>
                          <span>📹</span>
                          Zoom
                        </Box>
                      </MenuItem>
                      <MenuItem value="teams">
                        <Box display="flex" alignItems="center" gap={1}>
                          <span>💼</span>
                          Microsoft Teams
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                  {formData.platform === 'meet' && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      ✅ Instant setup - No additional configuration required
                    </Typography>
                  )}
                  {formData.platform === 'zoom' && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      ⚙️ Requires Zoom API configuration
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.recordingEnabled}
                        onChange={(e) => setFormData({ ...formData, recordingEnabled: e.target.checked })}
                      />
                    }
                    label="Enable Recording"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Meeting Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings.waitingRoom}
                            onChange={(e) => setFormData({
                              ...formData,
                              settings: { ...formData.settings, waitingRoom: e.target.checked }
                            })}
                          />
                        }
                        label="Waiting Room"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings.muteOnEntry}
                            onChange={(e) => setFormData({
                              ...formData,
                              settings: { ...formData.settings, muteOnEntry: e.target.checked }
                            })}
                          />
                        }
                        label="Mute on Entry"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings.allowScreenShare}
                            onChange={(e) => setFormData({
                              ...formData,
                              settings: { ...formData.settings, allowScreenShare: e.target.checked }
                            })}
                          />
                        }
                        label="Allow Screen Share"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings.allowChat}
                            onChange={(e) => setFormData({
                              ...formData,
                              settings: { ...formData.settings, allowChat: e.target.checked }
                            })}
                          />
                        }
                        label="Allow Chat"
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setCreateDialogOpen(false);
                setEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={createDialogOpen ? handleCreateClassroom : handleUpdateClassroom}
              disabled={!formData.title || (!courseId && !formData.courseId)}
            >
              {createDialogOpen ? 'Create' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default VirtualClassroomManager;