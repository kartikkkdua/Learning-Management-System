# 🚀 LMS Deployment Guide - Vercel

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas** - Set up a cloud MongoDB database
3. **Node.js** - Version 16 or higher
4. **Git Repository** - Push your code to GitHub/GitLab

## 📋 Step-by-Step Deployment

### Step 1: Prepare Your Database

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string

2. **Update Connection String**
   - Replace `<password>` with your database password
   - Replace `<dbname>` with your database name
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/lms?retryWrites=true&w=majority`

### Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 3: Login to Vercel

```bash
vercel login
```

### Step 4: Deploy Your Application

1. **Navigate to your project directory**
```bash
cd your-lms-project
```

2. **Deploy to Vercel**
```bash
vercel --prod
```

3. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? **Select your account**
   - Link to existing project? **N**
   - Project name? **your-lms-app** (or your preferred name)
   - Directory? **./** (current directory)

### Step 5: Configure Environment Variables

In your Vercel dashboard, go to your project settings and add these environment variables:

#### Required Environment Variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Environment
NODE_ENV=production

# Frontend URL (replace with your actual Vercel URL)
FRONTEND_URL=https://your-lms-app.vercel.app
```

### Step 6: Update Frontend Environment

Update `frontend/.env.production` with your actual Vercel URL:

```env
REACT_APP_API_URL=https://your-lms-app.vercel.app/api
REACT_APP_SOCKET_URL=https://your-lms-app.vercel.app
GENERATE_SOURCEMAP=false
```

### Step 7: Redeploy with Environment Variables

After setting environment variables, redeploy:

```bash
vercel --prod
```

## 🔧 Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    },
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/build/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🚨 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
**Solution:** 
- Check your MongoDB Atlas connection string
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify username and password

### Issue 2: API Routes Not Working
**Solution:**
- Check that your API routes start with `/api/`
- Verify the `vercel.json` routing configuration
- Check server logs in Vercel dashboard

### Issue 3: Socket.IO Connection Issues
**Solution:**
- Ensure CORS is properly configured for your domain
- Check that Socket.IO is using the correct transport methods
- Verify the SOCKET_URL in your frontend configuration

### Issue 4: Build Failures
**Solution:**
- Check that all dependencies are listed in package.json
- Ensure build scripts are correct
- Check for any TypeScript or ESLint errors

## 📱 Testing Your Deployment

1. **Visit your Vercel URL**
2. **Test user registration and login**
3. **Test real-time notifications**
4. **Verify all features work correctly**
5. **Check browser console for errors**

## 🔄 Continuous Deployment

Once set up, Vercel will automatically deploy when you push to your main branch:

1. **Make changes to your code**
2. **Commit and push to GitHub**
3. **Vercel automatically deploys**
4. **Check deployment status in Vercel dashboard**

## 📊 Monitoring

### Vercel Dashboard
- Monitor deployment status
- View build logs
- Check function execution logs
- Monitor performance metrics

### Application Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor API response times
- Track user engagement
- Set up uptime monitoring

## 🔐 Security Considerations

1. **Environment Variables**
   - Never commit secrets to Git
   - Use strong JWT secrets
   - Rotate secrets regularly

2. **Database Security**
   - Use MongoDB Atlas security features
   - Enable authentication
   - Whitelist only necessary IPs

3. **CORS Configuration**
   - Only allow your domain
   - Don't use wildcards in production

## 🎉 Success!

Your LMS is now deployed and ready for use! 

**Your app is available at:** `https://your-lms-app.vercel.app`

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review MongoDB Atlas logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly