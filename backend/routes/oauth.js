const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Helper function to handle OAuth success
const handleOAuthSuccess = (req, res) => {
  try {
    const token = generateToken(req.user);
    const user = {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      profile: req.user.profile,
      socialAuth: req.user.socialAuth
    };

    // Redirect to callback page with success data
    const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(user))}`;
    res.redirect(callbackUrl);
  } catch (error) {
    console.error('OAuth success handler error:', error);
    const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?error=${encodeURIComponent('Authentication failed')}`;
    res.redirect(callbackUrl);
  }
};

// Helper function to handle OAuth failure
const handleOAuthFailure = (req, res) => {
  const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?error=${encodeURIComponent('Authentication failed')}`;
  res.redirect(callbackUrl);
};

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failure' }),
  handleOAuthSuccess
);

// GitHub OAuth routes
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/failure' }),
  handleOAuthSuccess
);

// Facebook OAuth routes
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth/failure' }),
  handleOAuthSuccess
);

// Microsoft OAuth routes
router.get('/microsoft',
  passport.authenticate('microsoft', { scope: ['user.read'] })
);

router.get('/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: '/auth/failure' }),
  handleOAuthSuccess
);

// OAuth failure route
router.get('/failure', (req, res) => {
  handleOAuthFailure(req, res);
});

// Link social account to existing user (authenticated route)
router.post('/link/:provider', async (req, res) => {
  try {
    // This would require additional implementation for linking accounts
    // after the user is already logged in
    res.status(501).json({ message: 'Account linking not yet implemented' });
  } catch (error) {
    console.error('Account linking error:', error);
    res.status(500).json({ message: 'Failed to link account' });
  }
});

// Unlink social account (authenticated route)
router.delete('/unlink/:provider', async (req, res) => {
  try {
    // This would require additional implementation for unlinking accounts
    res.status(501).json({ message: 'Account unlinking not yet implemented' });
  } catch (error) {
    console.error('Account unlinking error:', error);
    res.status(500).json({ message: 'Failed to unlink account' });
  }
});

module.exports = router;