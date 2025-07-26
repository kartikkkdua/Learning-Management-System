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
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Facebook as FacebookIcon,
  Microsoft as MicrosoftIcon,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material';
import { API_URL } from '../../config/api';

const OAuthTest = () => {
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);

  const providers = [
    { name: 'google', label: 'Google', icon: GoogleIcon, color: '#4285f4' },
    { name: 'github', label: 'GitHub', icon: GitHubIcon, color: '#333333' },
    { name: 'facebook', label: 'Facebook', icon: FacebookIcon, color: '#1877f2' },
    { name: 'microsoft', label: 'Microsoft', icon: MicrosoftIcon, color: '#0078d4' }
  ];

  const testProvider = async (provider) => {
    setTesting(true);
    try {
      // Test if the OAuth endpoint is accessible
      const response = await fetch(`${API_URL}/auth/${provider}`, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      setTestResults(prev => ({
        ...prev,
        [provider]: {
          status: 'configured',
          message: 'OAuth endpoint is accessible'
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [provider]: {
          status: 'error',
          message: 'OAuth endpoint not accessible or not configured'
        }
      }));
    }
    setTesting(false);
  };

  const testAllProviders = async () => {
    setTesting(true);
    for (const provider of providers) {
      await testProvider(provider.name);
    }
    setTesting(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'configured':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      default:
        return <Info color="info" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'configured':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          OAuth Configuration Test
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          This tool helps you verify that your OAuth providers are properly configured.
          Make sure you have set up your environment variables in the backend.
        </Alert>

        <Box display="flex" gap={2} mb={3}>
          <Button
            variant="contained"
            onClick={testAllProviders}
            disabled={testing}
          >
            {testing ? 'Testing...' : 'Test All Providers'}
          </Button>
        </Box>

        <List>
          {providers.map((provider) => {
            const IconComponent = provider.icon;
            const result = testResults[provider.name];
            
            return (
              <ListItem key={provider.name} divider>
                <ListItemIcon>
                  <IconComponent sx={{ color: provider.color }} />
                </ListItemIcon>
                <ListItemText
                  primary={provider.label}
                  secondary={result?.message || 'Not tested yet'}
                />
                <Box display="flex" alignItems="center" gap={1}>
                  {result && (
                    <>
                      {getStatusIcon(result.status)}
                      <Chip
                        label={result.status}
                        color={getStatusColor(result.status)}
                        size="small"
                      />
                    </>
                  )}
                  <Button
                    size="small"
                    onClick={() => testProvider(provider.name)}
                    disabled={testing}
                  >
                    Test
                  </Button>
                </Box>
              </ListItem>
            );
          })}
        </List>

        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Setup Instructions
          </Typography>
          <Typography variant="body2" paragraph>
            1. Make sure you have installed the required packages:
            <br />
            <code>npm install passport passport-google-oauth20 passport-github2 passport-facebook passport-microsoft express-session</code>
          </Typography>
          <Typography variant="body2" paragraph>
            2. Set up your OAuth applications with each provider and add the credentials to your <code>.env</code> file.
          </Typography>
          <Typography variant="body2" paragraph>
            3. Restart your backend server after adding environment variables.
          </Typography>
          <Typography variant="body2">
            4. Check the <code>OAUTH_SETUP.md</code> file for detailed setup instructions.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default OAuthTest;