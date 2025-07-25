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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Chip,
  InputAdornment,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Rating,
  Divider
} from '@mui/material';
import {
  Search,
  ExpandMore,
  Help,
  ContactSupport,
  Book,
  VideoLibrary,
  Forum,
  Email,
  Phone,
  Chat,
  School,
  Person,
  AdminPanelSettings,
  CheckCircle,
  PlayArrow,
  Download,
  Star
} from '@mui/icons-material';

const HelpPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFaqChange = (panel) => (event, isExpanded) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  const supportCategories = [
    {
      title: 'Getting Started',
      icon: <School sx={{ fontSize: 40 }} />,
      description: 'Learn the basics of using EduPlatform',
      color: '#1976d2',
      articles: 12
    },
    {
      title: 'Account Management',
      icon: <Person sx={{ fontSize: 40 }} />,
      description: 'Manage your profile and account settings',
      color: '#2e7d32',
      articles: 8
    },
    {
      title: 'Course Management',
      icon: <Book sx={{ fontSize: 40 }} />,
      description: 'Create and manage your courses',
      color: '#ed6c02',
      articles: 15
    },
    {
      title: 'Technical Support',
      icon: <AdminPanelSettings sx={{ fontSize: 40 }} />,
      description: 'Troubleshoot technical issues',
      color: '#9c27b0',
      articles: 10
    }
  ];

  const faqs = [
    {
      category: 'general',
      question: 'How do I create an account?',
      answer: 'To create an account, click on the "Sign Up" button on the homepage, choose your account type (Student, Faculty, or Administrator), and follow the step-by-step registration process. You\'ll need to provide your email, personal information, and institution details.'
    },
    {
      category: 'general',
      question: 'What are the system requirements?',
      answer: 'EduPlatform works on any modern web browser including Chrome, Firefox, Safari, and Edge. For mobile devices, we support iOS 12+ and Android 8+. A stable internet connection is required for optimal performance.'
    },
    {
      category: 'courses',
      question: 'How do I enroll in a course?',
      answer: 'Students can enroll in courses by browsing the course catalog, clicking on the desired course, and clicking the "Enroll" button. Some courses may require instructor approval or have prerequisites that must be met first.'
    },
    {
      category: 'courses',
      question: 'Can I create my own course?',
      answer: 'Faculty members and administrators can create courses by going to their dashboard and clicking "Create New Course". You\'ll be guided through setting up course details, adding content, and configuring enrollment settings.'
    },
    {
      category: 'technical',
      question: 'Why can\'t I access my course?',
      answer: 'If you can\'t access your course, check if: 1) You\'re logged in with the correct account, 2) The course is still active, 3) You have a stable internet connection, 4) Your browser is up to date. If issues persist, contact technical support.'
    },
    {
      category: 'technical',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email. If you don\'t receive the email, check your spam folder or contact support.'
    },
    {
      category: 'billing',
      question: 'How does billing work?',
      answer: 'Billing is handled on an institutional level. Individual users don\'t need to worry about payments - your institution manages the subscription. For billing questions, contact your institution\'s administrator or our sales team.'
    },
    {
      category: 'billing',
      question: 'Can I get a refund?',
      answer: 'Refund policies vary by institution and subscription type. Please contact your institution\'s administrator or our support team for specific refund inquiries.'
    }
  ];

  const videoTutorials = [
    {
      title: 'Getting Started with EduPlatform',
      duration: '5:30',
      views: '12.5K',
      thumbnail: '/api/placeholder/300/200',
      description: 'Learn the basics of navigating the platform'
    },
    {
      title: 'Creating Your First Course',
      duration: '8:45',
      views: '8.2K',
      thumbnail: '/api/placeholder/300/200',
      description: 'Step-by-step guide to course creation'
    },
    {
      title: 'Managing Student Assignments',
      duration: '6:15',
      views: '6.8K',
      thumbnail: '/api/placeholder/300/200',
      description: 'How to create and grade assignments'
    },
    {
      title: 'Using the Grade Book',
      duration: '4:20',
      views: '9.1K',
      thumbnail: '/api/placeholder/300/200',
      description: 'Track and manage student grades'
    }
  ];

  const contactOptions = [
    {
      method: 'Live Chat',
      icon: <Chat sx={{ fontSize: 30 }} />,
      description: 'Get instant help from our support team',
      availability: 'Available 24/7',
      color: '#1976d2',
      action: 'Start Chat'
    },
    {
      method: 'Email Support',
      icon: <Email sx={{ fontSize: 30 }} />,
      description: 'Send us a detailed message',
      availability: 'Response within 24 hours',
      color: '#2e7d32',
      action: 'Send Email'
    },
    {
      method: 'Phone Support',
      icon: <Phone sx={{ fontSize: 30 }} />,
      description: 'Speak directly with our team',
      availability: 'Mon-Fri, 9AM-6PM EST',
      color: '#ed6c02',
      action: 'Call Now'
    },
    {
      method: 'Community Forum',
      icon: <Forum sx={{ fontSize: 30 }} />,
      description: 'Connect with other users',
      availability: 'Always active',
      color: '#9c27b0',
      action: 'Visit Forum'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Professor, Stanford University',
      avatar: '/api/placeholder/60/60',
      rating: 5,
      comment: 'The support team is incredibly responsive and helpful. They resolved my technical issue within minutes!'
    },
    {
      name: 'Michael Chen',
      role: 'IT Administrator, MIT',
      avatar: '/api/placeholder/60/60',
      rating: 5,
      comment: 'Excellent documentation and video tutorials. Made our platform adoption seamless.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Student, Harvard University',
      avatar: '/api/placeholder/60/60',
      rating: 4,
      comment: 'The help center has everything I need. Very well organized and easy to navigate.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // FAQ
        return (
          <Box>
            <TextField
              fullWidth
              placeholder="Search frequently asked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 4 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
            
            <Box>
              {filteredFaqs.map((faq, index) => (
                <Accordion
                  key={index}
                  expanded={expandedFaq === `panel${index}`}
                  onChange={handleFaqChange(`panel${index}`)}
                  sx={{ mb: 1 }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={faq.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {faq.question}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Box>
        );

      case 1: // Video Tutorials
        return (
          <Grid container spacing={3}>
            {videoTutorials.map((video, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%' }}>
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={video.thumbnail}
                      alt={video.title}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover'
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        bgcolor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.8)'
                        }
                      }}
                    >
                      <PlayArrow sx={{ color: 'white', fontSize: 30 }} />
                    </Box>
                    <Chip
                      label={video.duration}
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white'
                      }}
                    />
                  </Box>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {video.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {video.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {video.views} views
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 2: // Contact Support
        return (
          <Grid container spacing={4}>
            {contactOptions.map((option, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 8
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: `${option.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3
                      }}
                    >
                      <Box sx={{ color: option.color }}>
                        {option.icon}
                      </Box>
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      {option.method}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {option.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {option.availability}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: option.color,
                        '&:hover': {
                          bgcolor: `${option.color}dd`
                        }
                      }}
                    >
                      {option.action}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      default:
        return null;
    }
  };

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
            <Help sx={{ fontSize: 80, mb: 2 }} />
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Help Center
            </Typography>
            <Typography
              variant="h5"
              sx={{
                opacity: 0.9,
                fontWeight: 300,
                maxWidth: 600,
                mx: 'auto',
                mb: 4
              }}
            >
              Find answers, get support, and learn how to make the most of EduPlatform
            </Typography>
            
            <Paper
              elevation={0}
              sx={{
                p: 2,
                maxWidth: 600,
                mx: 'auto',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 3
              }}
            >
              <TextField
                fullWidth
                placeholder="Search for help articles, tutorials, or FAQs..."
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
                variant="contained"
                sx={{ ml: 2, px: 3 }}
              >
                Search
              </Button>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* Support Categories */}
      <Box sx={{ py: 8, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Browse by Category
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Find help articles organized by topic
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {supportCategories.map((category, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 8
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: `${category.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3
                      }}
                    >
                      <Box sx={{ color: category.color }}>
                        {category.icon}
                      </Box>
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {category.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {category.description}
                    </Typography>
                    <Chip
                      label={`${category.articles} articles`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Main Content Tabs */}
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
              <Tab icon={<Help />} label="FAQ" iconPosition="start" />
              <Tab icon={<VideoLibrary />} label="Video Tutorials" iconPosition="start" />
              <Tab icon={<ContactSupport />} label="Contact Support" iconPosition="start" />
            </Tabs>
          </Box>

          {renderTabContent()}
        </Container>
      </Box>

      {/* Testimonials */}
      <Box sx={{ py: 8, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              What Our Users Say
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Feedback from our community
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper elevation={2} sx={{ p: 4, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      src={testimonial.avatar}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    >
                      {testimonial.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                    "{testimonial.comment}"
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Resources Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Additional Resources
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
                <Download sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  User Guides
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Download comprehensive PDF guides for detailed instructions
                </Typography>
                <Button variant="outlined" fullWidth>
                  Download Guides
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
                <Book sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Documentation
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Access our complete technical documentation and API references
                </Typography>
                <Button variant="outlined" fullWidth>
                  View Docs
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
                <Forum sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Community Forum
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Connect with other users and share knowledge in our community
                </Typography>
                <Button variant="outlined" fullWidth>
                  Join Forum
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HelpPage;