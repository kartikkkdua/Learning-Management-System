import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
  CircularProgress
} from '@mui/material';
import { School, Security } from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../../config/api';
import TwoFactorAuth from './TwoFactorAuth';
import ForgotPassword from './ForgotPassword.js';
import ResetPassword from './ResetPassword';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isRegister, setIsRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student',
    profile: {
      firstName: '',
      lastName: '',
      phone: ''
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState('');

  // Check for reset token and register mode in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const mode = urlParams.get('mode');
    
    if (token) {
      setResetToken(token);
      setShowResetPassword(true);
      // Clear the token from URL for security
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (mode === 'register') {
      setIsRegister(true);
      // Clear the mode from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData);
      
      // Check if 2FA is required
      if (response.data.requires2FA) {
        setTempToken(response.data.tempToken);
        setShowTwoFactor(true);
        setLoading(false);
        return;
      }

      // Normal login without 2FA
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASuccess = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setShowTwoFactor(false);
    onLogin(data.user);
  };

  const handle2FACancel = () => {
    setShowTwoFactor(false);
    setTempToken('');
    setError('');
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
  };

  const handleResetPasswordSuccess = () => {
    setShowResetPassword(false);
    setResetToken('');
  };

  const handleResetPasswordCancel = () => {
    setShowResetPassword(false);
    setResetToken('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/register`, registerData);
      
      // Show success message about 2FA
      if (response.data.message) {
        setRegistrationSuccess(response.data.message);
      }
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <School sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Learning Management System
          </Typography>
          <Typography variant="h6" color="textSecondary">
            {isRegister ? 'Create Account' : 'Sign In'}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!isRegister ? (
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Username or Email"
              margin="normal"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={registerData.username}
              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              required
            />
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="First Name"
                margin="normal"
                value={registerData.profile.firstName}
                onChange={(e) => setRegisterData({
                  ...registerData,
                  profile: { ...registerData.profile, firstName: e.target.value }
                })}
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                margin="normal"
                value={registerData.profile.lastName}
                onChange={(e) => setRegisterData({
                  ...registerData,
                  profile: { ...registerData.profile, lastName: e.target.value }
                })}
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Phone"
              margin="normal"
              value={registerData.profile.phone}
              onChange={(e) => setRegisterData({
                ...registerData,
                profile: { ...registerData.profile, phone: e.target.value }
              })}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={registerData.role}
                label="Role"
                onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="faculty">Faculty</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        )}

        {!isRegister && (
          <Box textAlign="center" sx={{ mt: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={handleForgotPassword}
              sx={{ textDecoration: 'none' }}
            >
              Forgot your password?
            </Link>
          </Box>
        )}

        <Button
          fullWidth
          onClick={() => setIsRegister(!isRegister)}
          sx={{ mt: 2 }}
        >
          {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
        </Button>
      </Paper>

      {/* Two-Factor Authentication Modal */}
      {showTwoFactor && (
        <TwoFactorAuth
          tempToken={tempToken}
          onSuccess={handle2FASuccess}
          onCancel={handle2FACancel}
        />
      )}

      {/* Forgot Password Modal */}
      <ForgotPassword
        open={showForgotPassword}
        onClose={handleCloseForgotPassword}
        onBackToLogin={handleCloseForgotPassword}
      />

      {/* Reset Password Modal */}
      {showResetPassword && (
        <ResetPassword
          token={resetToken}
          onSuccess={handleResetPasswordSuccess}
          onCancel={handleResetPasswordCancel}
        />
      )}
    </Container>
  );
};

export default Login;