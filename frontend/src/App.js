import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import components
import Login from './components/authentication/Login';
import OAuthCallback from './components/authentication/OAuthCallback';
import FacultyPortal from './components/faculty/FacultyPortal';
import AdminPortal from './components/admin/AdminPortal';
import StudentPortal from './components/student/StudentPortal';

// Import pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import HelpPage from './pages/HelpPage';
import NotFoundPage from './pages/NotFoundPage';
import TermsPage from './pages/TermsPage';
import CookiesPage from './pages/CookiesPage';
import PrivacyPage from './pages/PrivacyPage';

// Import website components
import WebsiteNavbar from './components/website/WebsiteNavbar';
import Footer from './components/website/Footer';

// Import contexts
import { NotificationProvider } from './contexts/NotificationContext';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
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
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
          Loading...
        </div>
      </ThemeProvider>
    );
  }

  // Protected Route Component
  const ProtectedRoute = ({ children, requiredRole = null }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    return children;
  };

  // Public Route Component (with navbar and footer)
  const PublicRoute = ({ children }) => (
    <>
      <WebsiteNavbar />
      {children}
      <Footer />
    </>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={
            user ? <Navigate to={`/${user.role}`} replace /> : (
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            )
          } />
          <Route path="/about" element={
            <PublicRoute>
              <AboutPage />
            </PublicRoute>
          } />
          <Route path="/features" element={
            <PublicRoute>
              <FeaturesPage />
            </PublicRoute>
          } />
          <Route path="/pricing" element={
            <PublicRoute>
              <PricingPage />
            </PublicRoute>
          } />
          <Route path="/contact" element={
            <PublicRoute>
              <ContactPage />
            </PublicRoute>
          } />
          <Route path="/help" element={
            <PublicRoute>
              <HelpPage />
            </PublicRoute>
          } />
          <Route path="/terms" element={
            <PublicRoute>
              <TermsPage />
            </PublicRoute>
          } />
          <Route path="/cookies" element={
            <PublicRoute>
              <CookiesPage />
            </PublicRoute>
          } />
          <Route path="/privacy" element={
            <PublicRoute>
              <PrivacyPage />
            </PublicRoute>
          } />

          {/* Authentication Routes */}
          <Route path="/login" element={
            user ? <Navigate to={`/${user.role}`} replace /> : (
              <>
                <Login onLogin={handleLogin} />
              </>
            )
          } />
          <Route path="/auth/callback" element={<OAuthCallback />} />

          {/* Protected Portal Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute requiredRole="admin">
              <NotificationProvider user={user}>
                <AdminPortal user={user} onLogout={handleLogout} />
              </NotificationProvider>
            </ProtectedRoute>
          } />
          <Route path="/faculty/*" element={
            <ProtectedRoute requiredRole="faculty">
              <NotificationProvider user={user}>
                <FacultyPortal user={user} onLogout={handleLogout} />
              </NotificationProvider>
            </ProtectedRoute>
          } />
          <Route path="/student/*" element={
            <ProtectedRoute requiredRole="student">
              <NotificationProvider user={user}>
                <StudentPortal user={user} onLogout={handleLogout} />
              </NotificationProvider>
            </ProtectedRoute>
          } />

          {/* Utility Routes */}
          <Route path="/unauthorized" element={
            <PublicRoute>
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <h1>Unauthorized Access</h1>
                <p>You don't have permission to access this page.</p>
              </div>
            </PublicRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={
            <PublicRoute>
              <NotFoundPage />
            </PublicRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;