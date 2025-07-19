import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AdminNavbar from './AdminNavbar';
import AdminDashboard from './AdminDashboard';
import CourseManagement from './CourseManagement';
import EnrollmentManagement from './EnrollmentManagement';
import FacultyManagement from './FacultyManagement';
import StudentManagement from './StudentManagement';
import AssignmentManagement from './AssignmentManagement';
import AnnouncementManagement from './AnnouncementManagement';
import AttendanceManagement from './AttendanceManagement';
import GradingSystem from './GradingSystem';
import AcademicCalendar from './AcademicCalendar';
import NotificationCenter from './NotificationCenter';

const adminTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue theme for admin
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

const AdminPortal = ({ user, onLogout }) => {
  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Router>
        <div className="AdminPortal">
          <AdminNavbar user={user} onLogout={onLogout} />
          <Routes>
            <Route path="/" element={<AdminDashboard user={user} />} />
            <Route path="/courses" element={<CourseManagement user={user} />} />
            <Route path="/enrollments" element={<EnrollmentManagement user={user} />} />
            <Route path="/faculties" element={<FacultyManagement user={user} />} />
            <Route path="/students" element={<StudentManagement user={user} />} />
            <Route path="/assignments" element={<AssignmentManagement user={user} />} />
            <Route path="/announcements" element={<AnnouncementManagement user={user} />} />
            <Route path="/attendance" element={<AttendanceManagement user={user} />} />
            <Route path="/grading" element={<GradingSystem user={user} />} />
            <Route path="/calendar" element={<AcademicCalendar user={user} />} />
            <Route path="/notifications" element={<NotificationCenter user={user} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default AdminPortal;