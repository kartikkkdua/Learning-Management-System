// Test utility to verify all components are properly imported and configured
import React from 'react';

// Import all components to check for any import errors
import Dashboard from '../components/Dashboard';
import FacultyManagement from '../components/FacultyManagement';
import StudentManagement from '../components/StudentManagement';
import CourseManagement from '../components/CourseManagement';
import AssignmentManagement from '../components/AssignmentManagement';
import AnnouncementManagement from '../components/AnnouncementManagement';
import AttendanceManagement from '../components/AttendanceManagement';
import GradingSystem from '../components/GradingSystem';
import Login from '../components/Login';
import Navbar from '../components/Navbar';

const testComponents = {
  Dashboard,
  FacultyManagement,
  StudentManagement,
  CourseManagement,
  AssignmentManagement,
  AnnouncementManagement,
  AttendanceManagement,
  GradingSystem,
  Login,
  Navbar
};

// Test API endpoints
export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:3001/api',
  FACULTIES: '/faculties',
  STUDENTS: '/students',
  COURSES: '/courses',
  ASSIGNMENTS: '/assignments',
  ANNOUNCEMENTS: '/announcements',
  ATTENDANCE: '/attendance',
  AUTH: '/auth'
};

// Test user roles
export const USER_ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
  PARENT: 'parent'
};

export default testComponents;