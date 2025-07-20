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
  AdminPanelSettings,
  Logout,
  Dashboard as DashboardIcon,
  People,
  MenuBook,
  PersonAdd,
  School,
  Settings,
  Assessment,
  CalendarToday,
  GroupAdd,
  Analytics,
  Campaign,
  Email
} from '@mui/icons-material';
import NotificationBell from './NotificationBell';

const AdminNavbar = ({ user, onLogout }) => {
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
        <AdminPanelSettings sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Admin Portal
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
            to="/users"
            startIcon={<People />}
            sx={{ 
              backgroundColor: isActive('/users') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Users
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
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/enrollments"
            startIcon={<PersonAdd />}
            sx={{ 
              backgroundColor: isActive('/enrollments') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Enrollments
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/students"
            startIcon={<GroupAdd />}
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
            to="/faculties"
            startIcon={<School />}
            sx={{ 
              backgroundColor: isActive('/faculties') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Faculties
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/reports"
            startIcon={<Assessment />}
            sx={{ 
              backgroundColor: isActive('/reports') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Reports
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/analytics"
            startIcon={<Analytics />}
            sx={{ 
              backgroundColor: isActive('/analytics') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Analytics
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/create-notification"
            startIcon={<Campaign />}
            sx={{ 
              backgroundColor: isActive('/create-notification') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Create Alert
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/email"
            startIcon={<Email />}
            sx={{ 
              backgroundColor: isActive('/email') ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: 2
            }}
          >
            Email
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
              {(user?.profile?.firstName?.[0] || user?.username?.[0] || 'A').toUpperCase()}
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
            <MenuItem component={Link} to="/settings" onClick={handleClose}>
              <Settings sx={{ mr: 1 }} />
              System Settings
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

export default AdminNavbar;