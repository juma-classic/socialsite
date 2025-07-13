const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200
  },
  content: {
    text: {
      type: String,
      required: true,
      maxlength: 2000
    },
    images: [{
      url: String,
      alt: String,
      size: Number,
      format: String
    }],
    videos: [{
      url: String,
      thumbnail: String,
      duration: Number,
      size: Number,
      format: String
    }],
    links: [{
      url: String,
      title: String,
      description: String,
      image: String
    }],
    hashtags: [String],
    mentions: [String]
  },
  platforms: [{
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'google', 'tiktok'],
      required: true
    },
    platformPostId: {
      type: String,
      default: null
    },
    pageId: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'publishing', 'published', 'failed'],
      default: 'draft'
    },
    scheduledFor: {
      type: Date,
      default: null
    },
    publishedAt: {
      type: Date,
      default: null
    },
    error: {
      message: String,
      code: String,
      details: mongoose.Schema.Types.Mixed
    },
    retryCount: {
      type: Number,
      default: 0
    },
    customContent: {
      text: String,
      images: [String],
      videos: [String]
    }
  }],
  analytics: {
    facebook: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      reactions: { type: Number, default: 0 },
      reach: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
      lastUpdated: Date
    },
    instagram: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      reach: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
      lastUpdated: Date
    },
    twitter: {
      likes: { type: Number, default: 0 },
      retweets: { type: Number, default: 0 },
      replies: { type: Number, default: 0 },
      quotes: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
      lastUpdated: Date
    },
    linkedin: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
      lastUpdated: Date
    },
    tiktok: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      lastUpdated: Date
    },
    youtube: {
      likes: { type: Number, default: 0 },
      dislikes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      subscribers: { type: Number, default: 0 },
      lastUpdated: Date
    }
  },
  performance: {
    totalEngagement: { type: Number, default: 0 },
    totalReach: { type: Number, default: 0 },
    totalImpressions: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    bestPerformingPlatform: String,
    lastCalculated: Date
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'bulk'],
      default: 'web'
    },
    campaign: {
      type: String,
      default: null
    },
    tags: [String],
    isPromoted: { type: Boolean, default: false },
    budget: { type: Number, default: 0 },
    targetAudience: {
      ageRange: String,
      gender: String,
      location: String,
      interests: [String]
    }
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed', 'archived'],
    default: 'draft'
  },
  isArchived: {
    type: Boolean,
    default: false
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
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ 'platforms.platform': 1, 'platforms.status': 1 });
postSchema.index({ 'platforms.scheduledFor': 1 });
postSchema.index({ status: 1 });
postSchema.index({ 'content.hashtags': 1 });

// Update timestamp on save
postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance methods
postSchema.methods.getPlatformData = function(platform) {
  return this.platforms.find(p => p.platform === platform);
};

postSchema.methods.updatePlatformStatus = function(platform, status, error = null) {
  const platformData = this.getPlatformData(platform);
  if (platformData) {
    platformData.status = status;
    if (error) {
      platformData.error = error;
    }
    if (status === 'published') {
      platformData.publishedAt = new Date();
    }
  }
};

postSchema.methods.incrementRetryCount = function(platform) {
  const platformData = this.getPlatformData(platform);
  if (platformData) {
    platformData.retryCount = (platformData.retryCount || 0) + 1;
  }
};

postSchema.methods.updateAnalytics = function(platform, analytics) {
  if (this.analytics[platform]) {
    Object.assign(this.analytics[platform], analytics);
    this.analytics[platform].lastUpdated = new Date();
  }
};

postSchema.methods.calculatePerformance = function() {
  let totalEngagement = 0;
  let totalReach = 0;
  let totalImpressions = 0;
  let bestPlatform = null;
  let bestEngagement = 0;

  Object.keys(this.analytics).forEach(platform => {
    const data = this.analytics[platform];
    if (data.lastUpdated) {
      const engagement = (data.likes || 0) + (data.comments || 0) + (data.shares || 0) + (data.retweets || 0);
      totalEngagement += engagement;
      totalReach += data.reach || 0;
      totalImpressions += data.impressions || 0;

      if (engagement > bestEngagement) {
        bestEngagement = engagement;
        bestPlatform = platform;
      }
    }
  });

  this.performance = {
    totalEngagement,
    totalReach,
    totalImpressions,
    engagementRate: totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0,
    bestPerformingPlatform: bestPlatform,
    lastCalculated: new Date()
  };
};

postSchema.methods.getContentForPlatform = function(platform) {
  const platformData = this.getPlatformData(platform);
  if (platformData && platformData.customContent) {
    return platformData.customContent;
  }
  return this.content;
};

postSchema.methods.isScheduled = function() {
  return this.platforms.some(p => p.status === 'scheduled');
};

postSchema.methods.isPublished = function() {
  return this.platforms.some(p => p.status === 'published');
};

postSchema.methods.hasFailed = function() {
  return this.platforms.some(p => p.status === 'failed');
};

// Static methods
postSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.platform) {
    query['platforms.platform'] = options.platform;
  }
  
  if (options.dateRange) {
    query.createdAt = {
      $gte: options.dateRange.start,
      $lte: options.dateRange.end
    };
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

postSchema.statics.findScheduledPosts = function(timeRange = 5) {
  const now = new Date();
  const future = new Date(now.getTime() + (timeRange * 60 * 1000));
  
  return this.find({
    'platforms.status': 'scheduled',
    'platforms.scheduledFor': {
      $gte: now,
      $lte: future
    }
  });
};

postSchema.statics.getAnalyticsSummary = function(userId, dateRange) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: {
          $gte: dateRange.start,
          $lte: dateRange.end
        }
      }
    },
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        totalEngagement: { $sum: '$performance.totalEngagement' },
        totalReach: { $sum: '$performance.totalReach' },
        totalImpressions: { $sum: '$performance.totalImpressions' },
        avgEngagementRate: { $avg: '$performance.engagementRate' }
      }
    }
  ]);
};

module.exports = mongoose.model('Post', postSchema);
