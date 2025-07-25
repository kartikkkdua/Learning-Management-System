import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme
} from '@mui/material';
import {
  School,
  People,
  AdminPanelSettings,
  Assignment,
  Grade,
  Analytics,
  Forum,
  VideoCall,
  CloudSync,
  Security,
  PhoneAndroid,
  CheckCircle,
  PlayArrow,
  TrendingUp,
  Notifications,
  Schedule
} from '@mui/icons-material';

const FeaturesPage = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const featureCategories = [
    {
      label: 'For Students',
      icon: <School />,
      features: [
        {
          icon: <Assignment sx={{ fontSize: 40 }} />,
          title: 'Assignment Management',
          description: 'Submit assignments, track deadlines, and receive feedback all in one place.',
          benefits: ['File upload support', 'Deadline reminders', 'Progress tracking', 'Instant feedback']
        },
        {
          icon: <Grade sx={{ fontSize: 40 }} />,
          title: 'Grade Tracking',
          description: 'Monitor your academic progress with detailed grade analytics and reports.',
          benefits: ['Real-time grades', 'Performance analytics', 'Grade history', 'Parent notifications']
        },
        {
          icon: <Forum sx={{ fontSize: 40 }} />,
          title: 'Discussion Forums',
          description: 'Collaborate with classmates and engage in meaningful academic discussions.',
          benefits: ['Course-specific forums', 'Q&A sections', 'Peer collaboration', 'Expert moderation']
        },
        {
          icon: <Schedule sx={{ fontSize: 40 }} />,
          title: 'Smart Calendar',
          description: 'Stay organized with integrated calendar showing classes, assignments, and events.',
          benefits: ['Automatic sync', 'Deadline alerts', 'Event reminders', 'Schedule optimization']
        }
      ]
    },
    {
      label: 'For Faculty',
      icon: <People />,
      features: [
        {
          icon: <Analytics sx={{ fontSize: 40 }} />,
          title: 'Learning Analytics',
          description: 'Gain insights into student performance and engagement with detailed analytics.',
          benefits: ['Performance dashboards', 'Engagement metrics', 'Predictive analytics', 'Custom reports']
        },
        {
          icon: <Assignment sx={{ fontSize: 40 }} />,
          title: 'Advanced Grading',
          description: 'Streamline grading with rubrics, bulk operations, and automated feedback.',
          benefits: ['Rubric-based grading', 'Bulk grading', 'Auto-feedback', 'Grade analytics']
        },
        {
          icon: <VideoCall sx={{ fontSize: 40 }} />,
          title: 'Virtual Classrooms',
          description: 'Conduct live classes with integrated video conferencing and screen sharing.',
          benefits: ['HD video quality', 'Screen sharing', 'Recording capability', 'Interactive tools']
        },
        {
          icon: <CloudSync sx={{ fontSize: 40 }} />,
          title: 'Content Management',
          description: 'Organize and share course materials with cloud-based content management.',
          benefits: ['Cloud storage', 'Version control', 'Easy sharing', 'Mobile access']
        }
      ]
    },
    {
      label: 'For Administrators',
      icon: <AdminPanelSettings />,
      features: [
        {
          icon: <TrendingUp sx={{ fontSize: 40 }} />,
          title: 'Institution Analytics',
          description: 'Comprehensive analytics and reporting for institutional decision making.',
          benefits: ['Enrollment analytics', 'Performance metrics', 'Resource utilization', 'Custom dashboards']
        },
        {
          icon: <Security sx={{ fontSize: 40 }} />,
          title: 'User Management',
          description: 'Manage users, roles, and permissions with enterprise-grade security.',
          benefits: ['Role-based access', 'SSO integration', 'Audit trails', 'Compliance reporting']
        },
        {
          icon: <Notifications sx={{ fontSize: 40 }} />,
          title: 'Communication Hub',
          description: 'Centralized communication system for announcements and notifications.',
          benefits: ['Mass notifications', 'Targeted messaging', 'Email integration', 'SMS alerts']
        },
        {
          icon: <CloudSync sx={{ fontSize: 40 }} />,
          title: 'System Integration',
          description: 'Seamlessly integrate with existing systems and third-party applications.',
          benefits: ['API access', 'LTI compliance', 'SIS integration', 'Custom connectors']
        }
      ]
    }
  ];

  const platformFeatures = [
    {
      icon: <PhoneAndroid sx={{ fontSize: 48 }} />,
      title: 'Mobile Responsive',
      description: 'Access your courses anytime, anywhere with our mobile-optimized platform.',
      color: '#1976d2'
    },
    {
      icon: <Security sx={{ fontSize: 48 }} />,
      title: 'Enterprise Security',
      description: 'Bank-level security with encryption, SSO, and compliance certifications.',
      color: '#2e7d32'
    },
    {
      icon: <CloudSync sx={{ fontSize: 48 }} />,
      title: 'Cloud Infrastructure',
      description: '99.9% uptime with scalable cloud infrastructure and automatic backups.',
      color: '#ed6c02'
    },
    {
      icon: <Analytics sx={{ fontSize: 48 }} />,
      title: 'AI-Powered Insights',
      description: 'Machine learning algorithms provide personalized recommendations and insights.',
      color: '#9c27b0'
    }
  ];

  const integrations = [
    'Google Workspace', 'Microsoft 365', 'Zoom', 'Canvas LTI', 'Blackboard',
    'Moodle', 'Salesforce', 'Slack', 'Teams', 'Dropbox', 'OneDrive', 'AWS'
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 10
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
              Powerful Features
            </Typography>
            <Typography
              variant="h5"
              sx={{
                opacity: 0.9,
                fontWeight: 300,
                maxWidth: 800,
                mx: 'auto',
                mb: 4
              }}
            >
              Discover comprehensive tools designed to enhance learning experiences for students, faculty, and administrators.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: '#f5f5f5'
                }
              }}
            >
              Watch Demo
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Feature Categories */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              centered
              sx={{
                '& .MuiTab-root': {
                  minWidth: 120,
                  fontSize: '1rem',
                  fontWeight: 600
                }
              }}
            >
              {featureCategories.map((category, index) => (
                <Tab
                  key={index}
                  icon={category.icon}
                  label={category.label}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box>
            <Grid container spacing={4}>
              {featureCategories[activeTab].features.map((feature, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card
                    sx={{
                      height: '100%',
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
                          width: 80,
                          height: 80,
                          borderRadius: 2,
                          bgcolor: 'primary.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3
                        }}
                      >
                        <Box sx={{ color: 'primary.contrastText' }}>
                          {feature.icon}
                        </Box>
                      </Box>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {feature.description}
                      </Typography>
                      <List dense>
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <ListItem key={benefitIndex} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={benefit}
                              slotProps={{
                                primary: { variant: 'body2' }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Platform Features */}
      <Box sx={{ py: 8, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Platform Advantages
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Built with modern technology for reliability and performance
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {platformFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: `${feature.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3
                    }}
                  >
                    <Box sx={{ color: feature.color }}>
                      {feature.icon}
                    </Box>
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Integrations */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Seamless Integrations
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Connect with your favorite tools and services
            </Typography>
          </Box>

          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
              {integrations.map((integration, index) => (
                <Chip
                  key={index}
                  label={integration}
                  variant="outlined"
                  sx={{
                    fontSize: '1rem',
                    py: 2,
                    px: 1,
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText'
                    }
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Ready to Experience These Features?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Start your free trial today and discover how our platform can transform your educational experience.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: '#f5f5f5'
                  }
                }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Schedule Demo
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default FeaturesPage;