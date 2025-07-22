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
  CheckCircle,
  Cancel,
  Email
} from '@mui/icons-material';
import axios from 'axios';

const FacultyApprovalStatus = ({ user }) => {
  const [facultyStatus, setFacultyStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacultyStatus();
  }, []);

  const fetchFacultyStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      // Try to access a faculty-only endpoint to check approval status
      const response = await axios.get('http://localhost:3001/api/courses', config);
      setFacultyStatus('approved');
    } catch (error) {
      if (error.response?.status === 403 && 
          error.response?.data?.message?.includes('pending approval')) {
        setFacultyStatus('pending');
      } else {
        setFacultyStatus('error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (facultyStatus === 'approved') {
    return null; // Don't show anything if approved
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
              >
                Refresh Status
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default FacultyApprovalStatus;