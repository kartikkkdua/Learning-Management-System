import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/authentication/Login';
import ResetPassword from './components/authentication/ResetPassword';
import StudentPortal from './components/student/StudentPortal';
import AdminPortal from './components/admin/AdminPortal';
import FacultyPortal from './components/faculty/FacultyPortal';
import MaintenancePage from './pages/MaintenancePage';

import { NotificationProvider } from './contexts/NotificationContext';
import { API_URL } from './config/api';
import axios from 'axios';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };
  const isUnderMaintenance = false;


  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  if (isUnderMaintenance) {
    return <MaintenancePage />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  // Check if we're on the reset password page
  const isResetPasswordPage = window.location.pathname === '/reset-password';
  
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {isResetPasswordPage ? (
          <ResetPassword />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </ThemeProvider>
    );
  }

  // Role-based routing
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider user={user}>
        {user.role === 'admin' ? (
          <AdminPortal user={user} onLogout={handleLogout} />
        ) : user.role === 'faculty' ? (
          <FacultyPortal user={user} onLogout={handleLogout} />
        ) : (
          <StudentPortal user={user} onLogout={handleLogout} />
        )}
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
