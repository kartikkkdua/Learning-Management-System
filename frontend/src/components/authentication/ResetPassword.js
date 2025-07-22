import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    ThemeProvider,
    createTheme,
    CssBaseline
} from '@mui/material';
import { Lock, Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import { API_URL } from '../../config/api';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

const ResetPassword = ({ token: propToken, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [token, setToken] = useState(propToken || '');

    useEffect(() => {
        // If no token provided as prop, check URL parameters
        if (!propToken) {
            const urlParams = new URLSearchParams(window.location.search);
            const urlToken = urlParams.get('token');
            if (urlToken) {
                setToken(urlToken);
                validateToken(urlToken);
            } else {
                setError('Invalid reset link. Please request a new password reset.');
            }
        } else {
            validateToken(propToken);
        }
    }, [propToken]);

    const validateToken = async (tokenToValidate) => {
        try {
            const response = await fetch(`${API_URL}/auth/validate-reset-token/${tokenToValidate}`);
            const data = await response.json();

            if (!data.success) {
                if (data.message.includes('expired')) {
                    setError('This password reset link has expired. Please request a new password reset.');
                } else {
                    setError('This password reset link is invalid or has already been used. Please request a new password reset.');
                }
            }
        } catch (error) {
            setError('Unable to validate reset link. Please try again or request a new password reset.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const validateForm = () => {
        if (!formData.newPassword) {
            setError('Password is required');
            return false;
        }

        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    newPassword: formData.newPassword
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess();
                    } else {
                        window.location.href = '/';
                    }
                }, 3000);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: 'grey' };

        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 2) return { strength, label: 'Weak', color: 'error' };
        if (strength <= 4) return { strength, label: 'Medium', color: 'warning' };
        return { strength, label: 'Strong', color: 'success' };
    };

    const passwordStrength = getPasswordStrength(formData.newPassword);

    const isStandalone = !onSuccess && !onCancel;

    const content = success ? (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom color="success.main">
                    Password Reset Successful!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Your password has been successfully reset.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    A confirmation email has been sent to your email address. The reset link you used has been automatically invalidated for security.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => {
                        if (onSuccess) {
                            onSuccess();
                        } else {
                            window.location.href = '/';
                        }
                    }}
                    size="large"
                >
                    Go to Login
                </Button>
            </Paper>
        </Container>
    ) : error && (error.includes('expired') || error.includes('invalid') || error.includes('already been used')) ? (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ color: 'error.main', mb: 2 }}>
                    <Typography variant="h1" sx={{ fontSize: 60 }}>⚠️</Typography>
                </Box>
                <Typography variant="h4" gutterBottom color="error.main">
                    Invalid Reset Link
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {error}
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => {
                        if (onCancel) {
                            onCancel();
                        } else {
                            window.location.href = '/';
                        }
                    }}
                    size="large"
                    sx={{ mr: 2 }}
                >
                    Back to Login
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => {
                        // Trigger forgot password flow
                        if (onCancel) {
                            onCancel();
                        } else {
                            window.location.href = '/?forgot=true';
                        }
                    }}
                    size="large"
                >
                    Request New Reset Link
                </Button>
            </Paper>
        </Container>
    ) : (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box textAlign="center" mb={3}>
                    <Lock sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" gutterBottom>
                        Reset Your Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Enter your new password below
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        name="newPassword"
                        label="New Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={handleChange}
                        variant="outlined"
                        margin="normal"
                        disabled={loading}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {formData.newPassword && (
                        <Box sx={{ mt: 1, mb: 2 }}>
                            <Typography variant="caption" color={`${passwordStrength.color}.main`}>
                                Password strength: {passwordStrength.label}
                            </Typography>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 4,
                                    bgcolor: 'grey.300',
                                    borderRadius: 2,
                                    mt: 0.5
                                }}
                            >
                                <Box
                                    sx={{
                                        width: `${(passwordStrength.strength / 6) * 100}%`,
                                        height: '100%',
                                        bgcolor: `${passwordStrength.color}.main`,
                                        borderRadius: 2,
                                        transition: 'width 0.3s ease'
                                    }}
                                />
                            </Box>
                        </Box>
                    )}

                    <TextField
                        fullWidth
                        name="confirmPassword"
                        label="Confirm New Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        variant="outlined"
                        margin="normal"
                        disabled={loading}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading || !formData.newPassword || !formData.confirmPassword}
                        startIcon={loading ? <CircularProgress size={20} /> : <Lock />}
                        sx={{ mt: 3, py: 1.5 }}
                    >
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                    </Button>

                    <Button
                        fullWidth
                        variant="text"
                        onClick={() => {
                            if (onCancel) {
                                onCancel();
                            } else {
                                window.location.href = '/';
                            }
                        }}
                        sx={{ mt: 2 }}
                        disabled={loading}
                    >
                        Back to Login
                    </Button>
                </Box>
            </Paper>
        </Container>
    );

    // Wrap with ThemeProvider if used as standalone page
    if (isStandalone) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {content}
            </ThemeProvider>
        );
    }

    return content;
};

export default ResetPassword;