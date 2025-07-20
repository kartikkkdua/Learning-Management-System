import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  Badge,
  Divider,
  Collapse,
  MenuItem
} from '@mui/material';
import {
  Forum,
  Add,
  Reply,
  ThumbUp,
  Visibility,
  PushPin,
  Lock,
  ExpandMore,
  ExpandLess,
  Send,
  Person,
  Schedule
} from '@mui/icons-material';
import axios from 'axios';

const DiscussionForum = ({ user, courseId }) => {
  const [discussions, setDiscussions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newDiscussionDialog, setNewDiscussionDialog] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    description: '',
    category: 'general',
    initialPost: ''
  });
  const [newPost, setNewPost] = useState('');
  const [replyTexts, setReplyTexts] = useState({});

  useEffect(() => {
    if (courseId) {
      fetchDiscussions();
    }
  }, [courseId, selectedCategory]);

  const fetchDiscussions = async () => {
    try {
      const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
      const response = await axios.get(`http://localhost:3001/api/discussions/course/${courseId}${params}`);
      setDiscussions(response.data.discussions);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setDiscussions([]);
    }
  };

  const createDiscussion = async () => {
    try {
      await axios.post('http://localhost:3001/api/discussions', {
        courseId,
        title: newDiscussion.title,
        description: newDiscussion.description,
        category: newDiscussion.category,
        authorId: user.id || user._id,
        authorType: user.role,
        initialPost: newDiscussion.initialPost
      });
      
      setNewDiscussionDialog(false);
      setNewDiscussion({ title: '', description: '', category: 'general', initialPost: '' });
      fetchDiscussions();
    } catch (error) {
      console.error('Error creating discussion:', error);
      alert('Failed to create discussion');
    }
  };

  const addPost = async (discussionId) => {
    try {
      await axios.post(`http://localhost:3001/api/discussions/${discussionId}/posts`, {
        authorId: user.id || user._id,
        authorType: user.role,
        content: newPost
      });
      
      setNewPost('');
      if (selectedDiscussion && selectedDiscussion._id === discussionId) {
        fetchDiscussionDetails(discussionId);
      }
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post');
    }
  };

  const addReply = async (discussionId, postId) => {
    try {
      const replyText = replyTexts[postId];
      if (!replyText) return;
      
      await axios.post(`http://localhost:3001/api/discussions/${discussionId}/posts/${postId}/replies`, {
        authorId: user.id || user._id,
        authorType: user.role,
        content: replyText
      });
      
      setReplyTexts({ ...replyTexts, [postId]: '' });
      fetchDiscussionDetails(discussionId);
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply');
    }
  };

  const likePost = async (discussionId, postId) => {
    try {
      await axios.post(`http://localhost:3001/api/discussions/${discussionId}/posts/${postId}/like`, {
        userId: user.id || user._id
      });
      
      if (selectedDiscussion && selectedDiscussion._id === discussionId) {
        fetchDiscussionDetails(discussionId);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const fetchDiscussionDetails = async (discussionId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/discussions/${discussionId}`);
      setSelectedDiscussion(response.data);
    } catch (error) {
      console.error('Error fetching discussion details:', error);
    }
  };

  const togglePostExpansion = (postId) => {
    setExpandedPosts({
      ...expandedPosts,
      [postId]: !expandedPosts[postId]
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'default',
      assignments: 'primary',
      lectures: 'secondary',
      exams: 'error',
      projects: 'success',
      announcements: 'warning'
    };
    return colors[category] || 'default';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getAuthorName = (author) => {
    if (author.profile?.firstName && author.profile?.lastName) {
      return `${author.profile.firstName} ${author.profile.lastName}`;
    }
    return author.username || 'Unknown User';
  };

  if (selectedDiscussion) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button 
            onClick={() => setSelectedDiscussion(null)}
            sx={{ mr: 2 }}
          >
            ← Back to Discussions
          </Button>
          <Typography variant="h5" flexGrow={1}>
            {selectedDiscussion.title}
          </Typography>
          {selectedDiscussion.isPinned && <PushPin color="primary" sx={{ mr: 1 }} />}
          {selectedDiscussion.isLocked && <Lock color="error" />}
        </Box>

        {selectedDiscussion.description && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="body1">
              {selectedDiscussion.description}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mt={2}>
              <Chip 
                label={selectedDiscussion.category.toUpperCase()}
                color={getCategoryColor(selectedDiscussion.category)}
                size="small"
              />
              <Typography variant="caption" color="textSecondary">
                Started by {getAuthorName(selectedDiscussion.author)} • {formatTimeAgo(selectedDiscussion.createdAt)}
              </Typography>
              <Chip 
                icon={<Visibility />}
                label={`${selectedDiscussion.viewCount} views`}
                size="small"
                variant="outlined"
              />
            </Box>
          </Paper>
        )}

        {/* Posts */}
        <List>
          {selectedDiscussion.posts.map((post, index) => (
            <React.Fragment key={post._id}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar>
                    {getAuthorName(post.author)[0].toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2">
                        {getAuthorName(post.author)}
                      </Typography>
                      <Chip 
                        label={post.authorType.toUpperCase()}
                        size="small"
                        color={post.authorType === 'faculty' ? 'primary' : 'default'}
                      />
                      <Typography variant="caption" color="textSecondary">
                        {formatTimeAgo(post.createdAt)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                        {post.content}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={2}>
                        <Button
                          size="small"
                          startIcon={<ThumbUp />}
                          onClick={() => likePost(selectedDiscussion._id, post._id)}
                          color={post.likes?.some(like => like.user === (user.id || user._id)) ? 'primary' : 'default'}
                        >
                          {post.likes?.length || 0}
                        </Button>
                        
                        <Button
                          size="small"
                          startIcon={<Reply />}
                          onClick={() => togglePostExpansion(post._id)}
                        >
                          Reply ({post.replies?.length || 0})
                        </Button>
                      </Box>

                      {/* Replies */}
                      <Collapse in={expandedPosts[post._id]}>
                        <Box sx={{ ml: 4, mt: 2 }}>
                          {post.replies?.map((reply) => (
                            <Box key={reply._id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Avatar sx={{ width: 24, height: 24 }}>
                                  {getAuthorName(reply.author)[0].toUpperCase()}
                                </Avatar>
                                <Typography variant="caption" fontWeight="bold">
                                  {getAuthorName(reply.author)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {formatTimeAgo(reply.createdAt)}
                                </Typography>
                              </Box>
                              <Typography variant="body2">
                                {reply.content}
                              </Typography>
                            </Box>
                          ))}
                          
                          {/* Reply Input */}
                          <Box display="flex" gap={1} mt={2}>
                            <TextField
                              size="small"
                              placeholder="Write a reply..."
                              value={replyTexts[post._id] || ''}
                              onChange={(e) => setReplyTexts({
                                ...replyTexts,
                                [post._id]: e.target.value
                              })}
                              fullWidth
                              multiline
                              maxRows={3}
                            />
                            <IconButton
                              onClick={() => addReply(selectedDiscussion._id, post._id)}
                              disabled={!replyTexts[post._id]?.trim()}
                              color="primary"
                            >
                              <Send />
                            </IconButton>
                          </Box>
                        </Box>
                      </Collapse>
                    </Box>
                  }
                />
              </ListItem>
              {index < selectedDiscussion.posts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {/* Add New Post */}
        {!selectedDiscussion.isLocked && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add a Post
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Write your post here..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={() => addPost(selectedDiscussion._id)}
              disabled={!newPost.trim()}
              startIcon={<Send />}
            >
              Post
            </Button>
          </Paper>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Discussion Forum
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setNewDiscussionDialog(true)}
        >
          New Discussion
        </Button>
      </Box>

      {/* Category Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={selectedCategory} 
          onChange={(e, newValue) => setSelectedCategory(newValue)}
          sx={{ px: 2 }}
        >
          <Tab label="All" value="all" />
          <Tab label="General" value="general" />
          <Tab label="Assignments" value="assignments" />
          <Tab label="Lectures" value="lectures" />
          <Tab label="Exams" value="exams" />
          <Tab label="Projects" value="projects" />
        </Tabs>
      </Paper>

      {/* Discussions List */}
      <Grid container spacing={3}>
        {discussions.map((discussion) => (
          <Grid item xs={12} key={discussion._id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { elevation: 4 }
              }}
              onClick={() => fetchDiscussionDetails(discussion._id)}
            >
              <CardContent>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Avatar>
                    {getAuthorName(discussion.author)[0].toUpperCase()}
                  </Avatar>
                  
                  <Box flexGrow={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {discussion.isPinned && <PushPin color="primary" fontSize="small" />}
                      {discussion.isLocked && <Lock color="error" fontSize="small" />}
                      <Typography variant="h6">
                        {discussion.title}
                      </Typography>
                      <Chip 
                        label={discussion.category.toUpperCase()}
                        color={getCategoryColor(discussion.category)}
                        size="small"
                      />
                    </Box>
                    
                    {discussion.description && (
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {discussion.description.length > 150 
                          ? `${discussion.description.substring(0, 150)}...`
                          : discussion.description
                        }
                      </Typography>
                    )}
                    
                    <Box display="flex" alignItems="center" gap={3}>
                      <Typography variant="caption" color="textSecondary">
                        By {getAuthorName(discussion.author)} • {formatTimeAgo(discussion.createdAt)}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <Forum fontSize="small" color="action" />
                        <Typography variant="caption">
                          {discussion.posts?.length || 0} posts
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <Visibility fontSize="small" color="action" />
                        <Typography variant="caption">
                          {discussion.viewCount} views
                        </Typography>
                      </Box>
                      
                      <Typography variant="caption" color="textSecondary">
                        Last activity: {formatTimeAgo(discussion.lastActivity)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {discussions.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Forum sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Discussions Yet
          </Typography>
          <Typography color="textSecondary" paragraph>
            Be the first to start a discussion in this course!
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setNewDiscussionDialog(true)}
          >
            Start Discussion
          </Button>
        </Paper>
      )}

      {/* New Discussion Dialog */}
      <Dialog 
        open={newDiscussionDialog} 
        onClose={() => setNewDiscussionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Start New Discussion</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Discussion Title"
            fullWidth
            variant="outlined"
            value={newDiscussion.title}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={newDiscussion.description}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            select
            margin="dense"
            label="Category"
            fullWidth
            variant="outlined"
            value={newDiscussion.category}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, category: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="general">General</MenuItem>
            <MenuItem value="assignments">Assignments</MenuItem>
            <MenuItem value="lectures">Lectures</MenuItem>
            <MenuItem value="exams">Exams</MenuItem>
            <MenuItem value="projects">Projects</MenuItem>
          </TextField>
          
          <TextField
            margin="dense"
            label="Initial Post"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newDiscussion.initialPost}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, initialPost: e.target.value })}
            placeholder="Start the discussion with your first post..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewDiscussionDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={createDiscussion}
            variant="contained"
            disabled={!newDiscussion.title.trim()}
          >
            Create Discussion
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DiscussionForum;