const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken: auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only image files are allowed!');
    }
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', [
  auth,
  body('username').optional().trim().isLength({ min: 3, max: 20 }),
  body('email').optional().isEmail(),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('location').optional().trim().isLength({ max: 100 }),
  body('website').optional().isURL(),
  body('birthDate').optional().isISO8601().toDate()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, bio, location, website, birthDate } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if username is already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Check if email is already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (birthDate !== undefined) user.birthDate = birthDate;

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile picture
router.put('/profile/avatar', [auth, upload.single('avatar')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({ avatar: user.avatar });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.put('/profile/password', [
  auth,
  body('currentPassword').isLength({ min: 6 }),
  body('newPassword').isLength({ min: 6 }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user.id } // Exclude current user
    })
      .select('username email avatar bio location')
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user by ID
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -email');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Follow/Unfollow user
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = await User.findById(req.user.id);
    
    const isFollowing = currentUser.following.includes(userId);
    
    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(userId);
      userToFollow.followers.pull(req.user.id);
    } else {
      // Follow
      currentUser.following.push(userId);
      userToFollow.followers.push(req.user.id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ 
      following: !isFollowing,
      message: isFollowing ? 'User unfollowed' : 'User followed'
    });
  } catch (error) {
    console.error('Error following/unfollowing user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's followers
router.get('/:userId/followers', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId)
      .populate({
        path: 'followers',
        select: 'username avatar bio',
        options: { skip, limit }
      });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const total = user.followers.length;

    res.json({
      followers: user.followers,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's following
router.get('/:userId/following', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId)
      .populate({
        path: 'following',
        select: 'username avatar bio',
        options: { skip, limit }
      });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const total = user.following.length;

    res.json({
      following: user.following,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user's last seen
router.put('/activity/last-seen', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      lastSeen: new Date(),
      isOnline: true
    });

    res.json({ message: 'Last seen updated' });
  } catch (error) {
    console.error('Error updating last seen:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
