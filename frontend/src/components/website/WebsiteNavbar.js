import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Container,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  School,
  Login,
  PersonAdd
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const WebsiteNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };



  const navigationItems = [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '/features' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];



  const isActive = (path) => location.pathname === path;

  const NavButton = ({ item, onClick }) => (
    <Button
      color="inherit"
      onClick={onClick}
      sx={{
        mx: 1,
        px: 2,
        py: 1,
        borderRadius: 2,
        textTransform: 'none',
        fontSize: '1rem',
        fontWeight: 500,
        position: 'relative',
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.1)',
          transform: 'translateY(-1px)'
        },
        '&::after': isActive(item.path) ? {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: 2,
          bgcolor: '#ffd54f',
          borderRadius: 1
        } : {},
        transition: 'all 0.3s ease'
      }}
    >
      {item.label}
    </Button>
  );

  const drawer = (
    <Box sx={{ width: 280, height: '100%', bgcolor: '#1976d2', color: 'white' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <School sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            EduPlatform
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <List sx={{ px: 2 }}>
        {navigationItems.map((item) => (
          <ListItem
            key={item.label}
            onClick={() => {
              navigate(item.path);
              handleDrawerToggle();
            }}
            sx={{
              borderRadius: 2,
              mb: 1,
              cursor: 'pointer',
              bgcolor: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        
        <Box sx={{ mt: 3, px: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              navigate('/login');
              handleDrawerToggle();
            }}
            sx={{
              mb: 2,
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
            startIcon={<Login />}
          >
            Sign In
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              navigate('/login?mode=register');
              handleDrawerToggle();
            }}
            sx={{
              bgcolor: '#ffd54f',
              color: '#333',
              '&:hover': {
                bgcolor: '#ffcc02'
              }
            }}
            startIcon={<PersonAdd />}
          >
            Get Started
          </Button>
        </Box>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: 'rgba(25, 118, 210, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0, md: 2 } }}>
            {/* Logo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                mr: 4
              }}
              onClick={() => navigate('/')}
            >
              <School sx={{ mr: 1, fontSize: 32, color: '#ffd54f' }} />
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #ffd54f, #ffcc02)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                EduPlatform
              </Typography>
              <Chip
                label="v2.0"
                size="small"
                sx={{
                  ml: 1,
                  bgcolor: '#ffd54f',
                  color: '#333',
                  fontSize: '0.7rem',
                  height: 20
                }}
              />
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                {navigationItems.map((item) => (
                  <NavButton
                    key={item.label}
                    item={item}
                    onClick={() => navigate(item.path)}
                  />
                ))}

              </Box>
            )}

            {/* Desktop Auth Buttons */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  color="inherit"
                  onClick={() => navigate('/login')}
                  startIcon={<Login />}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login?mode=register')}
                  startIcon={<PersonAdd />}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: '#ffd54f',
                    color: '#333',
                    boxShadow: '0 4px 12px rgba(255, 213, 79, 0.3)',
                    '&:hover': {
                      bgcolor: '#ffcc02',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 16px rgba(255, 213, 79, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Get Started
                </Button>
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          '& .MuiDrawer-paper': {
            bgcolor: 'transparent',
            boxShadow: 'none'
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* Spacer for fixed navbar */}
      <Toolbar />
    </>
  );
};

export default WebsiteNavbar;