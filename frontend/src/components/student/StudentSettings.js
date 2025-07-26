import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  Switch,
  FormControlLabel,
  FormGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  Notifications,
  Palette,
  Security,
  Accessibility,
  School,
  Save,
  RestoreFromTrash,
  Email,
  Sms,
  PhoneAndroid,
} from '@mui/icons-material';
import axios from 'axios';

const StudentSettings = ({ user }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [preferences, setPreferences] = useState({
    notifications: {
      email: {
        enabled: true,
        frequency: 'immediate',
        types: {
          assignment_due: true,
          grade_posted: true,
          enrollment_confirmation: true,
          course_update: true,
          registration_reminder: true,
          announcement: true
        }
      },
      push: {
        enabled: true,
        types: {
          assignment_due: true,
          grade_posted: true,
          enrollment_confirmation: true,
          course_update: false,
          registration_reminder: true,
          announcement: false
        }
      },
      sms: {
        enabled: false,
        phoneNumber: '',
        types: {
          assignment_due: false,
          grade_posted: false,
          enrollment_confirmation: false,
          course_update: false,
          registration_reminder: true,
          announcement: false
        }
      }
    },
    dashboard: {
      layout: 'default',
      widgets: {
        upcomingAssignments: true,
        recentGrades: true,
        courseSchedule: true,
        announcements: true,
        academicProgress: true,
        calendarEvents: true
      },
      defaultTab: 'dashboard'
    },
    appearance: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    },
    privacy: {
      profileVisibility: 'course_members',
      showOnlineStatus: true,
      allowDirectMessages: true,
      shareAcademicProgress: false
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: false,
      reducedMotion: false
    },
    academic: {
      defaultSemesterView: 'current',
      gradeDisplayFormat: 'both',
      showGPA: true,
      autoEnrollWaitlist: false
    }
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const userId = user.id || user._id;
      const response = await axios.get(`http://localhost:3001/api/preferences/${userId}`);
      if (response.data) {
        setPreferences({ ...preferences, ...response.data });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      // Use default preferences if none exist
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      const userId = user.id || user._id;
      await axios.put(`http://localhost:3001/api/preferences/${userId}`, preferences);
      setHasChanges(false);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default preferences
      setPreferences({
        notifications: {
          email: {
            enabled: true,
            frequency: 'immediate',
            types: {
              assignment_due: true,
              grade_posted: true,
              enrollment_confirmation: true,
              course_update: true,
              registration_reminder: true,
              announcement: true
            }
          },
          push: {
            enabled: true,
            types: {
              assignment_due: true,
              grade_posted: true,
              enrollment_confirmation: true,
              course_update: false,
              registration_reminder: true,
              announcement: false
            }
          },
          sms: {
            enabled: false,
            phoneNumber: '',
            types: {
              assignment_due: false,
              grade_posted: false,
              enrollment_confirmation: false,
              course_update: false,
              registration_reminder: true,
              announcement: false
            }
          }
        },
        dashboard: {
          layout: 'default',
          widgets: {
            upcomingAssignments: true,
            recentGrades: true,
            courseSchedule: true,
            announcements: true,
            academicProgress: true,
            calendarEvents: true
          },
          defaultTab: 'dashboard'
        },
        appearance: {
          theme: 'light',
          language: 'en',
          timezone: 'America/New_York',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h'
        },
        privacy: {
          profileVisibility: 'course_members',
          showOnlineStatus: true,
          allowDirectMessages: true,
          shareAcademicProgress: false
        },
        accessibility: {
          highContrast: false,
          largeText: false,
          screenReader: false,
          keyboardNavigation: false,
          reducedMotion: false
        },
        academic: {
          defaultSemesterView: 'current',
          gradeDisplayFormat: 'both',
          showGPA: true,
          autoEnrollWaitlist: false
        }
      });
      setHasChanges(true);
    }
  };

  const updatePreference = (path, value) => {
    const keys = path.split('.');
    const newPreferences = { ...preferences };
    let current = newPreferences;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setPreferences(newPreferences);
    setHasChanges(true);
  };

  const NotificationSettings = () => (
    <Grid container spacing={3}>
      {/* Email Notifications */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Email sx={{ mr: 1 }} />
              <Typography variant="h6">Email Notifications</Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.notifications.email.enabled}
                  onChange={(e) => updatePreference('notifications.email.enabled', e.target.checked)}
                />
              }
              label="Enable Email Notifications"
            />
            
            {preferences.notifications.email.enabled && (
              <Box mt={2}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Email Frequency</InputLabel>
                  <Select
                    value={preferences.notifications.email.frequency}
                    label="Email Frequency"
                    onChange={(e) => updatePreference('notifications.email.frequency', e.target.value)}
                  >
                    <MenuItem value="immediate">Immediate</MenuItem>
                    <MenuItem value="daily">Daily Digest</MenuItem>
                    <MenuItem value="weekly">Weekly Summary</MenuItem>
                  </Select>
                </FormControl>
                
                <Typography variant="subtitle2" gutterBottom>Email Types:</Typography>
                <FormGroup>
                  {Object.entries(preferences.notifications.email.types).map(([type, enabled]) => (
                    <FormControlLabel
                      key={type}
                      control={
                        <Switch
                          size="small"
                          checked={enabled}
                          onChange={(e) => updatePreference(`notifications.email.types.${type}`, e.target.checked)}
                        />
                      }
                      label={type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Push Notifications */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <PhoneAndroid sx={{ mr: 1 }} />
              <Typography variant="h6">Push Notifications</Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.notifications.push.enabled}
                  onChange={(e) => updatePreference('notifications.push.enabled', e.target.checked)}
                />
              }
              label="Enable Push Notifications"
            />
            
            {preferences.notifications.push.enabled && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>Push Types:</Typography>
                <FormGroup>
                  {Object.entries(preferences.notifications.push.types).map(([type, enabled]) => (
                    <FormControlLabel
                      key={type}
                      control={
                        <Switch
                          size="small"
                          checked={enabled}
                          onChange={(e) => updatePreference(`notifications.push.types.${type}`, e.target.checked)}
                        />
                      }
                      label={type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* SMS Notifications */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Sms sx={{ mr: 1 }} />
              <Typography variant="h6">SMS Notifications</Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.notifications.sms.enabled}
                  onChange={(e) => updatePreference('notifications.sms.enabled', e.target.checked)}
                />
              }
              label="Enable SMS Notifications"
            />
            
            {preferences.notifications.sms.enabled && (
              <Box mt={2}>
                <TextField
                  label="Phone Number"
                  value={preferences.notifications.sms.phoneNumber}
                  onChange={(e) => updatePreference('notifications.sms.phoneNumber', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  size="small"
                  sx={{ mb: 2, mr: 2 }}
                />
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  SMS notifications are limited to critical alerts only to avoid charges.
                </Alert>
                
                <Typography variant="subtitle2" gutterBottom>SMS Types:</Typography>
                <FormGroup row>
                  {Object.entries(preferences.notifications.sms.types).map(([type, enabled]) => (
                    <FormControlLabel
                      key={type}
                      control={
                        <Switch
                          size="small"
                          checked={enabled}
                          onChange={(e) => updatePreference(`notifications.sms.types.${type}`, e.target.checked)}
                        />
                      }
                      label={type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const AppearanceSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Theme & Display</Typography>
            
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Theme</InputLabel>
              <Select
                value={preferences.appearance.theme}
                label="Theme"
                onChange={(e) => updatePreference('appearance.theme', e.target.value)}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="auto">Auto (System)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={preferences.appearance.language}
                label="Language"
                onChange={(e) => updatePreference('appearance.language', e.target.value)}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Español</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="de">Deutsch</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small">
              <InputLabel>Timezone</InputLabel>
              <Select
                value={preferences.appearance.timezone}
                label="Timezone"
                onChange={(e) => updatePreference('appearance.timezone', e.target.value)}
              >
                <MenuItem value="America/New_York">Eastern Time</MenuItem>
                <MenuItem value="America/Chicago">Central Time</MenuItem>
                <MenuItem value="America/Denver">Mountain Time</MenuItem>
                <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Date & Time Format</Typography>
            
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Date Format</InputLabel>
              <Select
                value={preferences.appearance.dateFormat}
                label="Date Format"
                onChange={(e) => updatePreference('appearance.dateFormat', e.target.value)}
              >
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (US)</MenuItem>
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (EU)</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small">
              <InputLabel>Time Format</InputLabel>
              <Select
                value={preferences.appearance.timeFormat}
                label="Time Format"
                onChange={(e) => updatePreference('appearance.timeFormat', e.target.value)}
              >
                <MenuItem value="12h">12 Hour (AM/PM)</MenuItem>
                <MenuItem value="24h">24 Hour</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const AcademicSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Academic Display</Typography>
            
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Default Semester View</InputLabel>
              <Select
                value={preferences.academic.defaultSemesterView}
                label="Default Semester View"
                onChange={(e) => updatePreference('academic.defaultSemesterView', e.target.value)}
              >
                <MenuItem value="current">Current Semester Only</MenuItem>
                <MenuItem value="all">All Semesters</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Grade Display Format</InputLabel>
              <Select
                value={preferences.academic.gradeDisplayFormat}
                label="Grade Display Format"
                onChange={(e) => updatePreference('academic.gradeDisplayFormat', e.target.value)}
              >
                <MenuItem value="percentage">Percentage Only</MenuItem>
                <MenuItem value="letter">Letter Grade Only</MenuItem>
                <MenuItem value="both">Both Percentage & Letter</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.academic.showGPA}
                  onChange={(e) => updatePreference('academic.showGPA', e.target.checked)}
                />
              }
              label="Show GPA on Dashboard"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.academic.autoEnrollWaitlist}
                  onChange={(e) => updatePreference('academic.autoEnrollWaitlist', e.target.checked)}
                />
              }
              label="Auto-enroll when waitlist spot opens"
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Settings & Preferences
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RestoreFromTrash />}
            onClick={resetToDefaults}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={savePreferences}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      {hasChanges && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have unsaved changes. Don't forget to save your preferences!
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={selectedTab} 
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{ px: 2 }}
        >
          <Tab icon={<Notifications />} label="Notifications" />
          <Tab icon={<Palette />} label="Appearance" />
          <Tab icon={<School />} label="Academic" />
          <Tab icon={<Security />} label="Privacy" />
          <Tab icon={<Accessibility />} label="Accessibility" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {selectedTab === 0 && <NotificationSettings />}
        {selectedTab === 1 && <AppearanceSettings />}
        {selectedTab === 2 && <AcademicSettings />}
        {selectedTab === 3 && (
          <Typography variant="h6" color="textSecondary" textAlign="center" py={4}>
            Privacy settings coming soon...
          </Typography>
        )}
        {selectedTab === 4 && (
          <Typography variant="h6" color="textSecondary" textAlign="center" py={4}>
            Accessibility settings coming soon...
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default StudentSettings;