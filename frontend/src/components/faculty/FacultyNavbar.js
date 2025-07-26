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
  CalendarToday,
  Notifications,
  Email,
  VideoCall
} from '@mui/icons-material';
import NotificationBell from '../notification/NotificationBell';

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
            to="/faculty"
            startIcon={<DashboardIcon />}
            sx={{
              backgroundColor: isActive('/faculty') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Dashboard
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/faculty/courses"
            startIcon={<MenuBook />}
            sx={{
              backgroundColor: isActive('/faculty/courses') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            My Courses
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/faculty/students"
            startIcon={<People />}
            sx={{
              backgroundColor: isActive('/faculty/students') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Students
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/faculty/assignments"
            startIcon={<Assignment />}
            sx={{
              backgroundColor: isActive('/faculty/assignments') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Assignments
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/faculty/grading"
            startIcon={<Grade />}
            sx={{
              backgroundColor: isActive('/faculty/grading') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Grades
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/faculty/attendance"
            startIcon={<EventNote />}
            sx={{
              backgroundColor: isActive('/faculty/attendance') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Attendance
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/faculty/virtual-classroom"
            startIcon={<VideoCall />}
            sx={{
              backgroundColor: isActive('/faculty/virtual-classroom') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Virtual Classes
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/faculty/announcements"
            startIcon={<Campaign />}
            sx={{
              backgroundColor: isActive('/faculty/announcements') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Announcements
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/faculty/notifications"
            startIcon={<Notifications />}
            sx={{
              backgroundColor: isActive('/faculty/notifications') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Send Alert
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/faculty/email"
            startIcon={<Email />}
            sx={{
              backgroundColor: isActive('/faculty/email') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Email
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationBell />

          <IconButton
            color="inherit"
            component={Link}
            to="/faculty/discussions"
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
            <MenuItem component={Link} to="/faculty/calendar" onClick={handleClose}>
              <CalendarToday sx={{ mr: 1 }} />
              Academic Calendar
            </MenuItem>
            <MenuItem component={Link} to="/faculty/profile" onClick={handleClose}>
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