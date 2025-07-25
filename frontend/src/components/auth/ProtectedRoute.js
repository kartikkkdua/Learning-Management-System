import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import authService from '../../services/authService';

const ProtectedRoute = ({ children, requiredRole = null, requiredRoles = null }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check if user is authenticated
                if (!authService.isAuthenticated()) {
                    window.location.href = '/login';
                    return;
                }

                // Check role authorization if required
                if (requiredRole) {
                    if (!authService.hasRole(requiredRole)) {
                        window.location.href = '/unauthorized';
                        return;
                    }
                }

                if (requiredRoles) {
                    if (!authService.hasAnyRole(requiredRoles)) {
                        window.location.href = '/unauthorized';
                        return;
                    }
                }

                // Try to fetch current user profile to validate token
                try {
                    await authService.getProfile();
                    setAuthenticated(true);
                    setAuthorized(true);
                } catch (error) {
                    // Token might be expired or invalid
                    authService.logout();
                    return;
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                authService.logout();
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [requiredRole, requiredRoles]);

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    gap: 2
                }}
            >
                <CircularProgress size={60} />
                <Typography variant="h6" color="text.secondary">
                    Loading...
                </Typography>
            </Box>
        );
    }

    if (!authenticated || !authorized) {
        return null; // Redirect will happen in useEffect
    }

    return children;
};

export default ProtectedRoute;