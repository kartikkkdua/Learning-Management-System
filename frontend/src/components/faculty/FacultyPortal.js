import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import FacultyNavbar from './FacultyNavbar';
import FacultyDashboard from './FacultyDashboard';

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
        <FacultyDashboard user={user} />
      </div>
    </ThemeProvider>
  );
};

export default FacultyPortal;