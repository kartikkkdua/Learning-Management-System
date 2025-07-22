import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Security, 
  Email, 
  Smartphone, 
  Key, 
  CheckCircle, 
  Warning 
} from '@mui/icons-material';
import { API_URL } from '../../config/api';

const TwoFactorSettings = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const handleToggle2FA = async (enable) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/auth/toggle-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          enable,
          method: 'email'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        if (onUpdate) {
          onUpdate({
            ...user,
            twoFactorEnabled: data.twoFactorEnabled,
            twoFactorMethod: data.twoFactorMethod
          });
        }
      } else {
        setError(data.message || 'Failed to update 2FA settings');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setConfirmDialog(false);
      setPendingAction(null);
    }
  };

  const handleSwitchChange = (event) => {
    const enable = event.target.checked;
    setPendingAction(enable);
    setConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (pendingAction !== null) {
      handleToggle2FA(pendingAction);
    }
  };

  const handleCancel = () => {
    setConfirmDialog(false);
    setPendingAction(null);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Security color="primary" />
        <Typography variant="h6">
          Two-Factor Authentication
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add an extra layer of security to your account by enabling two-factor authentication.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="subtitle1">
            Enable Two-Factor Authentication
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.twoFactorEnabled 
              ? `Currently enabled via ${user.twoFactorMethod}`
              : 'Currently disabled'
            }
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={user?.twoFactorEnabled || false}
              onChange={handleSwitchChange}
              disabled={loading}
            />
          }
          label=""
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" gutterBottom>
        Available Methods
      </Typography>

      <List>
        <ListItem>
          <ListItemIcon>
            <Email color={user?.twoFactorMethod === 'email' ? 'primary' : 'disabled'} />
          </ListItemIcon>
          <ListItemText
            primary="Email Verification"
            secondary="Receive verification codes via email"
          />
          {user?.twoFactorMethod === 'email' && (
            <CheckCircle color="success" />
          )}
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <Smartphone color="disabled" />
          </ListItemIcon>
          <ListItemText
            primary="SMS Verification"
            secondary="Receive verification codes via SMS (Coming Soon)"
          />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <Key color="disabled" />
          </ListItemIcon>
          <ListItemText
            primary="Authenticator App"
            secondary="Use Google Authenticator or similar apps (Coming Soon)"
          />
        </ListItem>
      </List>

      <Box mt={3} p={2} bgcolor="info.light" borderRadius={1}>
        <Typography variant="body2" color="info.contrastText">
          <strong>Security Tip:</strong> Two-factor authentication significantly improves your account security. 
          We recommend keeping it enabled at all times.
        </Typography>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={handleCancel}>
        <DialogTitle>
          {pendingAction ? 'Enable' : 'Disable'} Two-Factor Authentication
        </DialogTitle>
        <DialogContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Warning color={pendingAction ? 'info' : 'warning'} />
            <Typography>
              {pendingAction 
                ? 'Are you sure you want to enable two-factor authentication? You will need to verify your identity with a code sent to your email for future logins.'
                : 'Are you sure you want to disable two-factor authentication? This will make your account less secure.'
              }
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TwoFactorSettings;