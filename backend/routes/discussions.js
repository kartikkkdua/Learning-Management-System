const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');
const Course = require('../models/Course');
const User = require('../models/User');

// Get discussions for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    
    const query = { course: req.params.courseId };
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const discussions = await Discussion.find(query)
      .populate('author', 'profile.firstName profile.lastName role')
      .populate('posts.author', 'profile.firstName profile.lastName role')
      .populate('posts.replies.author', 'profile.firstName profile.lastName role')
      .sort({ isPinned: -1, lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Discussion.countDocuments(query);
    
    res.json({
      discussions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalDiscussions: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single discussion
router.get('/:discussionId', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId)
      .populate('author', 'profile.firstName profile.lastName role')
      .populate('posts.author', 'profile.firstName profile.lastName role')
      .populate('posts.replies.author', 'profile.firstName profile.lastName role')
      .populate('course', 'courseCode title');
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Increment view count
    discussion.viewCount += 1;
    await discussion.save();
    
    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new discussion
router.post('/', async (req, res) => {
  try {
    const { courseId, title, description, category, authorId, authorType, initialPost } = req.body;
    
    if (!courseId || !title || !authorId || !authorType) {
      return res.status(400).json({ message: 'Course ID, title, author ID, and author type are required' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const discussion = new Discussion({
      course: courseId,
      title,
      description,
      category: category || 'general',
      author: authorId,
      authorType,
      posts: initialPost ? [{
        author: authorId,
        authorType,
        content: initialPost
      }] : []
    });
    
    await discussion.save();
    
    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('author', 'profile.firstName profile.lastName role')
      .populate('posts.author', 'profile.firstName profile.lastName role')
      .populate('course', 'courseCode title');
    
    res.status(201).json(populatedDiscussion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add post to discussion
router.post('/:discussionId/posts', async (req, res) => {
  try {
    const { authorId, authorType, content, attachments } = req.body;
    
    if (!authorId || !authorType || !content) {
      return res.status(400).json({ message: 'Author ID, author type, and content are required' });
    }
    
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    if (discussion.isLocked) {
      return res.status(403).json({ message: 'Discussion is locked' });
    }
    
    const newPost = {
      author: authorId,
      authorType,
      content,
      attachments: attachments || []
    };
    
    discussion.posts.push(newPost);
    discussion.lastActivity = new Date();
    await discussion.save();
    
    const updatedDiscussion = await Discussion.findById(req.params.discussionId)
      .populate('posts.author', 'profile.firstName profile.lastName role');
    
    const addedPost = updatedDiscussion.posts[updatedDiscussion.posts.length - 1];
    
    res.status(201).json(addedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add reply to post
router.post('/:discussionId/posts/:postId/replies', async (req, res) => {
  try {
    const { authorId, authorType, content } = req.body;
    
    if (!authorId || !authorType || !content) {
      return res.status(400).json({ message: 'Author ID, author type, and content are required' });
    }
    
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    if (discussion.isLocked) {
      return res.status(403).json({ message: 'Discussion is locked' });
    }
    
    const post = discussion.posts.id(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const newReply = {
      author: authorId,
      authorType,
      content
    };
    
    post.replies.push(newReply);
    discussion.lastActivity = new Date();
    await discussion.save();
    
    const updatedDiscussion = await Discussion.findById(req.params.discussionId)
      .populate('posts.replies.author', 'profile.firstName profile.lastName role');
    
    const updatedPost = updatedDiscussion.posts.id(req.params.postId);
    const addedReply = updatedPost.replies[updatedPost.replies.length - 1];
    
    res.status(201).json(addedReply);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Like/Unlike post
router.post('/:discussionId/posts/:postId/like', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    const post = discussion.posts.id(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const existingLike = post.likes.find(like => like.user.toString() === userId);
    
    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(like => like.user.toString() !== userId);
    } else {
      // Like
      post.likes.push({ user: userId });
    }
    
    await discussion.save();
    
    res.json({
      liked: !existingLike,
      likeCount: post.likes.length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Pin/Unpin discussion (faculty/admin only)
router.patch('/:discussionId/pin', async (req, res) => {
  try {
    const { isPinned } = req.body;
    
    const discussion = await Discussion.findByIdAndUpdate(
      req.params.discussionId,
      { isPinned: isPinned },
      { new: true }
    );
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    res.json({ message: `Discussion ${isPinned ? 'pinned' : 'unpinned'} successfully` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lock/Unlock discussion (faculty/admin only)
router.patch('/:discussionId/lock', async (req, res) => {
  try {
    const { isLocked } = req.body;
    
    const discussion = await Discussion.findByIdAndUpdate(
      req.params.discussionId,
      { isLocked: isLocked },
      { new: true }
    );
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    res.json({ message: `Discussion ${isLocked ? 'locked' : 'unlocked'} successfully` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete discussion (author or admin only)
router.delete('/:discussionId', async (req, res) => {
  try {
    const discussion = await Discussion.findByIdAndDelete(req.params.discussionId);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get discussion statistics
router.get('/course/:courseId/stats', async (req, res) => {
  try {
    const stats = await Discussion.aggregate([
      { $match: { course: mongoose.Types.ObjectId(req.params.courseId) } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalPosts: { $sum: { $size: '$posts' } },
          totalViews: { $sum: '$viewCount' }
        }
      }
    ]);
    
    const totalDiscussions = await Discussion.countDocuments({ course: req.params.courseId });
    const activeDiscussions = await Discussion.countDocuments({ 
      course: req.params.courseId,
      lastActivity: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    res.json({
      totalDiscussions,
      activeDiscussions,
      byCategory: stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;