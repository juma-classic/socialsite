const cron = require('node-cron');
const Post = require('../models/Post');
const User = require('../models/User');

// Schedule a job to run every hour to update analytics data
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Updating analytics data...');
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get all active users
    const users = await User.find({ isActive: true });
    
    for (const user of users) {
      try {
        // Calculate user analytics
        const totalPosts = await Post.countDocuments({ 
          userId: user._id,
          status: 'published'
        });
        
        const todayPosts = await Post.countDocuments({
          userId: user._id,
          status: 'published',
          publishedAt: { $gte: today }
        });
        
        const weekPosts = await Post.countDocuments({
          userId: user._id,
          status: 'published',
          publishedAt: { $gte: lastWeek }
        });
        
        const monthPosts = await Post.countDocuments({
          userId: user._id,
          status: 'published',
          publishedAt: { $gte: lastMonth }
        });
        
        // Calculate engagement metrics
        const userPosts = await Post.find({
          userId: user._id,
          status: 'published'
        });
        
        const totalEngagement = userPosts.reduce((acc, post) => {
          acc.likes += post.engagement.likes || 0;
          acc.shares += post.engagement.shares || 0;
          acc.comments += post.engagement.comments || 0;
          acc.retweets += post.engagement.retweets || 0;
          return acc;
        }, { likes: 0, shares: 0, comments: 0, retweets: 0 });
        
        const weeklyPosts = userPosts.filter(post => 
          post.publishedAt && post.publishedAt >= lastWeek
        );
        
        const weekEngagement = weeklyPosts.reduce((acc, post) => {
          acc.likes += post.engagement.likes || 0;
          acc.shares += post.engagement.shares || 0;
          acc.comments += post.engagement.comments || 0;
          acc.retweets += post.engagement.retweets || 0;
          return acc;
        }, { likes: 0, shares: 0, comments: 0, retweets: 0 });
        
        // Update user analytics (you would typically store this in a separate analytics collection)
        user.analytics = {
          totalPosts,
          todayPosts,
          weekPosts,
          monthPosts,
          totalEngagement,
          weekEngagement,
          lastUpdated: now
        };
        
        await user.save();
        
      } catch (error) {
        console.error(`Error updating analytics for user ${user._id}:`, error);
      }
    }
    
    console.log(`Updated analytics for ${users.length} users`);
    
  } catch (error) {
    console.error('Error in analytics update job:', error);
  }
});

// Schedule a job to run daily at 2 AM to generate daily reports
cron.schedule('0 2 * * *', async () => {
  try {
    console.log('Generating daily analytics reports...');
    
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    // Generate platform-wise analytics
    const platforms = ['twitter', 'facebook', 'instagram', 'linkedin', 'youtube'];
    
    for (const platform of platforms) {
      const platformPosts = await Post.find({
        platforms: platform,
        status: 'published',
        publishedAt: { $gte: yesterday, $lt: today }
      });
      
      const platformMetrics = platformPosts.reduce((acc, post) => {
        acc.totalPosts += 1;
        acc.totalLikes += post.engagement.likes || 0;
        acc.totalShares += post.engagement.shares || 0;
        acc.totalComments += post.engagement.comments || 0;
        acc.totalRetweets += post.engagement.retweets || 0;
        return acc;
      }, {
        totalPosts: 0,
        totalLikes: 0,
        totalShares: 0,
        totalComments: 0,
        totalRetweets: 0
      });
      
      console.log(`${platform} daily report:`, platformMetrics);
      
      // Here you would typically save this to a reports collection
      // or send it to an analytics service
    }
    
  } catch (error) {
    console.error('Error in daily reports job:', error);
  }
});

// Schedule a job to run weekly on Sunday at 3 AM to clean up old analytics data
cron.schedule('0 3 * * 0', async () => {
  try {
    console.log('Cleaning up old analytics data...');
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    // Here you would typically clean up old analytics records
    // For now, we'll just log the action
    console.log('Analytics cleanup completed');
    
  } catch (error) {
    console.error('Error in analytics cleanup job:', error);
  }
});

// Function to calculate engagement rate
function calculateEngagementRate(post) {
  const totalEngagement = (post.engagement.likes || 0) + 
                         (post.engagement.shares || 0) + 
                         (post.engagement.comments || 0) + 
                         (post.engagement.retweets || 0);
  
  // Assuming a base reach of 1000 for calculation
  // In a real app, you'd get actual reach data from social media APIs
  const estimatedReach = 1000;
  
  return (totalEngagement / estimatedReach) * 100;
}

// Function to get trending hashtags
async function getTrendingHashtags() {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const posts = await Post.find({
      status: 'published',
      publishedAt: { $gte: lastWeek }
    });
    
    const hashtagCounts = {};
    
    posts.forEach(post => {
      post.tags.forEach(tag => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      });
    });
    
    // Sort hashtags by frequency
    const trendingHashtags = Object.entries(hashtagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
    
    return trendingHashtags;
    
  } catch (error) {
    console.error('Error getting trending hashtags:', error);
    return [];
  }
}

console.log('Analytics updater job initialized');

module.exports = {
  calculateEngagementRate,
  getTrendingHashtags,
  status: 'running'
};
