import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Facebook as FacebookIcon,
  Microsoft as MicrosoftIcon
} from '@mui/icons-material';
import { API_URL } from '../../config/api';

const SocialLogin = ({ onLogin, onError }) => {
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');

  const handleSocialLogin = async (provider) => {
    setLoading(prev => ({ ...prev, [provider]: true }));
    setError('');

    try {
      // Open popup window for OAuth
      const backendUrl = API_URL.replace('/api', '');
      const popup = window.open(
        `${backendUrl}/api/auth/${provider}`,
        `${provider}_login`,
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for messages from popup
      const messageListener = (event) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'SOCIAL_LOGIN_SUCCESS') {
          popup.close();
          localStorage.setItem('token', event.data.token);
          localStorage.setItem('user', JSON.stringify(event.data.user));
          onLogin(event.data.user);
          window.removeEventListener('message', messageListener);
        } else if (event.data.type === 'SOCIAL_LOGIN_ERROR') {
          popup.close();
          setError(event.data.error || `${provider} login failed`);
          onError && onError(event.data.error);
          window.removeEventListener('message', messageListener);
        }
      };

      window.addEventListener('message', messageListener);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          setLoading(prev => ({ ...prev, [provider]: false }));
        }
      }, 1000);

    } catch (error) {
      console.error(`${provider} login error:`, error);
      setError(`${provider} login failed`);
      onError && onError(error.message);
    } finally {
      setLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  const socialProviders = [
    {
      name: 'google',
      label: 'Continue with Google',
      icon: GoogleIcon,
      color: '#4285f4',
      bgColor: '#ffffff',
      textColor: '#757575'
    },
    {
      name: 'github',
      label: 'Continue with GitHub',
      icon: GitHubIcon,
      color: '#333333',
      bgColor: '#333333',
      textColor: '#ffffff'
    },
    {
      name: 'facebook',
      label: 'Continue with Facebook',
      icon: FacebookIcon,
      color: '#1877f2',
      bgColor: '#1877f2',
      textColor: '#ffffff'
    },
    {
      name: 'microsoft',
      label: 'Continue with Microsoft',
      icon: MicrosoftIcon,
      color: '#0078d4',
      bgColor: '#0078d4',
      textColor: '#ffffff'
    }
  ];

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Divider sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Or continue with
          </Typography>
        </Divider>

        <Box display="flex" flexDirection="column" gap={1.5}>
          {socialProviders.map((provider) => {
            const IconComponent = provider.icon;
            return (
              <Button
                key={provider.name}
                fullWidth
                variant="outlined"
                onClick={() => handleSocialLogin(provider.name)}
                disabled={loading[provider.name]}
                startIcon={
                  loading[provider.name] ? (
                    <CircularProgress size={20} />
                  ) : (
                    <IconComponent />
                  )
                }
                sx={{
                  py: 1.5,
                  borderColor: provider.color,
                  color: provider.textColor,
                  backgroundColor: provider.bgColor,
                  '&:hover': {
                    backgroundColor: provider.bgColor,
                    opacity: 0.9,
                    borderColor: provider.color
                  },
                  '&.Mui-disabled': {
                    backgroundColor: provider.bgColor,
                    opacity: 0.6
                  }
                }}
              >
                {loading[provider.name] ? 'Connecting...' : provider.label}
              </Button>
            );
          })}
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Or use email
        </Typography>
      </Divider>
    </Box>
  );
};

export default SocialLogin;