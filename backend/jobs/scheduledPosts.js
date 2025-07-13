const cron = require('node-cron');
const Post = require('../models/Post');
const User = require('../models/User');

// Schedule a job to run every minute to check for scheduled posts
cron.schedule('* * * * *', async () => {
  try {
    console.log('Checking for scheduled posts...');
    
    const now = new Date();
    const scheduledPosts = await Post.find({
      status: 'scheduled',
      scheduledTime: { $lte: now }
    }).populate('userId');
    
    if (scheduledPosts.length > 0) {
      console.log(`Found ${scheduledPosts.length} posts to publish`);
      
      for (const post of scheduledPosts) {
        try {
          // Update post status to published
          post.status = 'published';
          post.publishedAt = now;
          await post.save();
          
          console.log(`Published post ${post._id} for user ${post.userId.username}`);
          
          // Here you would typically integrate with social media APIs
          // to actually publish the post to the selected platforms
          
          // For now, we'll just log the action
          console.log(`Post published to platforms: ${post.platforms.join(', ')}`);
          
        } catch (error) {
          console.error(`Error publishing post ${post._id}:`, error);
          
          // Mark post as failed
          post.status = 'failed';
          post.failureReason = error.message;
          await post.save();
        }
      }
    }
    
  } catch (error) {
    console.error('Error in scheduled posts job:', error);
  }
});

// Schedule a job to run every hour to clean up old failed posts
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Cleaning up old failed posts...');
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const result = await Post.deleteMany({
      status: 'failed',
      updatedAt: { $lt: oneWeekAgo }
    });
    
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} old failed posts`);
    }
    
  } catch (error) {
    console.error('Error in cleanup job:', error);
  }
});

// Schedule a job to run daily at midnight to update post metrics
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Updating post metrics...');
    
    const posts = await Post.find({
      status: 'published',
      publishedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    for (const post of posts) {
      try {
        // Here you would typically fetch updated metrics from social media APIs
        // For now, we'll simulate some metric updates
        
        const randomIncrease = Math.floor(Math.random() * 10) + 1;
        post.engagement.likes += randomIncrease;
        post.engagement.shares += Math.floor(randomIncrease / 3);
        post.engagement.comments += Math.floor(randomIncrease / 5);
        
        await post.save();
        
      } catch (error) {
        console.error(`Error updating metrics for post ${post._id}:`, error);
      }
    }
    
    console.log(`Updated metrics for ${posts.length} posts`);
    
  } catch (error) {
    console.error('Error in metrics update job:', error);
  }
});

console.log('Scheduled posts job initialized');

module.exports = {
  // Export any job control functions if needed
  status: 'running'
};
