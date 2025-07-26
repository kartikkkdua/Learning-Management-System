import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Badge,
  Tabs,
  Tab,
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Assignment,
  Grade,
  School,
  Campaign,
  Schedule,
  Delete,
  MarkEmailRead,
  MoreVert,
  Circle,
  CheckCircle,
  Warning,
  Info,
  Error
} from '@mui/icons-material';
import axios from 'axios';

const NotificationCenter = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    byType: {},
    byPriority: {}
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [user]);

  const fetchNotifications = async (filters = {}) => {
    try {
      const userId = user.id || user._id;
      const params = new URLSearchParams({
        page: 1,
        limit: 50,
        ...filters
      });
      
      const response = await axios.get(`http://localhost:3001/api/notifications/user/${userId}?${params}`);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const userId = user.id || user._id;
      const response = await axios.get(`http://localhost:3001/api/notifications/user/${userId}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`http://localhost:3001/api/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const userId = user.id || user._id;
      await axios.patch(`http://localhost:3001/api/notifications/user/${userId}/read-all`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
      );
      
      // Update stats
      setStats(prev => ({ ...prev, unread: 0 }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`http://localhost:3001/api/notifications/${notificationId}`);
      
      // Update local state
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    
    const filters = {};
    switch (newValue) {
      case 1: // Unread
        filters.unreadOnly = true;
        break;
      case 2: // Academic
        filters.type = 'assignment_due,grade_posted,course_update';
        break;
      case 3: // Administrative
        filters.type = 'enrollment_confirmation,registration_reminder';
        break;
      default:
        break;
    }
    
    fetchNotifications(filters);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment_due': return <Assignment color="warning" />;
      case 'grade_posted': return <Grade color="success" />;
      case 'enrollment_confirmation': return <School color="primary" />;
      case 'course_update': return <Campaign color="info" />;
      case 'registration_reminder': return <Schedule color="warning" />;
      default: return <Notifications color="action" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <Error color="error" />;
      case 'high': return <Warning color="warning" />;
      case 'medium': return <Info color="info" />;
      case 'low': return <Circle color="action" />;
      default: return <Circle color="action" />;
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

  const handleMenuOpen = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (selectedTab) {
      case 1: // Unread
        return !notification.isRead;
      case 2: // Academic
        return ['assignment_due', 'grade_posted', 'course_update'].includes(notification.type);
      case 3: // Administrative
        return ['enrollment_confirmation', 'registration_reminder'].includes(notification.type);
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading notifications...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Notification Center
        </Typography>
        <Box display="flex" gap={2}>
          <Badge badgeContent={stats.unread} color="error">
            <NotificationsActive color="primary" />
          </Badge>
          {stats.unread > 0 && (
            <Button 
              variant="outlined" 
              size="small"
              onClick={markAllAsRead}
              startIcon={<MarkEmailRead />}
            >
              Mark All Read
            </Button>
          )}
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Notifications sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Notifications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <NotificationsActive sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" color="error.main">
                {stats.unread}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Unread
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {stats.byType.assignment_due?.total || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Assignment Reminders
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Grade sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {stats.byType.grade_posted?.total || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Grade Updates
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          sx={{ px: 2 }}
        >
          <Tab label={`All (${notifications.length})`} />
          <Tab 
            label={
              <Badge badgeContent={stats.unread} color="error">
                Unread
              </Badge>
            } 
          />
          <Tab label="Academic" />
          <Tab label="Administrative" />
        </Tabs>
      </Paper>

      {/* Notifications List */}
      <Paper>
        <List>
          {filteredNotifications.map((notification, index) => (
            <React.Fragment key={notification._id}>
              <ListItem
                sx={{
                  backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                  '&:hover': { backgroundColor: 'action.selected' }
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight={notification.isRead ? 'normal' : 'bold'}
                      >
                        {notification.title}
                      </Typography>
                      <Chip 
                        label={notification.priority.toUpperCase()}
                        color={getPriorityColor(notification.priority)}
                        size="small"
                        icon={getPriorityIcon(notification.priority)}
                      />
                      {!notification.isRead && (
                        <Circle sx={{ fontSize: 8, color: 'primary.main' }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {notification.message}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2} mt={1}>
                        <Typography variant="caption" color="textSecondary">
                          {formatTimeAgo(notification.createdAt)}
                        </Typography>
                        {notification.metadata?.course && (
                          <Chip 
                            label={notification.metadata.course.courseCode}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
                
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => handleMenuOpen(e, notification)}
                  >
                    <MoreVert />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              
              {index < filteredNotifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
        
        {filteredNotifications.length === 0 && (
          <Box p={4} textAlign="center">
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Notifications
            </Typography>
            <Typography color="textSecondary">
              {selectedTab === 1 ? 
                "You're all caught up! No unread notifications." :
                "No notifications found for this category."
              }
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.isRead && (
          <MenuItem 
            onClick={() => {
              markAsRead(selectedNotification._id);
              handleMenuClose();
            }}
          >
            <MarkEmailRead sx={{ mr: 1 }} />
            Mark as Read
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => {
            deleteNotification(selectedNotification._id);
            handleMenuClose();
          }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default NotificationCenter;