import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  Avatar,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  School,
  CalendarToday,
  Edit,
  Save,
  Cancel
} from '@mui/icons-material';

const StudentProfile = ({ user }) => {
  const [editDialog, setEditDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.profile?.firstName || 'John',
    lastName: user?.profile?.lastName || 'Doe',
    email: user?.email || 'john.doe@student.edu',
    phone: user?.profile?.phone || '+1 (555) 123-4567',
    address: user?.profile?.address || '123 Student St, University City, UC 12345',
    dateOfBirth: user?.profile?.dateOfBirth || '1995-05-15',
    studentId: user?.studentId || 'STU001',
    faculty: 'Computer Science',
    year: 3,
    enrollmentDate: '2022-09-01',
    status: 'Active',
    gpa: 3.7,
    totalCredits: 45
  });

  const handleSave = () => {
    // In real app, save to backend
    console.log('Saving profile data:', profileData);
    setEditDialog(false);
    alert('Profile updated successfully!');
  };

  const ProfileField = ({ icon, label, value, editable = false }) => (
    <ListItem>
      <ListItemIcon>
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={label}
        secondary={value}
      />
    </ListItem>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      
      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '2rem'
              }}
            >
              {profileData.firstName[0]}{profileData.lastName[0]}
            </Avatar>
            
            <Typography variant="h5" gutterBottom>
              {profileData.firstName} {profileData.lastName}
            </Typography>
            
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Student ID: {profileData.studentId}
            </Typography>
            
            <Chip 
              label={profileData.status} 
              color="success" 
              sx={{ mb: 2 }}
            />
            
            <Box>
              <Button 
                variant="outlined" 
                startIcon={<Edit />}
                onClick={() => setEditDialog(true)}
                fullWidth
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ProfileField
                icon={<Person />}
                label="Full Name"
                value={`${profileData.firstName} ${profileData.lastName}`}
              />
              <ProfileField
                icon={<Email />}
                label="Email Address"
                value={profileData.email}
              />
              <ProfileField
                icon={<Phone />}
                label="Phone Number"
                value={profileData.phone}
              />
              <ProfileField
                icon={<LocationOn />}
                label="Address"
                value={profileData.address}
              />
              <ProfileField
                icon={<CalendarToday />}
                label="Date of Birth"
                value={new Date(profileData.dateOfBirth).toLocaleDateString()}
              />
            </List>
          </Paper>
        </Grid>

        {/* Academic Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Academic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ProfileField
                icon={<School />}
                label="Faculty"
                value={profileData.faculty}
              />
              <ProfileField
                icon={<CalendarToday />}
                label="Academic Year"
                value={`Year ${profileData.year}`}
              />
              <ProfileField
                icon={<CalendarToday />}
                label="Enrollment Date"
                value={new Date(profileData.enrollmentDate).toLocaleDateString()}
              />
            </List>
          </Paper>
        </Grid>

        {/* Academic Performance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Academic Performance
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {profileData.gpa}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Current GPA
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center">
                  <Typography variant="h4" color="secondary">
                    {profileData.totalCredits}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Credits
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Emergency Contact */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Emergency Contact
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List>
                  <ProfileField
                    icon={<Person />}
                    label="Contact Name"
                    value="Jane Doe (Mother)"
                  />
                  <ProfileField
                    icon={<Phone />}
                    label="Phone Number"
                    value="+1 (555) 987-6543"
                  />
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List>
                  <ProfileField
                    icon={<Email />}
                    label="Email Address"
                    value="jane.doe@email.com"
                  />
                  <ProfileField
                    icon={<LocationOn />}
                    label="Relationship"
                    value="Parent/Guardian"
                  />
                </List>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={profileData.dateOfBirth}
                onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                margin="normal"
                slotProps={{
                  inputLabel: { shrink: true }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<Save />}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentProfile;