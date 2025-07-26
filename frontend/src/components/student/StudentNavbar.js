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
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { 
  School, 
  Logout,
  Dashboard as DashboardIcon,
  MenuBook,
  Assignment,
  Grade,
  Campaign,
  EventNote,
  Person,
  TrendingUp,
  CalendarToday,
  HourglassEmpty,
  Settings,
  VideoCall
} from '@mui/icons-material';
import NotificationBell from '../notification/NotificationBell';

const StudentNavbar = ({ user, onLogout }) => {
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
          Student Portal
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/student"
            startIcon={<DashboardIcon />}
            sx={{ 
              backgroundColor: isActive('/student') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Dashboard
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/student/courses"
            startIcon={<MenuBook />}
            sx={{ 
              backgroundColor: isActive('/student/courses') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            My Courses
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/student/assignments"
            startIcon={<Assignment />}
            sx={{ 
              backgroundColor: isActive('/student/assignments') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Assignments
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/student/grades"
            startIcon={<Grade />}
            sx={{ 
              backgroundColor: isActive('/student/grades') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Grades
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/student/announcements"
            startIcon={<Campaign />}
            sx={{ 
              backgroundColor: isActive('/student/announcements') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Announcements
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/student/attendance"
            startIcon={<EventNote />}
            sx={{ 
              backgroundColor: isActive('/student/attendance') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Attendance
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/student/progress"
            startIcon={<TrendingUp />}
            sx={{ 
              backgroundColor: isActive('/student/progress') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Progress
          </Button>

          <Button 
            color="inherit" 
            component={Link} 
            to="/student/virtual-classroom"
            startIcon={<VideoCall />}
            sx={{ 
              backgroundColor: isActive('/student/virtual-classroom') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Classes
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/student/calendar"
            startIcon={<CalendarToday />}
            sx={{ 
              backgroundColor: isActive('/student/calendar') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Calendar
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/student/waitlist"
            startIcon={<HourglassEmpty />}
            sx={{ 
              backgroundColor: isActive('/student/waitlist') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Waitlist
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationBell />
          
          <Typography variant="body2" sx={{ mr: 1 }}>
            {user?.profile?.firstName || user?.username}
          </Typography>
          
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {(user?.profile?.firstName?.[0] || user?.username?.[0] || 'S').toUpperCase()}
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
            <MenuItem component={Link} to="/student/profile" onClick={handleClose}>
              <Person sx={{ mr: 1 }} />
              My Profile
            </MenuItem>
            <MenuItem component={Link} to="/student/settings" onClick={handleClose}>
              <Settings sx={{ mr: 1 }} />
              Settings
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

export default StudentNavbar;