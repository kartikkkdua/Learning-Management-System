import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import FacultyNavbar from './FacultyNavbar';
import FacultyDashboard from './FacultyDashboard';
import FacultyCourses from './FacultyCourses';
import FacultyStudents from './FacultyStudents';
import AssignmentManagement from '../AssignmentManagement';
import AttendanceManagement from '../AttendanceManagement';
import AnnouncementManagement from '../AnnouncementManagement';
import AcademicCalendar from '../AcademicCalendar';
import DiscussionForum from '../DiscussionForum';
import UserManagement from '../UserManagement';
import VirtualClassroomManager from '../virtualClassroom/VirtualClassroomManager';
import FacultyNotifications from './FacultyNotifications';

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
      <div className="FacultyPortal">
        <FacultyNavbar user={user} onLogout={onLogout} />
        <Routes>
          <Route path="/" element={<FacultyDashboard user={user} />} />
          <Route path="courses" element={<FacultyCourses user={user} />} />
          <Route path="students" element={<FacultyStudents user={user} />} />
          <Route path="assignments" element={<AssignmentManagement user={user} />} />
          <Route path="grading" element={<AssignmentManagement user={user} />} />
          <Route path="attendance" element={<AttendanceManagement user={user} />} />
          <Route path="announcements" element={<AnnouncementManagement user={user} />} />
          <Route path="notifications" element={<FacultyNotifications user={user} />} />
          <Route path="email" element={<AnnouncementManagement user={user} />} />
          <Route path="virtual-classroom" element={<VirtualClassroomManager userRole="faculty" />} />
          <Route path="calendar" element={<AcademicCalendar user={user} />} />
          <Route path="discussions" element={<DiscussionForum user={user} />} />
          <Route path="profile" element={<UserManagement user={user} />} />
          <Route path="*" element={<Navigate to="/faculty" />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
};

export default FacultyPortal;