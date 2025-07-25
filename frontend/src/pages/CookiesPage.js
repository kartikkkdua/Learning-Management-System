import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider
} from '@mui/material';

const CookiesPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={2} sx={{ p: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          Cookie Policy
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          Last updated: January 1, 2024
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            What Are Cookies
          </Typography>
          <Typography variant="body1" paragraph>
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            How We Use Cookies
          </Typography>
          <Typography variant="body1" paragraph>
            EduPlatform uses cookies to:
          </Typography>
          <ul>
            <li>Keep you signed in to your account</li>
            <li>Remember your preferences and settings</li>
            <li>Analyze how you use our website</li>
            <li>Improve our services and user experience</li>
          </ul>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Types of Cookies We Use
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Analytics Cookies:</strong> These cookies help us understand how visitors interact with our website.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Functional Cookies:</strong> These cookies enable enhanced functionality and personalization.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Managing Cookies
          </Typography>
          <Typography variant="body1" paragraph>
            You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about our use of cookies, please contact us at support@eduplatform.com.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default CookiesPage;