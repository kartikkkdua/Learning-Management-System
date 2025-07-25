import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  TextField,
  Button,
  List,
  ListItem
} from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  YouTube,
  Email,
  Phone,
  LocationOn,
  School
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription');
  };

  const footerLinks = {
    product: [
      { name: 'Features', path: '/features' },
      { name: 'Pricing', path: '/pricing' },
      { name: 'Help Center', path: '/help' },
      { name: 'Contact', path: '/contact' },
      { name: 'About Us', path: '/about' }
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/contact' },
      { name: 'Features', path: '/features' },
      { name: 'Pricing', path: '/pricing' },
      { name: 'Help', path: '/help' }
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Contact Support', path: '/contact' },
      { name: 'Getting Started', path: '/login?mode=register' },
      { name: 'Sign In', path: '/login' },
      { name: 'Features', path: '/features' }
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'About', path: '/about' },
      { name: 'Contact', path: '/contact' }
    ]
  };

  const socialLinks = [
    { icon: <Facebook />, href: 'https://facebook.com/eduplatform', label: 'Facebook' },
    { icon: <Twitter />, href: 'https://twitter.com/eduplatform', label: 'Twitter' },
    { icon: <LinkedIn />, href: 'https://linkedin.com/company/eduplatform', label: 'LinkedIn' },
    { icon: <Instagram />, href: 'https://instagram.com/eduplatform', label: 'Instagram' },
    { icon: <YouTube />, href: 'https://youtube.com/eduplatform', label: 'YouTube' }
  ];

  const handleLinkClick = (path) => {
    navigate(path);
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a1a1a',
        color: 'white',
        pt: 8,
        pb: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <School sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  EduPlatform
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 3, color: 'grey.400', lineHeight: 1.7 }}>
                Empowering educational institutions worldwide with innovative learning management solutions.
                Transform your teaching and learning experience with our comprehensive platform.
              </Typography>

              {/* Contact Info */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="grey.400">
                    support@eduplatform.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="grey.400">
                    +1 (555) 123-4567
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="grey.400">
                    San Francisco, CA
                  </Typography>
                </Box>
              </Box>

              {/* Social Links */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Follow Us
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {socialLinks.map((social, index) => (
                    <IconButton
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'grey.400',
                        '&:hover': {
                          color: 'primary.main',
                          bgcolor: 'rgba(25, 118, 210, 0.1)'
                        }
                      }}
                      aria-label={social.label}
                    >
                      {social.icon}
                    </IconButton>
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Footer Links */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={4}>
              <Grid item xs={6} sm={3}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
                  Product
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {footerLinks.product.map((link, index) => (
                    <ListItem key={index} sx={{ p: 0, mb: 0.5 }}>
                      <Link
                        component="button"
                        onClick={() => handleLinkClick(link.path)}
                        sx={{
                          color: 'grey.400',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          '&:hover': {
                            color: 'primary.main'
                          }
                        }}
                      >
                        {link.name}
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
                  Company
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {footerLinks.company.map((link, index) => (
                    <ListItem key={index} sx={{ p: 0, mb: 0.5 }}>
                      <Link
                        component="button"
                        onClick={() => handleLinkClick(link.path)}
                        sx={{
                          color: 'grey.400',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          '&:hover': {
                            color: 'primary.main'
                          }
                        }}
                      >
                        {link.name}
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
                  Support
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {footerLinks.support.map((link, index) => (
                    <ListItem key={index} sx={{ p: 0, mb: 0.5 }}>
                      <Link
                        component="button"
                        onClick={() => handleLinkClick(link.path)}
                        sx={{
                          color: 'grey.400',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          '&:hover': {
                            color: 'primary.main'
                          }
                        }}
                      >
                        {link.name}
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
                  Legal
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {footerLinks.legal.map((link, index) => (
                    <ListItem key={index} sx={{ p: 0, mb: 0.5 }}>
                      <Link
                        component="button"
                        onClick={() => handleLinkClick(link.path)}
                        sx={{
                          color: 'grey.400',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          '&:hover': {
                            color: 'primary.main'
                          }
                        }}
                      >
                        {link.name}
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Grid>

          {/* Newsletter Signup */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'grey.400' }}>
              Stay updated with our latest features and educational insights.
            </Typography>
            <Box component="form" onSubmit={handleNewsletterSubmit}>
              <TextField
                fullWidth
                placeholder="Enter your email"
                variant="outlined"
                size="small"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main'
                    }
                  },
                  '& .MuiOutlinedInput-input::placeholder': {
                    color: 'rgba(255,255,255,0.7)'
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  }
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Bottom Footer */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" color="grey.500">
            © 2024 EduPlatform. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              component="button"
              onClick={() => handleLinkClick('/privacy')}
              sx={{
                color: 'grey.500',
                textDecoration: 'none',
                fontSize: '0.875rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              Privacy
            </Link>
            <Link
              component="button"
              onClick={() => handleLinkClick('/terms')}
              sx={{
                color: 'grey.500',
                textDecoration: 'none',
                fontSize: '0.875rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              Terms
            </Link>
            <Link
              component="button"
              onClick={() => handleLinkClick('/cookies')}
              sx={{
                color: 'grey.500',
                textDecoration: 'none',
                fontSize: '0.875rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;