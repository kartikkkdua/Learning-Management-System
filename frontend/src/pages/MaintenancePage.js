// src/components/MaintenancePage.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Paper,
  Stack,
  Button,
  IconButton,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const MaintenancePage = () => {
  const [timeLeft, setTimeLeft] = useState('');

  
  const estimatedReturn = new Date();
  estimatedReturn.setHours(estimatedReturn.getHours() + 50);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = estimatedReturn - now;

      if (difference <= 0) {
        setTimeLeft('We’re back online!');
        clearInterval(timer);
      } else {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #141E30, #243B55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <Stack spacing={3} alignItems="center">
            <BuildIcon sx={{ fontSize: 60, color: '#f39c12' }} />

            <Typography variant="h4" fontWeight="bold">
              We'll Be Right Back!
            </Typography>

            <Typography variant="body1" color="text.secondary">
              We’re currently performing scheduled maintenance to improve your experience. Thank you for your patience!
            </Typography>

            <CircularProgress size={32} thickness={4} sx={{ color: '#f39c12' }} />

            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Estimated time left: <strong>{timeLeft}</strong>
              </Typography>
            </Stack>

            {/* <Button
              variant="contained"
              startIcon={<EmailIcon />}
              href="mailto:support@example.com"
              sx={{
                mt: 2,
                backgroundColor: '#f39c12',
                '&:hover': { backgroundColor: '#e67e22' },
              }}
            >
              Contact Support
            </Button> */}

            {/* <Stack direction="row" spacing={2} mt={3}>
              <IconButton href="https://facebook.com" target="_blank">
                <FacebookIcon sx={{ color: '#3b5998' }} />
              </IconButton>
              <IconButton href="https://twitter.com" target="_blank">
                <TwitterIcon sx={{ color: '#1da1f2' }} />
              </IconButton>
              <IconButton href="https://linkedin.com" target="_blank">
                <LinkedInIcon sx={{ color: '#0077b5' }} />
              </IconButton>
            </Stack> */}

            <Typography variant="caption" color="text.secondary" sx={{ mt: 4 }}>
              &copy; {new Date().getFullYear()} Learning Management System. All rights reserved.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default MaintenancePage;
