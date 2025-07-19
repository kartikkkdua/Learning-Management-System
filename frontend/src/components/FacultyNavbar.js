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
  IconButton,
  Badge
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { 
  School, 
  Logout,
  Dashboard as DashboardIcon,
  MenuBook,
  People,
  Assignment,
  Grade,
  EventNote,
  Campaign,
  Forum,
  Person,
  Notifications,
  CalendarToday
} from '@mui/icons-material';

const FacultyNavbar = ({ user, onLogout }) => {
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
          Faculty Portal
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
            My Courses
          </Button>
          
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
            to="/assignments"
            startIcon={<Assignment />}
            sx={{ 
              backgroundColor: isActive('/assignments') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Assignments
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/grades"
            startIcon={<Grade />}
            sx={{ 
              backgroundColor: isActive('/grades') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Grades
          </Button>
          
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
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            color="inherit"
            component={Link}
            to="/discussions"
          >
            <Badge badgeContent={2} color="error">
              <Forum />
            </Badge>
          </IconButton>
          
          <Typography variant="body2" sx={{ mr: 1 }}>
            {user?.profile?.firstName || user?.username}
          </Typography>
          
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {(user?.profile?.firstName?.[0] || user?.username?.[0] || 'F').toUpperCase()}
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
            <MenuItem component={Link} to="/calendar" onClick={handleClose}>
              <CalendarToday sx={{ mr: 1 }} />
              Academic Calendar
            </MenuItem>
            <MenuItem component={Link} to="/profile" onClick={handleClose}>
              <Person sx={{ mr: 1 }} />
              My Profile
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

export default FacultyNavbar;