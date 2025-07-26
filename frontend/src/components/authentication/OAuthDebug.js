import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { API_URL } from '../../config/api';

const OAuthDebug = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDirectRedirect = () => {
    addLog('Testing direct redirect to Google OAuth...');
    const backendUrl = API_URL.replace('/api', '');
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const testPopupFlow = () => {
    addLog('Testing popup OAuth flow...');
    setError('');

    try {
      const backendUrl = API_URL.replace('/api', '');
      const popup = window.open(
        `${backendUrl}/api/auth/google`,
        'google_login',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      addLog('Popup opened successfully');

      // Listen for messages from popup
      const messageListener = (event) => {
        addLog(`Received message: ${JSON.stringify(event.data)}`);
        
        if (event.origin !== window.location.origin) {
          addLog(`Origin mismatch: ${event.origin} vs ${window.location.origin}`);
          return;
        }

        if (event.data.type === 'SOCIAL_LOGIN_SUCCESS') {
          addLog('OAuth success received!');
          popup.close();
          window.removeEventListener('message', messageListener);
        } else if (event.data.type === 'SOCIAL_LOGIN_ERROR') {
          addLog(`OAuth error: ${event.data.error}`);
          setError(event.data.error);
          popup.close();
          window.removeEventListener('message', messageListener);
        }
      };

      window.addEventListener('message', messageListener);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          addLog('Popup was closed manually');
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
        }
      }, 1000);

    } catch (error) {
      addLog(`Error opening popup: ${error.message}`);
      setError(error.message);
    }
  };

  const testAPIEndpoint = async () => {
    addLog('Testing API endpoint accessibility...');
    try {
      const response = await fetch(`${API_URL}/auth/debug`);
      const data = await response.json();
      addLog(`API Response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      addLog(`API Error: ${error.message}`);
      setError(error.message);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setError('');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          OAuth Debug Tool
        </Typography>
        
        <Typography variant="body1" paragraph>
          This tool helps debug OAuth authentication issues.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={testDirectRedirect}
          >
            Test Direct Redirect
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={testPopupFlow}
          >
            Test Popup Flow
          </Button>
          
          <Button
            variant="outlined"
            onClick={testAPIEndpoint}
          >
            Test API Endpoint
          </Button>
          
          <Button
            variant="text"
            onClick={clearLogs}
          >
            Clear Logs
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="h6" gutterBottom>
          Debug Logs
        </Typography>
        
        <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto', p: 2 }}>
          {logs.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No logs yet. Click a test button to start debugging.
            </Typography>
          ) : (
            <List dense>
              {logs.map((log, index) => (
                <ListItem key={index} divider>
                  <ListItemText 
                    primary={log}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      fontFamily: 'monospace'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Configuration Info
          </Typography>
          <Typography variant="body2" component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            {`API_URL: ${API_URL}
Frontend URL: ${window.location.origin}
Current Path: ${window.location.pathname}`}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default OAuthDebug;