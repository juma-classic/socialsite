const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { authenticateToken: auth } = require('../middleware/auth');

// Get user's analytics dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (timeRange) {
      case '24h':
        dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
        break;
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = {};
    }

    // Get post statistics
    const postStats = await Post.aggregate([
      {
        $match: {
          userId: req.user.id,
          isDeleted: false,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          publishedPosts: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          scheduledPosts: {
            $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
          },
          draftPosts: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          totalLikes: { $sum: '$engagement.likes' },
          totalShares: { $sum: '$engagement.shares' },
          totalComments: { $sum: '$engagement.comments' },
          totalRetweets: { $sum: '$engagement.retweets' }
        }
      }
    ]);

    // Get platform distribution
    const platformStats = await Post.aggregate([
      {
        $match: {
          userId: req.user.id,
          isDeleted: false,
          status: 'published',
          ...dateFilter
        }
      },
      {
        $unwind: '$platforms'
      },
      {
        $group: {
          _id: '$platforms',
          count: { $sum: 1 },
          totalEngagement: {
            $sum: {
              $add: [
                '$engagement.likes',
                '$engagement.shares',
                '$engagement.comments',
                '$engagement.retweets'
              ]
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get daily post count (last 30 days)
    const dailyStats = await Post.aggregate([
      {
        $match: {
          userId: req.user.id,
          isDeleted: false,
          status: 'published',
          createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          engagement: {
            $sum: {
              $add: [
                '$engagement.likes',
                '$engagement.shares',
                '$engagement.comments',
                '$engagement.retweets'
              ]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Get top performing posts
    const topPosts = await Post.find({
      userId: req.user.id,
      isDeleted: false,
      status: 'published',
      ...dateFilter
    })
      .sort({
        'engagement.likes': -1,
        'engagement.shares': -1,
        'engagement.comments': -1
      })
      .limit(10)
      .select('content.text platforms engagement createdAt');

    res.json({
      overview: postStats[0] || {
        totalPosts: 0,
        publishedPosts: 0,
        scheduledPosts: 0,
        draftPosts: 0,
        totalLikes: 0,
        totalShares: 0,
        totalComments: 0,
        totalRetweets: 0
      },
      platformDistribution: platformStats,
      dailyActivity: dailyStats,
      topPosts,
      timeRange
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get engagement metrics
router.get('/engagement', auth, async (req, res) => {
  try {
    const { timeRange = '30d', platform } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (timeRange) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = {};
    }

    let matchFilter = {
      userId: req.user.id,
      isDeleted: false,
      status: 'published',
      ...dateFilter
    };

    if (platform) {
      matchFilter.platforms = platform;
    }

    const engagementStats = await Post.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          likes: { $sum: '$engagement.likes' },
          shares: { $sum: '$engagement.shares' },
          comments: { $sum: '$engagement.comments' },
          retweets: { $sum: '$engagement.retweets' },
          posts: { $sum: 1 }
        }
      },
      {
        $addFields: {
          totalEngagement: {
            $add: ['$likes', '$shares', '$comments', '$retweets']
          },
          averageEngagement: {
            $cond: [
              { $gt: ['$posts', 0] },
              {
                $divide: [
                  { $add: ['$likes', '$shares', '$comments', '$retweets'] },
                  '$posts'
                ]
              },
              0
            ]
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      engagement: engagementStats,
      timeRange,
      platform: platform || 'all'
    });
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get posting schedule analytics
router.get('/schedule', auth, async (req, res) => {
  try {
    // Get optimal posting times based on historical engagement
    const optimalTimes = await Post.aggregate([
      {
        $match: {
          userId: req.user.id,
          isDeleted: false,
          status: 'published',
          createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $addFields: {
          hour: { $hour: '$createdAt' },
          dayOfWeek: { $dayOfWeek: '$createdAt' },
          totalEngagement: {
            $add: [
              '$engagement.likes',
              '$engagement.shares',
              '$engagement.comments',
              '$engagement.retweets'
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            hour: '$hour',
            dayOfWeek: '$dayOfWeek'
          },
          averageEngagement: { $avg: '$totalEngagement' },
          postCount: { $sum: 1 }
        }
      },
      {
        $sort: { averageEngagement: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get upcoming scheduled posts
    const upcomingPosts = await Post.find({
      userId: req.user.id,
      isDeleted: false,
      status: 'scheduled',
      scheduledTime: { $gte: new Date() }
    })
      .sort({ scheduledTime: 1 })
      .limit(20)
      .select('content.text platforms scheduledTime');

    // Get posting frequency by day of week
    const weeklyDistribution = await Post.aggregate([
      {
        $match: {
          userId: req.user.id,
          isDeleted: false,
          status: 'published',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
          averageEngagement: {
            $avg: {
              $add: [
                '$engagement.likes',
                '$engagement.shares',
                '$engagement.comments',
                '$engagement.retweets'
              ]
            }
          }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      optimalTimes,
      upcomingPosts,
      weeklyDistribution
    });
  } catch (error) {
    console.error('Error fetching schedule analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get content performance analytics
router.get('/content', auth, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (timeRange) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = {};
    }

    // Get content type performance
    const contentTypes = await Post.aggregate([
      {
        $match: {
          userId: req.user.id,
          isDeleted: false,
          status: 'published',
          ...dateFilter
        }
      },
      {
        $addFields: {
          hasImages: { $gt: [{ $size: '$content.images' }, 0] },
          hasVideos: { $gt: [{ $size: '$content.videos' }, 0] },
          contentType: {
            $cond: [
              { $gt: [{ $size: '$content.videos' }, 0] },
              'video',
              {
                $cond: [
                  { $gt: [{ $size: '$content.images' }, 0] },
                  'image',
                  'text'
                ]
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: '$contentType',
          count: { $sum: 1 },
          averageEngagement: {
            $avg: {
              $add: [
                '$engagement.likes',
                '$engagement.shares',
                '$engagement.comments',
                '$engagement.retweets'
              ]
            }
          }
        }
      },
      {
        $sort: { averageEngagement: -1 }
      }
    ]);

    // Get hashtag performance
    const hashtagPerformance = await Post.aggregate([
      {
        $match: {
          userId: req.user.id,
          isDeleted: false,
          status: 'published',
          ...dateFilter
        }
      },
      {
        $unwind: '$tags'
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
          averageEngagement: {
            $avg: {
              $add: [
                '$engagement.likes',
                '$engagement.shares',
                '$engagement.comments',
                '$engagement.retweets'
              ]
            }
          }
        }
      },
      {
        $sort: { averageEngagement: -1 }
      },
      {
        $limit: 20
      }
    ]);

    res.json({
      contentTypes,
      hashtagPerformance,
      timeRange
    });
  } catch (error) {
    console.error('Error fetching content analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
