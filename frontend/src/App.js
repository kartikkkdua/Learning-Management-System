import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import StudentPortal from './components/StudentPortal';
import AdminPortal from './components/AdminPortal';
import FacultyPortal from './components/FacultyPortal';
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
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  // Role-based routing
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {user.role === 'admin' ? (
        <AdminPortal user={user} onLogout={handleLogout} />
      ) : user.role === 'faculty' ? (
        <FacultyPortal user={user} onLogout={handleLogout} />
      ) : (
        <StudentPortal user={user} onLogout={handleLogout} />
      )}
    </ThemeProvider>
  );
}

export default App;
