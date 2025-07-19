import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import FacultyNavbar from './FacultyNavbar';
import FacultyDashboard from './FacultyDashboard';
import CourseManagement from './CourseManagement';
import StudentManagement from './StudentManagement';
import AssignmentManagement from './AssignmentManagement';
import GradingSystem from './GradingSystem';
import AttendanceManagement from './AttendanceManagement';
import AnnouncementManagement from './AnnouncementManagement';
import DiscussionForum from './DiscussionForum';
import AcademicCalendar from './AcademicCalendar';
import NotificationCenter from './NotificationCenter';

const facultyTheme = createTheme({
  palette: {
    primary: {
      main: '#7b1fa2', // Purple theme for faculty
    },
    secondary: {
      main: '#ff6f00',
    },
    background: {
      default: '#fafafa',
    },
  },
});

const FacultyPortal = ({ user, onLogout }) => {
  return (
    <ThemeProvider theme={facultyTheme}>
      <CssBaseline />
      <Router>
        <div className="FacultyPortal">
          <FacultyNavbar user={user} onLogout={onLogout} />
          <Routes>
            <Route path="/" element={<FacultyDashboard user={user} />} />
            <Route path="/courses" element={<CourseManagement user={user} />} />
            <Route path="/students" element={<StudentManagement user={user} />} />
            <Route path="/assignments" element={<AssignmentManagement user={user} />} />
            <Route path="/grading" element={<GradingSystem user={user} />} />
            <Route path="/attendance" element={<AttendanceManagement user={user} />} />
            <Route path="/announcements" element={<AnnouncementManagement user={user} />} />
            <Route path="/discussions" element={<DiscussionForum user={user} />} />
            <Route path="/calendar" element={<AcademicCalendar user={user} />} />
            <Route path="/notifications" element={<NotificationCenter user={user} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default FacultyPortal;