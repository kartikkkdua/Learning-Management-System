import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Paper,
  Avatar,
  Chip,
  Alert,
  Snackbar,
  useTheme
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  AccessTime,
  Send,
  Support,
  Business,
  School,
  CheckCircle
} from '@mui/icons-material';

const ContactPage = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
    }, 2000);
  };

  const contactInfo = [
    {
      icon: <Email sx={{ fontSize: 28 }} />,
      title: 'Email Us',
      details: 'support@eduplatform.com',
      subtitle: 'We typically respond within 24 hours',
      color: '#1976d2'
    },
    {
      icon: <Phone sx={{ fontSize: 28 }} />,
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      subtitle: 'Mon-Fri, 9AM-6PM EST',
      color: '#2e7d32'
    },
    {
      icon: <LocationOn sx={{ fontSize: 28 }} />,
      title: 'Visit Us',
      details: '123 Education Street',
      subtitle: 'New York, NY 10001',
      color: '#ed6c02'
    },
    {
      icon: <AccessTime sx={{ fontSize: 28 }} />,
      title: 'Business Hours',
      details: 'Monday - Friday',
      subtitle: '9:00 AM - 6:00 PM EST',
      color: '#9c27b0'
    }
  ];

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry', icon: <Support /> },
    { value: 'sales', label: 'Sales & Pricing', icon: <Business /> },
    { value: 'support', label: 'Technical Support', icon: <School /> },
    { value: 'partnership', label: 'Partnership', icon: <CheckCircle /> }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Customer Success Manager',
      avatar: '/api/placeholder/80/80',
      email: 'sarah@eduplatform.com'
    },
    {
      name: 'Michael Chen',
      role: 'Technical Support Lead',
      avatar: '/api/placeholder/80/80',
      email: 'michael@eduplatform.com'
    },
    {
      name: 'Emily Davis',
      role: 'Sales Director',
      avatar: '/api/placeholder/80/80',
      email: 'emily@eduplatform.com'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          position: 'relative'
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Get in Touch
            </Typography>
            <Typography
              variant="h5"
              sx={{
                opacity: 0.9,
                fontWeight: 300,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Contact Info Cards */}
      <Box sx={{ py: 8, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {contactInfo.map((info, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: `${info.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <Box sx={{ color: info.color }}>
                        {info.icon}
                      </Box>
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {info.title}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                      {info.details}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {info.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact Form & Team */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {/* Contact Form */}
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Send us a Message
                </Typography>

                {/* Inquiry Type Selection */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                    What can we help you with?
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {inquiryTypes.map((type) => (
                      <Chip
                        key={type.value}
                        icon={type.icon}
                        label={type.label}
                        clickable
                        color={formData.inquiryType === type.value ? 'primary' : 'default'}
                        variant={formData.inquiryType === type.value ? 'filled' : 'outlined'}
                        onClick={() => setFormData({ ...formData, inquiryType: type.value })}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Box>
                </Box>

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Message"
                        name="message"
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        endIcon={<Send />}
                        disabled={loading}
                        sx={{
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)'
                          }
                        }}
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>

            {/* Team Section */}
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Meet Our Team
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {team.map((member, index) => (
                    <Card key={index} sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          src={member.avatar}
                          sx={{ width: 60, height: 60, mr: 2 }}
                        >
                          {member.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {member.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.role}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Email />}
                        href={`mailto:${member.email}`}
                        sx={{ borderRadius: 2 }}
                      >
                        {member.email}
                      </Button>
                    </Card>
                  ))}
                </Box>

                {/* FAQ Link */}
                <Paper
                  sx={{
                    p: 3,
                    mt: 4,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Need Quick Answers?
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Check out our FAQ section for instant answers to common questions.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ bgcolor: 'white', color: 'primary.main' }}
                  >
                    View FAQ
                  </Button>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Thank you for your message! We'll get back to you soon.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactPage;