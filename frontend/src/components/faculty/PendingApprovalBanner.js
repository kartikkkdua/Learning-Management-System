import React from 'react';
import {
    Alert,
    AlertTitle,
    Box,
    Typography,
    Button,
    Paper
} from '@mui/material';
import {
    HourglassEmpty,
    ContactSupport,
    Info
} from '@mui/icons-material';

const PendingApprovalBanner = ({ user }) => {
    // Only show for faculty members with pending status
    if (user?.role !== 'faculty' || user?.facultyApproved || user?.facultyStatus === 'approved') {
        return null;
    }

    const getStatusInfo = () => {
        switch (user?.facultyStatus) {
            case 'pending':
                return {
                    severity: 'warning',
                    icon: <HourglassEmpty />,
                    title: 'Account Pending Approval',
                    message: 'Your faculty account is currently under review by the administration.',
                    action: 'Please wait for admin approval to access all faculty features.'
                };
            case 'rejected':
                return {
                    severity: 'error',
                    icon: <ContactSupport />,
                    title: 'Account Application Rejected',
                    message: 'Your faculty account application has been rejected.',
                    action: 'Please contact the administration for more information.'
                };
            default:
                return {
                    severity: 'info',
                    icon: <Info />,
                    title: 'Account Status Unknown',
                    message: 'Your account status is being processed.',
                    action: 'Please contact support if this persists.'
                };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <Paper elevation={2} sx={{ mb: 3 }}>
            <Alert
                severity={statusInfo.severity}
                icon={statusInfo.icon}
                sx={{
                    '& .MuiAlert-message': { width: '100%' },
                    borderRadius: 2
                }}
            >
                <AlertTitle sx={{ fontWeight: 'bold', mb: 1 }}>
                    {statusInfo.title}
                </AlertTitle>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        {statusInfo.message}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {statusInfo.action}
                    </Typography>
                </Box>

                {user?.facultyStatus === 'pending' && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            <strong>What happens next:</strong>
                        </Typography>
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                                An administrator will review your application
                            </Typography>
                            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                                You'll receive an email notification once approved
                            </Typography>
                            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                                Full faculty features will be unlocked after approval
                            </Typography>
                        </Box>
                    </Box>
                )}

                {user?.facultyStatus === 'rejected' && (
                    <Box sx={{ mt: 2 }}>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<ContactSupport />}
                            href="mailto:admin@lms.com"
                            size="small"
                        >
                            Contact Administration
                        </Button>
                    </Box>
                )}
            </Alert>
        </Paper>
    );
};

export default PendingApprovalBanner;