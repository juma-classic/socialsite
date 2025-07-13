const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');

mongoose.connect('mongodb://localhost:27017/socialsight', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB');
  
  const userCount = await User.countDocuments();
  const postCount = await Post.countDocuments();
  
  console.log(`Users in database: ${userCount}`);
  console.log(`Posts in database: ${postCount}`);
  
  if (postCount > 0) {
    const samplePost = await Post.findOne().populate('userId');
    console.log('Sample post:', {
      text: samplePost.content.text.substring(0, 100) + '...',
      likes: samplePost.engagement.likes,
      publishedAt: samplePost.publishedAt,
      author: samplePost.userId.username
    });
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Connection failed:', err);
  process.exit(1);
});
