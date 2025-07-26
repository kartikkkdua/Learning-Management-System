import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const OAuthCallback = () => {
  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');
    const error = urlParams.get('error');

    if (error) {
      // Send error to parent window
      window.opener?.postMessage({
        type: 'SOCIAL_LOGIN_ERROR',
        error: decodeURIComponent(error)
      }, window.location.origin);
    } else if (token && user) {
      // Send success data to parent window
      window.opener?.postMessage({
        type: 'SOCIAL_LOGIN_SUCCESS',
        token,
        user: JSON.parse(decodeURIComponent(user))
      }, window.location.origin);
    } else {
      // Send generic error
      window.opener?.postMessage({
        type: 'SOCIAL_LOGIN_ERROR',
        error: 'Authentication failed'
      }, window.location.origin);
    }

    // Close popup after a short delay
    setTimeout(() => {
      window.close();
    }, 1000);
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress size={40} />
      <Typography variant="body1">
        Completing authentication...
      </Typography>
    </Box>
  );
};

export default OAuthCallback;