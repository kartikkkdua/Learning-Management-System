import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FacultyManagement from './components/FacultyManagement';
import StudentManagement from './components/StudentManagement';
import CourseManagement from './components/CourseManagement';
import AssignmentManagement from './components/AssignmentManagement';
import AnnouncementManagement from './components/AnnouncementManagement';
import AttendanceManagement from './components/AttendanceManagement';
import GradingSystem from './components/GradingSystem';
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navbar user={user} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/faculties" element={<FacultyManagement />} />
            <Route path="/students" element={<StudentManagement />} />
            <Route path="/courses" element={<CourseManagement />} />
            <Route path="/assignments" element={<AssignmentManagement />} />
            <Route path="/announcements" element={<AnnouncementManagement />} />
            <Route path="/attendance" element={<AttendanceManagement />} />
            <Route path="/grading" element={<GradingSystem />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
