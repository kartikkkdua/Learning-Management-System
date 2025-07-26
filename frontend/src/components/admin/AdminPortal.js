import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AdminNavbar from './AdminNavbar';
import AdminDashboard from './AdminDashboard';
import UserManagement from '../UserManagement';
import CourseManagement from '../CourseManagement';
import EnrollmentManagement from '../EnrollmentManagement';
import ReportsAnalytics from '../ReportsAnalytics';
import AcademicCalendar from '../AcademicCalendar';
import FacultyApproval from './FacultyApproval';
import AnnouncementManagement from '../AnnouncementManagement';
import OAuthDebug from '../authentication/OAuthDebug';


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
      <div className="AdminPortal">
        <AdminNavbar user={user} onLogout={onLogout} />
        <Routes>
          <Route path="/" element={<AdminDashboard user={user} />} />
          <Route path="users" element={<UserManagement user={user} />} />
          <Route path="courses" element={<CourseManagement user={user} />} />
          <Route path="course-assignment" element={<CourseManagement user={user} />} />
          <Route path="enrollments" element={<EnrollmentManagement user={user} />} />
          <Route path="students" element={<UserManagement user={user} />} />
          <Route path="faculties" element={<UserManagement user={user} />} />
          <Route path="faculty-approval" element={<FacultyApproval user={user} />} />
          <Route path="reports" element={<ReportsAnalytics user={user} />} />
          <Route path="analytics" element={<ReportsAnalytics user={user} />} />
          <Route path="create-notification" element={<AnnouncementManagement user={user} />} />
          <Route path="email" element={<AnnouncementManagement user={user} />} />
          <Route path="calendar" element={<AcademicCalendar user={user} />} />
          <Route path="settings" element={<UserManagement user={user} />} />
          <Route path="oauth-debug" element={<OAuthDebug />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
};

export default AdminPortal;