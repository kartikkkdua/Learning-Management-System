import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  ListItemText,
  ListItemIcon,
  Chip,
  Slide
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Assignment,
  Grade,
  School,
  Campaign,
  Schedule,
  MarkEmailRead,
  ViewList,
  Circle
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  
  const notificationContext = useNotifications();
  
  // Handle case where context might not be available
  if (!notificationContext) {
    return (
      <IconButton color="inherit">
        <Badge badgeContent={0} color="error">
          <Notifications />
        </Badge>
      </IconButton>
    );
  }

  const {
    notifications = [],
    unreadCount = 0,
    markAsRead,
    markAllAsRead
  } = notificationContext;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewAll = () => {
    navigate('/notifications');
    handleClose();
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    handleClose();
  };

  const getNotificationIcon = (type) => {
    const iconProps = { fontSize: 'small' };
    switch (type) {
      case 'assignment_due':
        return <Assignment color="warning" {...iconProps} />;
      case 'grade_posted':
        return <Grade color="success" {...iconProps} />;
      case 'enrollment_confirmation':
        return <School color="primary" {...iconProps} />;
      case 'course_update':
        return <Campaign color="info" {...iconProps} />;
      case 'registration_reminder':
        return <Schedule color="warning" {...iconProps} />;
      default:
        return <Notifications color="action" {...iconProps} />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const recentNotifications = notifications
    .filter(n => !n.isRead)
    .slice(0, 5);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          {unreadCount > 0 ? (
            <NotificationsActive />
          ) : (
            <Notifications />
          )}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            mt: 1.5,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} new`}
                color="error"
                size="small"
                variant="filled"
              />
            )}
          </Box>
        </Box>

        {/* Notifications List */}
        {recentNotifications.length > 0 ? (
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {recentNotifications.map((notification, index) => (
              <Slide
                key={notification._id}
                direction="left"
                in
                timeout={200 + index * 50}
              >
                <MenuItem
                  onClick={() => {
                    markAsRead(notification._id);
                    handleClose();
                  }}
                  sx={{
                    alignItems: 'flex-start',
                    py: 1.5,
                    borderLeft: '3px solid',
                    borderLeftColor: notification.priority === 'urgent' ? 'error.main' : 
                                   notification.priority === 'high' ? 'warning.main' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          sx={{ flexGrow: 1 }}
                          noWrap
                        >
                          {notification.title}
                        </Typography>
                        <Circle sx={{ fontSize: 8, color: 'primary.main' }} />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 0.5
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </MenuItem>
              </Slide>
            ))}
          </Box>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Notifications sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </Box>
        )}

        {/* Footer Actions */}
        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Box display="flex" gap={1}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<ViewList />}
              onClick={handleViewAll}
            >
              View All
            </Button>
            {unreadCount > 0 && (
              <Button
                fullWidth
                variant="contained"
                size="small"
                startIcon={<MarkEmailRead />}
                onClick={handleMarkAllRead}
              >
                Mark All Read
              </Button>
            )}
          </Box>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationBell;