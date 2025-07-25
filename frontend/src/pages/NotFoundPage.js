import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Home,
  Search,
  School,
  ContactSupport,
  ArrowBack,
  Help,
  Book,
  Dashboard,
  Settings
} from '@mui/icons-material';

const NotFoundPage = () => {
  const quickLinks = [
    {
      title: 'Student Portal',
      description: 'Access your courses and assignments',
      icon: <School />,
      path: '/student',
      color: '#1976d2'
    },
    {
      title: 'Faculty Dashboard',
      description: 'Manage your courses and students',
      icon: <Dashboard />,
      path: '/faculty',
      color: '#2e7d32'
    },
    {
      title: 'Help Center',
      description: 'Find answers to common questions',
      icon: <Help />,
      path: '/help',
      color: '#ed6c02'
    },
    {
      title: 'Documentation',
      description: 'Learn how to use the platform',
      icon: <Book />,
      path: '/docs',
      color: '#9c27b0'
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Search functionality would be implemented here');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Main 404 Content */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={10}
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 4,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {/* 404 Animation/Illustration */}
              <Box
                sx={{
                  position: 'relative',
                  mb: 4
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '8rem', md: '12rem' },
                    fontWeight: 900,
                    color: 'primary.main',
                    opacity: 0.1,
                    lineHeight: 1
                  }}
                >
                  404
                </Typography>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <School sx={{ fontSize: 60, color: 'primary.contrastText' }} />
                </Box>
              </Box>

              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                Page Not Found
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  mb: 4,
                  fontWeight: 300,
                  lineHeight: 1.6
                }}
              >
                Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
              </Typography>

              {/* Search Box */}
              <Paper
                component="form"
                onSubmit={handleSearch}
                elevation={2}
                sx={{
                  p: 2,
                  mb: 4,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 3
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Search for pages, courses, or resources..."
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    )
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ ml: 2, px: 3 }}
                >
                  Search
                </Button>
              </Paper>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Home />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem'
                  }}
                  onClick={() => window.location.href = '/'}
                >
                  Go Home
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ArrowBack />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem'
                  }}
                  onClick={() => window.history.back()}
                >
                  Go Back
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ContactSupport />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem'
                  }}
                >
                  Contact Support
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Quick Links Sidebar */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  textAlign: 'center',
                  mb: 4
                }}
              >
                Quick Links
              </Typography>

              <Grid container spacing={3}>
                {quickLinks.map((link, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card
                      sx={{
                        height: '100%',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          background: 'rgba(255,255,255,0.15)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                        }
                      }}
                      onClick={() => window.location.href = link.path}
                    >
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            bgcolor: `${link.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2
                          }}
                        >
                          <Box sx={{ color: link.color, fontSize: 30 }}>
                            {link.icon}
                          </Box>
                        </Box>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ color: 'white', fontWeight: 600 }}
                        >
                          {link.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        >
                          {link.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Additional Help Section */}
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  mt: 4,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 3,
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                  Still Need Help?
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
                  Our support team is here to help you find what you're looking for.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<ContactSupport />}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Contact Support
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Help />}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Help Center
                  </Button>
                </Box>
              </Paper>

              {/* Common Issues */}
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  mt: 3,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 3
                }}
              >
                <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                  Common Issues
                </Typography>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                    • Check if the URL is spelled correctly
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                    • The page might have been moved or deleted
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                    • You might not have permission to access this page
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    • Try refreshing the page or clearing your browser cache
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default NotFoundPage;