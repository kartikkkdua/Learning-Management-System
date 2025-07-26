import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Container
} from '@mui/material';
import {
  HourglassEmpty,
  Cancel,
  Email
} from '@mui/icons-material';
import axios from 'axios';

const FacultyApprovalStatus = ({ user }) => {
  const [facultyStatus, setFacultyStatus] = useState(user?.facultyStatus || 'unknown');
  const [facultyApproved, setFacultyApproved] = useState(user?.facultyApproved);
  const [loading, setLoading] = useState(false);

  // Debug: Log user object to see what's available
  console.log('FacultyApprovalStatus - User object:', user);
  console.log('Initial Faculty Status:', facultyStatus, 'Faculty Approved:', facultyApproved);

  useEffect(() => {
    // If faculty status is not available in user object, fetch it
    if (user?.role === 'faculty' && (!user?.facultyStatus || user?.facultyStatus === 'unknown')) {
      fetchFacultyStatus();
    }
  }, [user]);

  const fetchFacultyStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      // Get current user profile with faculty status
      const response = await axios.get('http://localhost:3001/api/auth/profile', config);
      const userData = response.data;
      
      if (userData.facultyStatus) {
        setFacultyStatus(userData.facultyStatus);
        setFacultyApproved(userData.facultyApproved);
        
        // Update localStorage with new user data
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          facultyStatus: userData.facultyStatus,
          facultyApproved: userData.facultyApproved
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error fetching faculty status:', error);
      setFacultyStatus('unknown');
      setFacultyApproved(false);
    } finally {
      setLoading(false);
    }
  };

  // Don't show anything if user is not faculty
  if (user?.role !== 'faculty') {
    return null;
  }
  
  // Don't show if already approved
  if (facultyApproved === true || facultyStatus === 'approved') {
    return null;
  }

  // Don't show while loading
  if (loading) {
    return null;
  }

  const getStatusConfig = () => {
    switch (facultyStatus) {
      case 'pending':
        return {
          severity: 'warning',
          icon: <HourglassEmpty />,
          title: 'Account Pending Approval',
          message: 'Your faculty account is currently pending admin approval. You will receive an email notification once your account has been reviewed.',
          color: '#ff9800'
        };
      case 'rejected':
        return {
          severity: 'error',
          icon: <Cancel />,
          title: 'Account Not Approved',
          message: 'Your faculty account application was not approved. Please contact support for more information.',
          color: '#f44336'
        };
      default:
        return {
          severity: 'info',
          icon: <Email />,
          title: 'Account Status Unknown',
          message: 'Unable to determine your account status. Please contact support.',
          color: '#2196f3'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card sx={{ border: `2px solid ${statusConfig.color}` }}>
        <CardContent>
          <Alert severity={statusConfig.severity} sx={{ mb: 2 }}>
            <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {statusConfig.icon}
              {statusConfig.title}
            </AlertTitle>
            {statusConfig.message}
          </Alert>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              What happens next?
            </Typography>
            
            {facultyStatus === 'pending' && (
              <Box>
                <Typography variant="body2" paragraph>
                  • An administrator will review your faculty application
                </Typography>
                <Typography variant="body2" paragraph>
                  • You will receive an email notification with the decision
                </Typography>
                <Typography variant="body2" paragraph>
                  • Once approved, you'll have full access to faculty features
                </Typography>
                <Typography variant="body2" paragraph>
                  • This process typically takes 1-2 business days
                </Typography>
              </Box>
            )}

            {facultyStatus === 'rejected' && (
              <Box>
                <Typography variant="body2" paragraph>
                  • Contact support at support@lmsplatform.com for more details
                </Typography>
                <Typography variant="body2" paragraph>
                  • You may be able to reapply with additional information
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Email />}
                href="mailto:support@lmsplatform.com"
              >
                Contact Support
              </Button>
              <Button
                variant="text"
                onClick={fetchFacultyStatus}
                disabled={loading}
              >
                {loading ? 'Checking...' : 'Refresh Status'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default FacultyApprovalStatus;