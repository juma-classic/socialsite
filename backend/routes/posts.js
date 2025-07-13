const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { authenticateToken: auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only image and video files are allowed!');
    }
  }
});

// Get all posts with pagination
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const posts = await Post.find({ isDeleted: false })
      .populate('userId', 'username avatar email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Post.countDocuments({ isDeleted: false });
    
    res.json({
      posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's posts
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const posts = await Post.find({ 
      userId: userId, 
      isDeleted: false 
    })
      .populate('userId', 'username avatar email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Post.countDocuments({ 
      userId: userId, 
      isDeleted: false 
    });
    
    res.json({
      posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new post
router.post('/', [
  auth,
  upload.array('media', 5),
  body('content.text').trim().isLength({ min: 1, max: 2000 }),
  body('platforms').isArray().withMessage('Platforms must be an array'),
  body('scheduledTime').optional().isISO8601().toDate()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, platforms, scheduledTime, tags } = req.body;
    
    // Process uploaded files
    const mediaUrls = [];
    if (req.files) {
      req.files.forEach(file => {
        mediaUrls.push({
          url: `/uploads/${file.filename}`,
          mediaType: file.mimetype.startsWith('image') ? 'image' : 'video'
        });
      });
    }

    const post = new Post({
      userId: req.user.id,
      content: {
        text: content.text,
        images: mediaUrls.filter(m => m.mediaType === 'image'),
        videos: mediaUrls.filter(m => m.mediaType === 'video')
      },
      platforms: platforms || [],
      scheduledTime: scheduledTime || null,
      status: scheduledTime ? 'scheduled' : 'draft',
      tags: tags || []
    });

    await post.save();
    await post.populate('userId', 'username avatar email');
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update post
router.put('/:postId', [
  auth,
  body('content.text').trim().isLength({ min: 1, max: 2000 }),
  body('platforms').isArray().withMessage('Platforms must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { postId } = req.params;
    const { content, platforms, scheduledTime, tags } = req.body;
    
    const post = await Post.findOne({ 
      _id: postId, 
      userId: req.user.id,
      isDeleted: false
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only allow editing if not published
    if (post.status === 'published') {
      return res.status(400).json({ error: 'Cannot edit published posts' });
    }

    post.content.text = content.text;
    post.platforms = platforms;
    post.scheduledTime = scheduledTime || null;
    post.status = scheduledTime ? 'scheduled' : 'draft';
    post.tags = tags || [];
    
    await post.save();
    await post.populate('userId', 'username avatar email');
    
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete post
router.delete('/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findOne({ 
      _id: postId, 
      userId: req.user.id,
      isDeleted: false
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.isDeleted = true;
    await post.save();
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Publish post immediately
router.post('/:postId/publish', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findOne({ 
      _id: postId, 
      userId: req.user.id,
      isDeleted: false
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.status === 'published') {
      return res.status(400).json({ error: 'Post already published' });
    }

    // Here you would implement actual publishing to social media platforms
    // For now, we'll just update the status
    post.status = 'published';
    post.publishedAt = new Date();
    
    await post.save();
    await post.populate('userId', 'username avatar email');
    
    res.json(post);
  } catch (error) {
    console.error('Error publishing post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get post analytics
router.get('/:postId/analytics', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findOne({ 
      _id: postId, 
      userId: req.user.id,
      isDeleted: false
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Here you would fetch real analytics from social media platforms
    // For now, return mock data
    const analytics = {
      postId: post._id,
      engagement: post.engagement,
      platforms: post.platforms,
      publishedAt: post.publishedAt,
      impressions: Math.floor(Math.random() * 1000),
      clicks: Math.floor(Math.random() * 100),
      saves: Math.floor(Math.random() * 50)
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching post analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
