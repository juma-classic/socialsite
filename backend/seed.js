const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Post = require('./models/Post');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

console.log('🌱 Starting database seeder...');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('📡 Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socialsight', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    await seedDatabase();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with 2025 data...');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Message.deleteMany({});
    await Conversation.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.create([
      {
        email: 'john@example.com',
        password: hashedPassword,
        name: 'John Doe',
        username: 'johndoe',
        bio: 'AI-powered social media strategist and content creator for 2025',
        location: 'New York, NY',
        website: 'https://johndoe.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        subscription: {
          plan: 'pro',
          features: {
            maxPosts: 100,
            maxPlatforms: 10,
            analytics: true,
            scheduling: true
          }
        }
      },
      {
        email: 'jane@example.com',
        password: hashedPassword,
        name: 'Jane Smith',
        username: 'janesmith',
        bio: 'Digital marketing expert specializing in AI-driven strategies',
        location: 'San Francisco, CA',
        website: 'https://janesmith.blog',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b68ad4de?w=150&h=150&fit=crop&crop=face',
        subscription: {
          plan: 'basic',
          features: {
            maxPosts: 50,
            maxPlatforms: 5,
            analytics: true,
            scheduling: true
          }
        }
      },
      {
        email: 'mike@example.com',
        password: hashedPassword,
        name: 'Mike Johnson',
        username: 'mikejohnson',
        bio: 'Tech entrepreneur and AI startup founder',
        location: 'Austin, TX',
        website: 'https://mikejohnson.tech',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        subscription: {
          plan: 'enterprise',
          features: {
            maxPosts: 1000,
            maxPlatforms: 20,
            analytics: true,
            scheduling: true
          }
        }
      }
    ]);

    console.log('✅ Created sample users');

    // Create sample posts with 2025 data and higher engagement
    const samplePosts = [
      {
        userId: users[0]._id,
        content: {
          text: 'Just launched my new AI-powered social media strategy for 2025! Machine learning is revolutionizing how we create and optimize content. Excited to share insights with the community. 🚀🤖 #SocialMedia #AI #Marketing2025',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop',
              alt: 'AI Social media strategy infographic'
            }
          ]
        },
        platforms: [
          { platform: 'twitter', platformPostId: null },
          { platform: 'linkedin', platformPostId: null },
          { platform: 'facebook', platformPostId: null }
        ],
        status: 'published',
        publishedAt: new Date('2025-07-11T10:30:00Z'),
        engagement: {
          likes: 2450,
          shares: 312,
          comments: 184,
          retweets: 267
        },
        tags: ['socialmedia', 'ai', 'marketing', '2025', 'machinelearning']
      },
      {
        userId: users[1]._id,
        content: {
          text: 'Top 7 AI-powered content marketing trends for 2025:\n1. Neural network content generation\n2. Voice-first AI assistants\n3. Immersive AR/VR experiences\n4. Predictive influencer matching\n5. Automated A/B testing\n6. Real-time sentiment analysis\n7. Personalized content at scale\n\nWhat trends are you most excited about? 💭🚀 #ContentMarketing #AI #2025Trends',
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
        tags: ['contentmarketing', 'ai', '2025trends', 'digitalmarketing', 'neural']
      },
      {
        userId: users[2]._id,
        content: {
          text: 'Building a successful AI startup in 2025 is like training a neural network. It requires quality data (market research), proper architecture (business model), and continuous learning (iteration). 🧠💡 Focus on your training data before expecting intelligent outputs. #AIStartup #2025 #MachineLearning',
          images: []
        },
        platforms: [
          { platform: 'twitter', platformPostId: null },
          { platform: 'linkedin', platformPostId: null },
          { platform: 'instagram', platformPostId: null }
        ],
        status: 'published',
        publishedAt: new Date('2025-07-13T09:45:00Z'),
        engagement: {
          likes: 4156,
          shares: 834,
          comments: 628,
          retweets: 1242
        },
        tags: ['aistartup', 'machinelearning', 'business', 'neuralnetwork', '2025']
      },
      {
        userId: users[0]._id,
        content: {
          text: 'Excited to announce our upcoming 2025 webinar series on "AI-Powered Social Media Analytics"! Join us next week for deep insights into using machine learning for measuring ROI and optimizing your social strategy. Link in bio! 📊🤖 #AI #Analytics #2025 #MachineLearning',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop',
              alt: 'AI Analytics dashboard'
            }
          ]
        },
        platforms: [
          { platform: 'facebook', platformPostId: null },
          { platform: 'linkedin', platformPostId: null },
          { platform: 'instagram', platformPostId: null }
        ],
        status: 'scheduled',
        scheduledTime: new Date('2025-07-14T16:00:00Z'),
        engagement: {
          likes: 0,
          shares: 0,
          comments: 0,
          retweets: 0
        },
        tags: ['webinar', 'analytics', 'ai', '2025', 'machinelearning']
      },
      {
        userId: users[1]._id,
        content: {
          text: 'Draft post about AI-powered email marketing automation for 2025...',
          images: []
        },
        platforms: [
          { platform: 'twitter', platformPostId: null },
          { platform: 'linkedin', platformPostId: null }
        ],
        status: 'draft',
        engagement: {
          likes: 0,
          shares: 0,
          comments: 0,
          retweets: 0
        },
        tags: ['emailmarketing', 'ai', 'automation', '2025', 'draft']
      }
    ];

    await Post.create(samplePosts);
    console.log('✅ Created sample posts with 2025 data');

    // Create sample conversation and messages
    const conversation = await Conversation.create({
      participants: [users[0]._id, users[1]._id],
      isGroup: false,
      lastMessageAt: new Date('2025-07-13T11:30:00Z')
    });

    const sampleMessages = [
      {
        senderId: users[0]._id,
        receiverId: users[1]._id,
        content: 'Hey Jane! Loved your latest post about AI-powered content marketing trends for 2025.',
        createdAt: new Date('2025-07-13T10:00:00Z')
      },
      {
        senderId: users[1]._id,
        receiverId: users[0]._id,
        content: 'Thanks John! I am glad you found it helpful. Your AI social media strategy post was really insightful too.',
        createdAt: new Date('2025-07-13T10:30:00Z')
      },
      {
        senderId: users[0]._id,
        receiverId: users[1]._id,
        content: 'Would you be interested in collaborating on a 2025 webinar about AI-powered social media analytics? I think our audiences would love it.',
        createdAt: new Date('2025-07-13T11:00:00Z')
      },
      {
        senderId: users[1]._id,
        receiverId: users[0]._id,
        content: 'Absolutely! That sounds like a great idea. Let us schedule a call to discuss the AI integration details.',
        isRead: false,
        createdAt: new Date('2025-07-13T11:30:00Z')
      }
    ];

    const messages = await Message.create(sampleMessages);
    
    // Update conversation with last message
    conversation.lastMessage = messages[messages.length - 1]._id;
    await conversation.save();

    console.log('✅ Created sample conversation and messages');

    // Add followers/following relationships
    users[0].followers.push(users[1]._id);
    users[0].following.push(users[2]._id);
    users[1].followers.push(users[0]._id);
    users[1].following.push(users[2]._id);
    users[2].followers.push(users[0]._id, users[1]._id);

    await Promise.all(users.map(user => user.save()));
    console.log('✅ Created sample relationships');

    console.log('🎉 Database seeded successfully with 2025 data!');
    console.log('\n📊 Sample Data Created:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📝 Posts: ${samplePosts.length} (with high 2025 engagement)`);
    console.log(`   💬 Messages: ${sampleMessages.length}`);
    console.log(`   🗨️  Conversations: 1`);
    console.log('\n🔑 Sample Login Credentials:');
    console.log('   Email: john@example.com | Password: password123');
    console.log('   Email: jane@example.com | Password: password123');
    console.log('   Email: mike@example.com | Password: password123');
    console.log('\n🚀 2025 Features:');
    console.log('   • AI-powered content creation');
    console.log('   • Machine learning analytics');
    console.log('   • Neural network optimization');
    console.log('   • High engagement metrics (2K-4K likes)');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}
