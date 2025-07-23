import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Paper
} from '@mui/material';
import { Security, Refresh, Cancel } from '@mui/icons-material';
import { API_URL } from '../../config/api';

const TwoFactorAuth = ({ tempToken, onSuccess, onCancel }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(240); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tempToken,
          code
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(data);
      } else {
        const errorMessage = data.message || 'Invalid verification code';
        const isPendingApproval = data.pendingApproval;
        
        if (isPendingApproval) {
          setError(`${errorMessage} Your account will be activated once an administrator approves your faculty application.`);
        } else {
          setError(errorMessage);
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/resend-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tempToken }),
      });

      const data = await response.json();

      if (data.success) {
        setTimeLeft(240); // Reset timer
        setCanResend(false);
        setCode('');
        setError('');
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    setError('');
  };

  return (
    <Dialog
      open={true}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <Security color="primary" />
          <Typography variant="h5" component="span">
            Two-Factor Authentication
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Enter the 6-digit code sent to your email
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Box display="flex" justifyContent="center" mb={3}>
            <TextField
              value={code}
              onChange={handleCodeChange}
              placeholder="000000"
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: 'center',
                  fontSize: '24px',
                  letterSpacing: '8px',
                  fontWeight: 'bold'
                }
              }}
              sx={{
                width: '200px',
                '& .MuiOutlinedInput-root': {
                  height: '60px'
                }
              }}
              autoComplete="one-time-code"
              disabled={loading}
              variant="outlined"
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Paper
            elevation={0}
            sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: timeLeft === 0 ? 'error.light' : 'grey.50',
              mb: 2
            }}
          >
            <Typography
              variant="body2"
              color={timeLeft === 0 ? 'error.main' : 'text.secondary'}
              fontWeight={timeLeft === 0 ? 'bold' : 'normal'}
            >
              {timeLeft > 0
                ? `Code expires in: ${formatTime(timeLeft)}`
                : 'Code has expired'
              }
            </Typography>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, flexDirection: 'column', gap: 1 }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading || code.length !== 6 || timeLeft === 0}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          onClick={handleSubmit}
          sx={{ py: 1.5 }}
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </Button>

        <Button
          variant="outlined"
          size="large"
          fullWidth
          disabled={loading || (!canResend && timeLeft > 0)}
          startIcon={<Refresh />}
          onClick={handleResend}
          sx={{ py: 1.5 }}
        >
          {loading ? 'Sending...' : 'Resend Code'}
        </Button>

        <Button
          variant="text"
          size="large"
          fullWidth
          disabled={loading}
          startIcon={<Cancel />}
          onClick={onCancel}
          color="inherit"
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TwoFactorAuth;