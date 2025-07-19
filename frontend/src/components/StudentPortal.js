import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import StudentNavbar from './StudentNavbar';
import StudentDashboard from './StudentDashboard';
import StudentCourses from './StudentCourses';
import StudentAssignments from './StudentAssignments';
import StudentGrades from './StudentGrades';
import StudentAnnouncements from './StudentAnnouncements';
import StudentProfile from './StudentProfile';
import StudentAttendance from './StudentAttendance';

const studentTheme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green theme for students
    },
    secondary: {
      main: '#ff6f00',
    },
    background: {
      default: '#f8f9fa',
    },
  },
});

const StudentPortal = ({ user, onLogout }) => {
  return (
    <ThemeProvider theme={studentTheme}>
      <CssBaseline />
      <Router>
        <div className="StudentPortal">
          <StudentNavbar user={user} onLogout={onLogout} />
          <Routes>
            <Route path="/" element={<StudentDashboard user={user} />} />
            <Route path="/courses" element={<StudentCourses user={user} />} />
            <Route path="/assignments" element={<StudentAssignments user={user} />} />
            <Route path="/grades" element={<StudentGrades user={user} />} />
            <Route path="/announcements" element={<StudentAnnouncements user={user} />} />
            <Route path="/attendance" element={<StudentAttendance user={user} />} />
            <Route path="/profile" element={<StudentProfile user={user} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default StudentPortal;