import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Avatar,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { 
  School, 
  AccountCircle, 
  Logout,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  People,
  MenuBook,
  Assignment,
  Campaign,
  EventNote,
  Grade
} from '@mui/icons-material';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="static">
      <Toolbar>
        <School sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Learning Management System
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/"
            startIcon={<DashboardIcon />}
            sx={{ 
              backgroundColor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Dashboard
          </Button>
          
          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <Button 
              color="inherit" 
              component={Link} 
              to="/faculties"
              startIcon={<SchoolIcon />}
              sx={{ 
                backgroundColor: isActive('/faculties') ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderRadius: 2
              }}
            >
              Faculties
            </Button>
          )}
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/students"
            startIcon={<People />}
            sx={{ 
              backgroundColor: isActive('/students') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Students
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/courses"
            startIcon={<MenuBook />}
            sx={{ 
              backgroundColor: isActive('/courses') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Courses
          </Button>
          
          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <Button 
              color="inherit" 
              component={Link} 
              to="/assignments"
              startIcon={<Assignment />}
              sx={{ 
                backgroundColor: isActive('/assignments') ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderRadius: 2
              }}
            >
              Assignments
            </Button>
          )}
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/announcements"
            startIcon={<Campaign />}
            sx={{ 
              backgroundColor: isActive('/announcements') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Announcements
          </Button>
          
          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <Button 
              color="inherit" 
              component={Link} 
              to="/attendance"
              startIcon={<EventNote />}
              sx={{ 
                backgroundColor: isActive('/attendance') ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderRadius: 2
              }}
            >
              Attendance
            </Button>
          )}
          
          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <Button 
              color="inherit" 
              component={Link} 
              to="/grading"
              startIcon={<Grade />}
              sx={{ 
                backgroundColor: isActive('/grading') ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderRadius: 2
              }}
            >
              Grading
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            {user?.profile?.firstName || user?.username}
          </Typography>
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {(user?.profile?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;