const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  groupAvatar: {
    type: String,
    default: null
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    archivedAt: {
      type: Date,
      default: Date.now
    }
  }],
  mutedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    mutedUntil: {
      type: Date,
      default: null
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
