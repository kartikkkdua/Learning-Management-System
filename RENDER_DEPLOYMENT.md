# Render Deployment Guide

This guide will help you deploy the LMS application to Render.

## Prerequisites

1. A Render account (https://render.com)
2. A MongoDB Atlas account for the database
3. Gmail account with App Password for email functionality

## Step 1: Prepare MongoDB Atlas

1. Create a MongoDB Atlas cluster
2. Create a database user
3. Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/lms`)

## Step 2: Deploy Backend

1. Go to Render Dashboard
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `lms-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (or paid for better performance)

5. Set Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms
   JWT_SECRET=your-super-secure-jwt-secret-key
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   EMAIL_FROM=your-email@gmail.com
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

6. Deploy the service

## Step 3: Deploy Frontend

1. Go to Render Dashboard
2. Click "New" → "Static Site"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `lms-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`

5. Set Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   REACT_APP_SOCKET_URL=https://your-backend-url.onrender.com
   GENERATE_SOURCEMAP=false
   CI=false
   ```

6. Deploy the service

## Step 4: Update Environment Variables

After both services are deployed:

1. Update the backend's `FRONTEND_URL` with your actual frontend URL
2. Update the frontend's `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL` with your actual backend URL

## Step 5: Test the Deployment

1. Visit your frontend URL
2. Try to register a new account
3. Test login functionality
4. Verify email functionality works

## Important Notes

- **Free Tier Limitations**: Render free tier services sleep after 15 minutes of inactivity
- **Database**: Use MongoDB Atlas (free tier available)
- **Email**: Gmail App Passwords required (not regular password)
- **CORS**: Make sure frontend and backend URLs are correctly configured
- **Environment Variables**: Never commit sensitive data to Git

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Check that FRONTEND_URL is set correctly in backend
2. **Database Connection**: Verify MongoDB URI and network access
3. **Email Not Working**: Check Gmail App Password and settings
4. **Build Failures**: Check that all dependencies are in package.json

### Logs:

- Check Render service logs for detailed error messages
- Backend logs show database connection and API errors
- Frontend build logs show compilation errors

## Security Checklist

- [ ] Strong JWT secret (at least 32 characters)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Gmail App Password used (not regular password)
- [ ] Environment variables set in Render (not in code)
- [ ] HTTPS enabled (automatic with Render)

## Performance Tips

- Consider upgrading to paid plans for better performance
- Use MongoDB Atlas in the same region as Render services
- Enable compression in Express.js for better response times
- Monitor service metrics in Render dashboard