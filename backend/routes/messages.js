const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { authenticateToken: auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/messages/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: File type not supported!');
    }
  }
});

// Get all conversations for a user
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
      'archivedBy.userId': { $ne: req.user.id }
    })
      .populate('participants', 'username avatar email lastSeen')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get or create conversation between two users
router.post('/conversations', [
  auth,
  body('receiverId').isMongoId().withMessage('Invalid receiver ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverId } = req.body;
    
    if (receiverId === req.user.id) {
      return res.status(400).json({ error: 'Cannot start conversation with yourself' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, receiverId] },
      isGroup: false
    })
      .populate('participants', 'username avatar email lastSeen')
      .populate('lastMessage');

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user.id, receiverId],
        isGroup: false
      });
      await conversation.save();
      await conversation.populate('participants', 'username avatar email lastSeen');
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Check if user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: { $in: conversation.participants } },
        { senderId: { $in: conversation.participants }, receiverId: req.user.id }
      ],
      isDeleted: false
    })
      .populate('senderId', 'username avatar')
      .populate('receiverId', 'username avatar')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({
      $or: [
        { senderId: req.user.id, receiverId: { $in: conversation.participants } },
        { senderId: { $in: conversation.participants }, receiverId: req.user.id }
      ],
      isDeleted: false
    });

    res.json({
      messages: messages.reverse(),
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message
router.post('/conversations/:conversationId/messages', [
  auth,
  upload.single('media'),
  body('content').trim().isLength({ min: 1, max: 1000 }),
  body('messageType').optional().isIn(['text', 'image', 'video', 'file']),
  body('replyTo').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { conversationId } = req.params;
    const { content, messageType, replyTo } = req.body;

    // Check if user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get receiver (other participant)
    const receiverId = conversation.participants.find(p => p.toString() !== req.user.id);

    let mediaUrl = null;
    if (req.file) {
      mediaUrl = `/uploads/messages/${req.file.filename}`;
    }

    const message = new Message({
      senderId: req.user.id,
      receiverId,
      content,
      messageType: messageType || 'text',
      mediaUrl,
      replyTo: replyTo || null
    });

    await message.save();
    await message.populate('senderId', 'username avatar');
    await message.populate('receiverId', 'username avatar');
    if (replyTo) {
      await message.populate('replyTo');
    }

    // Update conversation's last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark message as read
router.put('/messages/:messageId/read', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      receiverId: req.user.id
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete message
router.delete('/messages/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      $or: [
        { senderId: req.user.id },
        { receiverId: req.user.id }
      ]
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Add user to deletedBy array
    message.deletedBy.push({
      userId: req.user.id,
      deletedAt: new Date()
    });

    // If both users deleted, mark as deleted
    if (message.deletedBy.length === 2) {
      message.isDeleted = true;
    }

    await message.save();

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unread message count
router.get('/messages/unread/count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user.id,
      isRead: false,
      isDeleted: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search messages
router.get('/messages/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const messages = await Message.find({
      $or: [
        { senderId: req.user.id },
        { receiverId: req.user.id }
      ],
      content: { $regex: q, $options: 'i' },
      isDeleted: false
    })
      .populate('senderId', 'username avatar')
      .populate('receiverId', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(messages);
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
