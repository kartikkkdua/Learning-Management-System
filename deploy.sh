#!/bin/bash

echo "🚀 Starting LMS Deployment to Vercel..."

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Build the frontend
echo "🏗️ Building frontend..."
cd frontend
npm run build
cd ..

# Update environment variables
echo "🔧 Setting up environment variables..."
echo "Please set the following environment variables in Vercel:"
echo "- MONGODB_URI: Your MongoDB connection string"
echo "- JWT_SECRET: Your JWT secret key"
echo "- NODE_ENV: production"
echo "- FRONTEND_URL: Your Vercel app URL"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "Run: vercel --prod"

echo "✅ Deployment preparation complete!"
echo "Next steps:"
echo "1. Install Vercel CLI: npm i -g vercel"
echo "2. Login to Vercel: vercel login"
echo "3. Deploy: vercel --prod"
echo "4. Set environment variables in Vercel dashboard"