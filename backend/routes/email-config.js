const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Check email configuration
router.get('/config-check', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied - Admin only' });
    }

    const config = {
      EMAIL_HOST: process.env.EMAIL_HOST || 'Not set',
      EMAIL_PORT: process.env.EMAIL_PORT || 'Not set',
      EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set',
      EMAIL_FROM: process.env.EMAIL_FROM || 'Not set'
    };

    const issues = [];
    
    if (!process.env.EMAIL_HOST) issues.push('EMAIL_HOST is not configured');
    if (!process.env.EMAIL_PORT) issues.push('EMAIL_PORT is not configured');
    if (!process.env.EMAIL_USER) issues.push('EMAIL_USER is not configured');
    if (!process.env.EMAIL_PASS) issues.push('EMAIL_PASS is not configured');
    if (!process.env.EMAIL_FROM) issues.push('EMAIL_FROM is not configured');

    res.json({
      config,
      issues,
      isConfigured: issues.length === 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;