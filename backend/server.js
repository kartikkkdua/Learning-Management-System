const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { authenticateToken } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://learning-management-system-3ksq.onrender.com/"] 
      : ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL || "https://learning-management-system-3ksq.onrender.com/")
    : "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
    }
  });
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms')
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('💡 Make sure MongoDB is running or check your connection string');
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', authenticateToken, require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/faculties', require('./routes/faculties'));
app.use('/api/students', require('./routes/students'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/waitlist', require('./routes/waitlist'));
app.use('/api/discussions', require('./routes/discussions'));
app.use('/api/email', require('./routes/email'));
app.use('/api/email-config', require('./routes/email-config'));
app.use('/api/email-campaigns', require('./routes/emailCampaigns'));
app.use('/api/email-templates', require('./routes/emailTemplates'));
app.use('/api/email-analytics', require('./routes/emailAnalytics'));
app.use('/api/grading', require('./routes/grading'));
app.use('/api/rubrics', require('./routes/rubrics'));
app.use('/api/grade-categories', require('./routes/gradeCategories'));
app.use('/api/transcripts', require('./routes/transcripts'));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their role-based room
  socket.on('join', (userData) => {
    socket.join(userData.role); // Join role-based room (admin, faculty, student)
    socket.join(`user_${userData.id}`); // Join personal room
    console.log(`User ${userData.username} joined rooms: ${userData.role}, user_${userData.id}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

app.get('/', (req, res) => {
  res.json({ message: 'LMS Backend API is running!' });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
