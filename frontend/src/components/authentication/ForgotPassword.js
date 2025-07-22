import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import { API_URL } from '../../config/api';

const ForgotPassword = ({ open, onClose, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setEmailSent(true);
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setMessage('');
    setEmailSent(false);
    onClose();
  };

  const handleBackToLogin = () => {
    handleClose();
    onBackToLogin();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <Email color="primary" />
          <Typography variant="h5" component="span">
            Reset Password
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {emailSent
            ? 'Check your email for reset instructions'
            : 'Enter your email address to receive a password reset link'
          }
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {!emailSent ? (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              variant="outlined"
              disabled={loading}
              autoFocus
              sx={{ mb: 2 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        ) : (
          <Box textAlign="center" py={2}>
            <Email sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            {message && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              If an account with that email exists, you'll receive a password reset link shortly.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Don't forget to check your spam folder if you don't see the email in your inbox.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, flexDirection: 'column', gap: 1 }}>
        {!emailSent ? (
          <>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || !email}
              startIcon={loading ? <CircularProgress size={20} /> : <Email />}
              onClick={handleSubmit}
              sx={{ py: 1.5 }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <Button
              variant="text"
              size="large"
              fullWidth
              startIcon={<ArrowBack />}
              onClick={handleBackToLogin}
              color="inherit"
            >
              Back to Login
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<ArrowBack />}
            onClick={handleBackToLogin}
            sx={{ py: 1.5 }}
          >
            Back to Login
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPassword;