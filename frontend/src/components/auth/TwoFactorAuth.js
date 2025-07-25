import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import {
  Security,
  Email,
  Refresh
} from '@mui/icons-material';
import authService from '../../services/authService';

const TwoFactorAuth = ({ tempToken, onSuccess, onBack }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.verify2FA(tempToken, code.trim());
      if (result.success) {
        onSuccess(result);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');

    try {
      await authService.resend2FA(tempToken);
      setResendCooldown(60); // 60 second cooldown
      setError('');
    } catch (error) {
      setError(error.message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only digits, max 6
    setCode(value);
    setError('');
  };

  return (
    <Paper
      elevation={10}
      sx={{
        p: 6,
        maxWidth: 400,
        mx: 'auto',
        borderRadius: 4,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <Box textAlign="center" mb={4}>
        <Security sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Two-Factor Authentication
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We've sent a 6-digit verification code to your email address
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Verification Code"
          value={code}
          onChange={handleCodeChange}
          placeholder="000000"
          inputProps={{
            maxLength: 6,
            style: {
              textAlign: 'center',
              fontSize: '1.5rem',
              letterSpacing: '0.5rem'
            }
          }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              fontSize: '1.5rem'
            }
          }}
          autoFocus
          required
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading || code.length !== 6}
          sx={{
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
            mb: 2
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link
            component="button"
            type="button"
            onClick={onBack}
            sx={{
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main'
              }
            }}
          >
            ← Back to Login
          </Link>

          <Button
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0}
            startIcon={resendLoading ? <CircularProgress size={16} /> : <Refresh />}
            sx={{
              textTransform: 'none',
              color: 'primary.main'
            }}
          >
            {resendCooldown > 0 
              ? `Resend in ${resendCooldown}s` 
              : resendLoading 
                ? 'Sending...' 
                : 'Resend Code'
            }
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Email sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Check your email inbox and spam folder
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          The verification code will expire in 4 minutes
        </Typography>
      </Box>
    </Paper>
  );
};

export default TwoFactorAuth;