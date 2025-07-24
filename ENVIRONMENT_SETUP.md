# Environment Configuration Guide

This project supports different environment configurations for local development and production deployment.

## Quick Start

### Local Development
```bash
# Setup local environment
npm run env:local

# Start development servers
npm run dev
```

### Production Deployment
```bash
# Setup production environment
npm run env:prod

# Build for production
npm run build
```

## Environment Files

### Backend Environment Files
- `.env.local` - Local development configuration
- `.env.production` - Production configuration template
- `.env` - Active configuration (auto-generated)

### Frontend Environment Files
- `.env.local` - Local development configuration
- `.env.production` - Production configuration
- `.env` - Active configuration (auto-generated)

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run env:local` | Setup local development environment |
| `npm run env:dev` | Alias for local environment |
| `npm run env:prod` | Setup production environment |
| `npm run env:production` | Alias for production environment |
| `npm run env:render` | Setup for Render deployment |

## Local Development Configuration

### Backend (.env.local)
- MongoDB: `mongodb://localhost:27017/lms` (database name 'lms' is in the URI)
- Port: `3001`
- JWT Secret: Development secret
- Frontend URL: `http://localhost:3000`
- Email: Gmail SMTP configuration

### Frontend (.env.local)
- API URL: `http://localhost:3001/api`
- Socket URL: `http://localhost:3001`
- Debug mode: Enabled
- Source maps: Enabled

## Production Configuration

### Backend Environment Variables (Set in Render)
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms_production
# Note: Database name 'lms_production' is specified in the URI above
JWT_SECRET=your_very_secure_production_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-production-app-password
EMAIL_FROM=your-production-email@gmail.com
CORS_ORIGIN=https://your-frontend-domain.com
SESSION_SECRET=your_very_secure_session_secret
```

### Frontend Production Settings
- API URL: `https://your-backend-domain.com/api`
- Source maps: Disabled
- Debug mode: Disabled
- Optimized for performance

## Render Deployment Setup

### 1. Backend Service (Node.js)
1. Connect your GitHub repository
2. Set build command: `cd backend && npm install`
3. Set start command: `cd backend && npm start`
4. Add environment variables from the list above

### 2. Frontend Service (Static Site)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `frontend/build`
4. Environment variables are built into the static files

### 3. Required Environment Variables for Render

#### Backend Service
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
FRONTEND_URL=https://your-frontend-url.onrender.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASS=...
EMAIL_FROM=...
CORS_ORIGIN=https://your-frontend-url.onrender.com
SESSION_SECRET=...
```

#### Frontend Service
Environment variables are automatically loaded from `.env.production` during build.

## Security Considerations

### Local Development
- Use development secrets (already configured)
- Enable debug logging
- Allow insecure connections

### Production
- Use strong, unique secrets
- Disable debug logging
- Enable HTTPS only
- Set secure CORS origins
- Use production database

## Troubleshooting

### Environment Not Loading
```bash
# Check if environment files exist
ls -la backend/.env*
ls -la frontend/.env*

# Manually setup environment
node scripts/env-setup.js local
```

### Production Build Issues
```bash
# Clean and rebuild
rm -rf frontend/build
npm run env:prod
npm run build
```

### Database Connection Issues
- Local: Ensure MongoDB is running on localhost:27017
- Production: Verify MONGODB_URI in Render environment variables

## Development Workflow

1. **Start Development**
   ```bash
   npm run env:local
   npm run dev
   ```

2. **Test Production Build Locally**
   ```bash
   npm run env:prod
   npm run build
   cd frontend && npx serve -s build
   ```

3. **Deploy to Production**
   - Push to GitHub
   - Render automatically builds and deploys
   - Verify environment variables in Render dashboard

## Environment Variables Reference

### Required for All Environments
- `NODE_ENV` - Environment type (development/production)
- `MONGODB_URI` - Database connection string (includes database name)
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - Frontend application URL

### Email Configuration
- `EMAIL_HOST` - SMTP server host
- `EMAIL_PORT` - SMTP server port
- `EMAIL_USER` - SMTP username
- `EMAIL_PASS` - SMTP password (use app password for Gmail)
- `EMAIL_FROM` - From email address

### Optional Configuration
- `CORS_ORIGIN` - Allowed CORS origins
- `SESSION_SECRET` - Session signing secret
- `MAX_FILE_SIZE` - Maximum file upload size
- `RATE_LIMIT_MAX_REQUESTS` - API rate limiting