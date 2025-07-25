import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AdminNavbar from './AdminNavbar';
import AdminDashboard from './AdminDashboard';


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
        <AdminDashboard user={user} />
      </div>
    </ThemeProvider>
  );
};

export default AdminPortal;