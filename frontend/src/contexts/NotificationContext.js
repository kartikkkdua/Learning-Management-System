import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { API_URL, SOCKET_URL } from '../config/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn('useNotifications must be used within a NotificationProvider');
    return null;
  }
  return context;
};

export const NotificationProvider = ({ children, user }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initialize socket connection
  useEffect(() => {
    if (user && user.id) {
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });
      
      newSocket.on('connect', () => {
        console.log('Connected to notification server');
        // Join user-specific rooms
        newSocket.emit('join', {
          id: user.id || user._id,
          username: user.username || 'Unknown',
          role: user.role || 'student'
        });
      });

      // Listen for new notifications
      newSocket.on('newNotification', (notification) => {
        if (notification && notification._id) {
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification if permission granted
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              tag: notification._id
            });
          }
        }
      });

      // Listen for notification count updates
      newSocket.on('notificationCount', (count) => {
        setUnreadCount(typeof count === 'number' ? count : 0);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from notification server');
      });

      newSocket.on('connect_error', (error) => {
        console.warn('Socket connection error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  // Fetch initial notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user]);

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const fetchNotifications = async (page = 1, limit = 20) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/notifications/user/${user.id || user._id}`, {
        params: { page, limit },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.notifications) {
        if (page === 1) {
          setNotifications(response.data.notifications);
        } else {
          setNotifications(prev => [...prev, ...response.data.notifications]);
        }
        
        setUnreadCount(response.data.pagination?.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      const response = await axios.get(`${API_URL}/notifications/user/${user.id || user._id}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data?.unread || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/notifications/user/${user.id || user._id}/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const createNotification = async (notificationData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/notifications`, notificationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const broadcastNotification = async (recipients, notificationData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/notifications/bulk`, {
        recipients,
        ...notificationData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      throw error;
    }
  };

  const value = {
    socket,
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    broadcastNotification,
    refreshNotifications: () => fetchNotifications(1, 20)
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;