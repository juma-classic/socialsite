const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    expiresAt: {
      type: Date,
      default: null
    },
    features: {
      maxPosts: { type: Number, default: 10 },
      maxPlatforms: { type: Number, default: 3 },
      analytics: { type: Boolean, default: false },
      scheduling: { type: Boolean, default: true }
    }
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100
  },
  website: {
    type: String,
    trim: true
  },
  birthDate: {
    type: Date
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  socialAccounts: [{
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'google', 'tiktok'],
      required: true
    },
    platformUserId: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: null
    },
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String,
      default: null
    },
    tokenExpiry: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    pages: [{
      id: String,
      name: String,
      accessToken: String,
      type: {
        type: String,
        enum: ['page', 'group', 'channel', 'company'],
        default: 'page'
      },
      followers: Number,
      isActive: { type: Boolean, default: true }
    }],
    scopes: [String],
    lastSync: {
      type: Date,
      default: Date.now
    },
    connectedAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    defaultScheduleTime: {
      type: String,
      default: '09:00'
    },
    autoPost: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ 'socialAccounts.platform': 1 });
userSchema.index({ 'socialAccounts.platformUserId': 1 });

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance methods
userSchema.methods.getSocialAccount = function(platform) {
  return this.socialAccounts.find(acc => acc.platform === platform && acc.isActive);
};

userSchema.methods.hasPlatformAccess = function(platform) {
  const account = this.getSocialAccount(platform);
  return account && account.isActive;
};

userSchema.methods.canAddPlatform = function() {
  const activePlatforms = this.socialAccounts.filter(acc => acc.isActive).length;
  return activePlatforms < this.subscription.features.maxPlatforms;
};

userSchema.methods.canSchedulePost = function() {
  return this.subscription.features.scheduling;
};

userSchema.methods.getPostsThisMonth = async function() {
  const Post = mongoose.model('Post');
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const count = await Post.countDocuments({
    userId: this._id,
    createdAt: { $gte: startOfMonth }
  });
  
  return count;
};

userSchema.methods.canCreatePost = async function() {
  const postsThisMonth = await this.getPostsThisMonth();
  return postsThisMonth < this.subscription.features.maxPosts;
};

module.exports = mongoose.model('User', userSchema);
