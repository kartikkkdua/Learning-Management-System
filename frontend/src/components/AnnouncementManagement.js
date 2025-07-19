import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
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
  Alert,
  IconButton
} from '@mui/material';
import {
  Add,
  Edit,
  Delete
} from '@mui/icons-material';
import axios from 'axios';

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'all',
    course: '',
    faculty: '',
    priority: 'medium',
    expiryDate: ''
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchCourses();
    fetchFaculties();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
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

  const fetchFaculties = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/faculties');
      setFaculties(response.data);
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const announcementData = {
        ...formData,
        author: user.id
      };

      if (editingAnnouncement) {
        await axios.put(`http://localhost:3001/api/announcements/${editingAnnouncement._id}`, announcementData);
      } else {
        await axios.post('http://localhost:3001/api/announcements', announcementData);
      }
      fetchAnnouncements();
      handleClose();
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await axios.delete(`http://localhost:3001/api/announcements/${id}`);
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      targetAudience: announcement.targetAudience,
      course: announcement.course?._id || '',
      faculty: announcement.faculty?._id || '',
      priority: announcement.priority,
      expiryDate: announcement.expiryDate ? announcement.expiryDate.split('T')[0] : ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      targetAudience: 'all',
      course: '',
      faculty: '',
      priority: 'medium',
      expiryDate: ''
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getAudienceColor = (audience) => {
    switch (audience) {
      case 'all': return 'primary';
      case 'students': return 'secondary';
      case 'faculty': return 'success';
      case 'specific_course': return 'info';
      case 'specific_faculty': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Announcements
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Create Announcement
        </Button>
      </Box>

      <Grid container spacing={3}>
        {announcements.map((announcement) => (
          <Grid item xs={12} md={6} lg={4} key={announcement._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {announcement.title}
                  </Typography>
                  <Chip 
                    label={announcement.priority.toUpperCase()} 
                    color={getPriorityColor(announcement.priority)} 
                    size="small" 
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {announcement.content.length > 150 
                    ? `${announcement.content.substring(0, 150)}...` 
                    : announcement.content
                  }
                </Typography>

                <Box display="flex" gap={1} mb={2}>
                  <Chip 
                    label={announcement.targetAudience.replace('_', ' ').toUpperCase()} 
                    color={getAudienceColor(announcement.targetAudience)} 
                    size="small" 
                  />
                  {announcement.course && (
                    <Chip 
                      label={announcement.course.courseCode} 
                      variant="outlined" 
                      size="small" 
                    />
                  )}
                  {announcement.faculty && (
                    <Chip 
                      label={announcement.faculty.code} 
                      variant="outlined" 
                      size="small" 
                    />
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Published: {new Date(announcement.publishDate).toLocaleDateString()}
                </Typography>
                {announcement.expiryDate && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Expires: {new Date(announcement.expiryDate).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions>
                <IconButton onClick={() => handleEdit(announcement)} color="primary">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(announcement._id)} color="error">
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Title"
                fullWidth
                variant="outlined"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Content"
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Target Audience</InputLabel>
                <Select
                  value={formData.targetAudience}
                  label="Target Audience"
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                >
                  <MenuItem value="all">All Users</MenuItem>
                  <MenuItem value="students">Students Only</MenuItem>
                  <MenuItem value="faculty">Faculty Only</MenuItem>
                  <MenuItem value="specific_course">Specific Course</MenuItem>
                  <MenuItem value="specific_faculty">Specific Faculty</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {formData.targetAudience === 'specific_course' && (
              <Grid item xs={12}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Course</InputLabel>
                  <Select
                    value={formData.course}
                    label="Course"
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  >
                    {courses.map((course) => (
                      <MenuItem key={course._id} value={course._id}>
                        {course.courseCode} - {course.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formData.targetAudience === 'specific_faculty' && (
              <Grid item xs={12}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Faculty</InputLabel>
                  <Select
                    value={formData.faculty}
                    label="Faculty"
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  >
                    {faculties.map((faculty) => (
                      <MenuItem key={faculty._id} value={faculty._id}>
                        {faculty.name} ({faculty.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Expiry Date (Optional)"
                type="date"
                fullWidth
                variant="outlined"
                slotProps={{
                  inputLabel: { shrink: true }
                }}
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAnnouncement ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AnnouncementManagement;