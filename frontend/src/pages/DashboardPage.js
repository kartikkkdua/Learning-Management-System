import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip
} from '@mui/material';
import {
  Dashboard,
  Person,
  ExitToApp,
  Settings
} from '@mui/icons-material';
import authService from '../services/authService';

const DashboardPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#9c27b0';
      case 'faculty': return '#2e7d32';
      case 'student': return '#1976d2';
      default: return '#757575';
    }
  };

  const getRoleRedirect = (role) => {
    switch (role) {
      case 'admin': return '/admin';
      case 'faculty': return '/faculty';
      case 'student': return '/student';
      default: return '/dashboard';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                startIcon={<Settings />}
                variant="outlined"
                size="small"
              >
                Settings
              </Button>
              <Button
                startIcon={<ExitToApp />}
                variant="outlined"
                color="error"
                size="small"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <Person sx={{ fontSize: 40 }} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Welcome, {user.profile?.firstName || user.username}!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                {user.email}
              </Typography>
              <Chip
                label={user.role.toUpperCase()}
                sx={{
                  bgcolor: getRoleColor(user.role),
                  color: 'white',
                  fontWeight: 600
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Quick Actions */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Dashboard sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Go to {user.role} Portal
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Access your role-specific dashboard with all the tools you need
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => window.location.href = getRoleRedirect(user.role)}
                >
                  Enter Portal
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Person sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Profile Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Update your personal information and account preferences
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Settings sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Account Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Manage security settings, 2FA, and password changes
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                >
                  Manage Account
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Account Info */}
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Account Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Username
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {user.username}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {user.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Role
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                {user.role}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Two-Factor Authentication
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default DashboardPage;