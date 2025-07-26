console.log('🔐 Initializing passport configuration...');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const User = require('../models/User');

console.log('📦 Passport strategies loaded, checking environment variables...');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
console.log('🔍 Checking Google OAuth credentials:', {
  clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set'
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Registering Google OAuth strategy...');
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ 'socialAuth.googleId': profile.id });
      
      if (user) {
        return done(null, user);
      }

      // Check if user exists with same email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Link Google account to existing user
        user.socialAuth = user.socialAuth || {};
        user.socialAuth.googleId = profile.id;
        user.socialAuth.google = {
          id: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          picture: profile.photos[0]?.value
        };
        await user.save();
        return done(null, user);
      }

      // Create new user
      user = new User({
        username: profile.emails[0].value.split('@')[0] + '_' + Date.now(),
        email: profile.emails[0].value,
        profile: {
          firstName: profile.name.givenName || '',
          lastName: profile.name.familyName || '',
          avatar: profile.photos[0]?.value || ''
        },
        role: 'student', // Default role
        isEmailVerified: true, // Google emails are verified
        socialAuth: {
          googleId: profile.id,
          google: {
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            picture: profile.photos[0]?.value
          }
        }
      });

      await user.save();
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
  console.log('✅ Google OAuth strategy registered successfully');
} else {
  console.log('❌ Google OAuth strategy not registered - missing credentials');
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ 'socialAuth.githubId': profile.id });
      
      if (user) {
        return done(null, user);
      }

      // Check if user exists with same email
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await User.findOne({ email });
        
        if (user) {
          user.socialAuth = user.socialAuth || {};
          user.socialAuth.githubId = profile.id;
          user.socialAuth.github = {
            id: profile.id,
            username: profile.username,
            email: email,
            name: profile.displayName,
            avatar: profile.photos[0]?.value
          };
          await user.save();
          return done(null, user);
        }
      }

      // Create new user
      user = new User({
        username: profile.username + '_' + Date.now(),
        email: email || `${profile.username}@github.local`,
        profile: {
          firstName: profile.displayName?.split(' ')[0] || profile.username,
          lastName: profile.displayName?.split(' ').slice(1).join(' ') || '',
          avatar: profile.photos[0]?.value || ''
        },
        role: 'student',
        isEmailVerified: !!email,
        socialAuth: {
          githubId: profile.id,
          github: {
            id: profile.id,
            username: profile.username,
            email: email,
            name: profile.displayName,
            avatar: profile.photos[0]?.value
          }
        }
      });

      await user.save();
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name', 'picture.type(large)']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ 'socialAuth.facebookId': profile.id });
      
      if (user) {
        return done(null, user);
      }

      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await User.findOne({ email });
        
        if (user) {
          user.socialAuth = user.socialAuth || {};
          user.socialAuth.facebookId = profile.id;
          user.socialAuth.facebook = {
            id: profile.id,
            email: email,
            name: profile.displayName,
            picture: profile.photos[0]?.value
          };
          await user.save();
          return done(null, user);
        }
      }

      user = new User({
        username: (email?.split('@')[0] || 'facebook_user') + '_' + Date.now(),
        email: email || `facebook_${profile.id}@facebook.local`,
        profile: {
          firstName: profile.name.givenName || '',
          lastName: profile.name.familyName || '',
          avatar: profile.photos[0]?.value || ''
        },
        role: 'student',
        isEmailVerified: !!email,
        socialAuth: {
          facebookId: profile.id,
          facebook: {
            id: profile.id,
            email: email,
            name: profile.displayName,
            picture: profile.photos[0]?.value
          }
        }
      });

      await user.save();
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
}

// Microsoft OAuth Strategy
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: "/api/auth/microsoft/callback",
    scope: ['user.read']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ 'socialAuth.microsoftId': profile.id });
      
      if (user) {
        return done(null, user);
      }

      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await User.findOne({ email });
        
        if (user) {
          user.socialAuth = user.socialAuth || {};
          user.socialAuth.microsoftId = profile.id;
          user.socialAuth.microsoft = {
            id: profile.id,
            email: email,
            name: profile.displayName
          };
          await user.save();
          return done(null, user);
        }
      }

      user = new User({
        username: (email?.split('@')[0] || 'microsoft_user') + '_' + Date.now(),
        email: email || `microsoft_${profile.id}@microsoft.local`,
        profile: {
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
        },
        role: 'student',
        isEmailVerified: !!email,
        socialAuth: {
          microsoftId: profile.id,
          microsoft: {
            id: profile.id,
            email: email,
            name: profile.displayName
          }
        }
      });

      await user.save();
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
}

module.exports = passport;