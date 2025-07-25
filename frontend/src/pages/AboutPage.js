import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Avatar,
  Paper,
  Chip,
  useTheme
} from '@mui/material';
import {
  School,
  People,
  TrendingUp,
  EmojiEvents,
  Lightbulb,
  Security,
  Speed,
  Support
} from '@mui/icons-material';

const AboutPage = () => {
  const theme = useTheme();

  const stats = [
    { number: '50,000+', label: 'Active Users', icon: <People /> },
    { number: '1,000+', label: 'Educational Institutions', icon: <School /> },
    { number: '99.9%', label: 'Uptime Guarantee', icon: <TrendingUp /> },
    { number: '24/7', label: 'Customer Support', icon: <Support /> }
  ];

  const values = [
    {
      icon: <Lightbulb sx={{ fontSize: 40 }} />,
      title: 'Innovation',
      description: 'We continuously innovate to provide cutting-edge educational technology solutions.',
      color: '#ffd54f'
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Security',
      description: 'Your data security and privacy are our top priorities with enterprise-grade protection.',
      color: '#4caf50'
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Performance',
      description: 'Lightning-fast performance ensures smooth learning experiences for all users.',
      color: '#2196f3'
    },
    {
      icon: <Support sx={{ fontSize: 40 }} />,
      title: 'Support',
      description: '24/7 dedicated support to help you succeed in your educational journey.',
      color: '#ff9800'
    }
  ];

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'CEO & Founder',
      avatar: '/api/placeholder/120/120',
      bio: 'Former Stanford professor with 15+ years in educational technology.',
      skills: ['Leadership', 'EdTech', 'Strategy']
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      avatar: '/api/placeholder/120/120',
      bio: 'Tech veteran with expertise in scalable learning management systems.',
      skills: ['Full Stack', 'Cloud Architecture', 'AI/ML']
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      avatar: '/api/placeholder/120/120',
      bio: 'UX expert passionate about creating intuitive educational experiences.',
      skills: ['Product Design', 'UX Research', 'Analytics']
    },
    {
      name: 'David Kim',
      role: 'Head of Engineering',
      avatar: '/api/placeholder/120/120',
      bio: 'Software architect focused on building robust, scalable platforms.',
      skills: ['System Design', 'DevOps', 'Security']
    }
  ];

  const milestones = [
    {
      year: '2018',
      title: 'Company Founded',
      description: 'Started with a vision to revolutionize online education'
    },
    {
      year: '2019',
      title: 'First 1,000 Users',
      description: 'Reached our first milestone with early adopters'
    },
    {
      year: '2020',
      title: 'Series A Funding',
      description: 'Secured $10M to accelerate product development'
    },
    {
      year: '2021',
      title: 'Mobile App Launch',
      description: 'Expanded to mobile platforms for better accessibility'
    },
    {
      year: '2022',
      title: 'AI Integration',
      description: 'Introduced AI-powered learning analytics'
    },
    {
      year: '2023',
      title: 'Global Expansion',
      description: 'Serving educational institutions worldwide'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 10,
          position: 'relative'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                About EduPlatform
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  opacity: 0.9,
                  fontWeight: 300,
                  mb: 4,
                  lineHeight: 1.6
                }}
              >
                We're on a mission to make quality education accessible to everyone, everywhere. Our platform empowers educators and learners with cutting-edge technology.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label="Founded in 2018"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  label="50,000+ Users"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  label="Global Reach"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={10}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <School sx={{ fontSize: 80, color: '#ffd54f', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
                  Transforming Education Through Technology
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Mission & Vision */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)'
                }}
              >
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Our Mission
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  To democratize education by providing innovative, accessible, and effective learning management solutions that empower educators to teach better and students to learn more efficiently. We believe that quality education should be available to everyone, regardless of their location or circumstances.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #2e7d3215 0%, #4caf5015 100%)'
                }}
              >
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'success.main' }}>
                  Our Vision
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  To become the world's leading educational technology platform that transforms how people learn and teach. We envision a future where technology seamlessly integrates with education to create personalized, engaging, and effective learning experiences for all.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Values Section */}
      <Box sx={{ py: 10, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Our Values
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              The principles that guide everything we do
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} md={6} lg={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[10]
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: `${value.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3
                    }}
                  >
                    <Box sx={{ color: value.color }}>
                      {value.icon}
                    </Box>
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {value.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {value.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Meet Our Team
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Passionate professionals dedicated to transforming education
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {team.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <Avatar
                    src={member.avatar}
                    sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                  >
                    {member.name.charAt(0)}
                  </Avatar>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {member.name}
                  </Typography>
                  <Typography variant="subtitle1" color="primary.main" sx={{ mb: 2 }}>
                    {member.role}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {member.bio}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {member.skills.map((skill, skillIndex) => (
                      <Chip
                        key={skillIndex}
                        label={skill}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Timeline Section */}
      <Box sx={{ py: 10, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Our Journey
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Key milestones in our growth story
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {milestones.map((milestone, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={milestone.year}
                      color="primary"
                      sx={{ fontWeight: 600, fontSize: '0.9rem' }}
                    />
                    <EmojiEvents sx={{ ml: 2, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {milestone.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {milestone.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutPage;