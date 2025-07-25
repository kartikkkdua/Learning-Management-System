import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  LinearProgress,
  Chip,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Build,
  Schedule,
  Email,
  Twitter,
  Facebook,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';

const MaintenancePage = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 30,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const maintenanceUpdates = [
    {
      time: '10:00 AM',
      status: 'completed',
      message: 'Database optimization completed',
      icon: <CheckCircle sx={{ color: 'success.main' }} />
    },
    {
      time: '10:30 AM',
      status: 'in-progress',
      message: 'Server infrastructure upgrade in progress',
      icon: <Build sx={{ color: 'warning.main' }} />
    },
    {
      time: '11:00 AM',
      status: 'pending',
      message: 'Security patches installation',
      icon: <Schedule sx={{ color: 'info.main' }} />
    },
    {
      time: '11:30 AM',
      status: 'pending',
      message: 'Final system testing and verification',
      icon: <Schedule sx={{ color: 'info.main' }} />
    }
  ];

  const affectedServices = [
    { name: 'Student Portal', status: 'down', impact: 'high' },
    { name: 'Faculty Dashboard', status: 'down', impact: 'high' },
    { name: 'Admin Panel', status: 'limited', impact: 'medium' },
    { name: 'Mobile App', status: 'down', impact: 'high' },
    { name: 'Email Notifications', status: 'operational', impact: 'low' },
    { name: 'Support System', status: 'operational', impact: 'low' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'down': return 'error';
      case 'limited': return 'warning';
      case 'operational': return 'success';
      default: return 'default';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return '#d32f2f';
      case 'medium': return '#ed6c02';
      case 'low': return '#2e7d32';
      default: return '#757575';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={10}
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 4,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 4
                }}
              >
                <Build sx={{ fontSize: 60, color: 'primary.contrastText' }} />
              </Box>

              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                We're Under Maintenance
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  color: 'text.secondary',
                  mb: 4,
                  fontWeight: 300,
                  lineHeight: 1.6
                }}
              >
                We're currently performing scheduled maintenance to improve your experience. 
                We'll be back online shortly!
              </Typography>

              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  mb: 4,
                  background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                  borderRadius: 3
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Estimated Time Remaining
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2 }}>
                  <Box textAlign="center">
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {String(timeLeft.hours).padStart(2, '0')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hours
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Minutes
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Seconds
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={65}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4
                    }
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  65% Complete
                </Typography>
              </Paper>

              <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Get Notified When We're Back
                </Typography>
                <Box component="form" onSubmit={handleSubscribe} sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ px: 3, whiteSpace: 'nowrap' }}
                  >
                    Notify Me
                  </Button>
                </Box>
              </Paper>

              <Box>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 600 }}>
                  Stay Connected
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Twitter />}
                    sx={{ borderRadius: 2 }}
                  >
                    Twitter
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Facebook />}
                    sx={{ borderRadius: 2 }}
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Email />}
                    sx={{ borderRadius: 2 }}
                  >
                    Support
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={10}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info sx={{ color: 'primary.main' }} />
                Maintenance Updates
              </Typography>
              
              <Box>
                {maintenanceUpdates.map((update, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    {update.icon}
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {update.time}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {update.message}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>

            <Paper
              elevation={10}
              sx={{
                p: 3,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning sx={{ color: 'warning.main' }} />
                Service Status
              </Typography>
              
              <Box>
                {affectedServices.map((service, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2">
                      {service.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={service.status}
                        size="small"
                        color={getStatusColor(service.status)}
                        variant="filled"
                      />
                      <Chip
                        label={service.impact}
                        size="small"
                        sx={{
                          bgcolor: `${getImpactColor(service.impact)}20`,
                          color: getImpactColor(service.impact),
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Snackbar
          open={subscribed}
          autoHideDuration={6000}
          onClose={() => setSubscribed(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSubscribed(false)}
            severity="success"
            sx={{ width: '100%' }}
          >
            Thanks! We'll notify you when we're back online.
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default MaintenancePage;