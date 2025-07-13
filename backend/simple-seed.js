const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');

async function seedData() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await mongoose.connect('mongodb://localhost:27017/socialsight', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('✅ Cleared existing data');
    
    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user1 = await User.create({
      email: 'john@example.com',
      password: hashedPassword,
      name: 'John Doe',
      username: 'johndoe',
      bio: 'AI-powered social media strategist for 2025',
      isActive: true
    });
    
    const user2 = await User.create({
      email: 'jane@example.com',
      password: hashedPassword,
      name: 'Jane Smith',
      username: 'janesmith',
      bio: 'Digital marketing expert specializing in AI',
      isActive: true
    });
    
    console.log('✅ Created users');
    
    // Create posts with 2025 data
    await Post.create({
      userId: user1._id,
      content: {
        text: 'Just launched my new AI-powered social media strategy for 2025! Machine learning is revolutionizing content creation. 🚀🤖 #AI #Marketing2025',
        images: []
      },
      platforms: [
        { platform: 'twitter', platformPostId: null },
        { platform: 'linkedin', platformPostId: null }
      ],
      status: 'published',
      publishedAt: new Date('2025-07-11T10:30:00Z'),
      engagement: {
        likes: 2450,
        shares: 312,
        comments: 184,
        retweets: 267
      },
      tags: ['ai', 'marketing', '2025']
    });
    
    await Post.create({
      userId: user2._id,
      content: {
        text: 'Top AI trends for 2025: Neural networks, Voice assistants, AR/VR, Real-time personalization. What excites you most? 💭🚀 #AI #2025Trends',
        images: []
      },
      platforms: [
        { platform: 'twitter', platformPostId: null },
        { platform: 'linkedin', platformPostId: null }
      ],
      status: 'published',
      publishedAt: new Date('2025-07-12T14:15:00Z'),
      engagement: {
        likes: 3278,
        shares: 523,
        comments: 395,
        retweets: 618
      },
      tags: ['ai', '2025trends', 'innovation']
    });
    
    console.log('✅ Created posts with 2025 data');
    
    console.log('🎉 Database seeded successfully!');
    console.log('📊 Created 2 users and 2 posts with high engagement metrics');
    console.log('🔑 Login with: john@example.com / password123');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedData();
