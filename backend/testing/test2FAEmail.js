require('dotenv').config(); // Load environment variables first
const mongoose = require('mongoose');
const User = require('../models/User');
const emailService = require('../services/emailService');

async function test2FAEmail() {
    console.log('🔐 Testing 2FA Email Sending\n');

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms');
        console.log('✅ Connected to MongoDB');

        // Find a test user or create one
        let user = await User.findOne({ email: 'test2fa@example.com' });

        if (!user) {
            console.log('Creating test user...');
            user = new User({
                username: 'test2fa',
                email: 'test2fa@example.com',
                password: 'password123',
                role: 'student',
                profile: {
                    firstName: 'Test',
                    lastName: 'User'
                },
                twoFactorEnabled: true,
                twoFactorMethod: 'email'
            });
            await user.save();
            console.log('✅ Test user created');
        }

        // Generate 2FA code
        console.log('\n📱 Generating 2FA code...');
        const code = user.generate2FACode();
        await user.save();
        console.log('✅ 2FA code generated:', code);

        // Test email connection first
        console.log('\n📧 Testing email connection...');
        const connectionTest = await emailService.testConnection();
        console.log('Email connection result:', connectionTest);

        // Send 2FA email
        console.log('\n📨 Sending 2FA email...');
        const emailResult = await emailService.send2FACode(user, code);
        console.log('Email send result:', emailResult);

        if (emailResult.success) {
            console.log('✅ 2FA email sent successfully!');
            console.log('📧 Check your email for the verification code');
        } else {
            console.log('❌ Failed to send 2FA email:', emailResult.error);
        }

        // Validate the code
        console.log('\n🔍 Testing code validation...');
        const validation = user.validate2FACode(code);
        console.log('Code validation result:', validation);

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the test
test2FAEmail();