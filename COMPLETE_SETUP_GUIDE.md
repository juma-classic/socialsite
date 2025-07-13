# 🚀 Enhanced Social Media Platform - Complete Setup Guide

## 📋 Overview

Your social media platform now includes:
- **Dashboard**: Real-time social media analytics and metrics
- **Posts**: Create, schedule, and manage posts across multiple platforms
- **Messages**: Real-time messaging system with user search
- **Analytics**: Advanced analytics with charts and insights
- **Profile**: User profiles with followers/following system
- **Settings**: Account management and platform connections

## 🏗️ Architecture

### Frontend (React)
- **Components**: Modular UI components with TailwindCSS
- **Pages**: Dashboard, Posts, Messages, Analytics, Profile, Settings
- **Authentication**: JWT-based authentication with Supabase
- **State Management**: React Context for auth and global state
- **Routing**: React Router for navigation

### Backend (Node.js/Express)
- **API Routes**: RESTful API with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Upload**: Multer for handling media uploads
- **Real-time**: Socket.io ready for live messaging
- **Security**: Helmet, CORS, rate limiting

### Database Schema
- **Users**: Profile, authentication, social connections
- **Posts**: Content, scheduling, engagement metrics
- **Messages**: Real-time messaging with conversations
- **Conversations**: Group chat support ready
- **Social Connections**: OAuth token storage for platforms

## 🔧 Installation & Setup

### 1. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm start
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start backend server
npm run dev
```

### 3. Database Setup (MongoDB)
```bash
# Install MongoDB locally or use MongoDB Atlas
# Update MONGODB_URI in .env file

# Example for local MongoDB:
MONGODB_URI=mongodb://localhost:27017/socialsight

# Example for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/socialsight
```

### 4. Environment Variables
Create `.env` file in backend directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/socialsight

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Session
SESSION_SECRET=your-session-secret-here

# API Settings
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3000

# Rate Limiting
API_RATE_LIMIT=100
POST_RATE_LIMIT=50

# Social Media OAuth (Optional)
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

TWITTER_CLIENT_ID=your-twitter-app-id
TWITTER_CLIENT_SECRET=your-twitter-app-secret

INSTAGRAM_CLIENT_ID=your-instagram-app-id
INSTAGRAM_CLIENT_SECRET=your-instagram-app-secret

LINKEDIN_CLIENT_ID=your-linkedin-app-id
LINKEDIN_CLIENT_SECRET=your-linkedin-app-secret
```

## 🎯 Features Overview

### 📊 Dashboard
- Real-time social media metrics
- Platform-specific analytics
- Recent activity feed
- Quick actions for posting

### 📝 Posts Management
- Create posts with rich media
- Schedule posts for later
- Multi-platform publishing
- Engagement tracking
- Draft management

### 💬 Messaging System
- Real-time messaging
- User search and discovery
- Conversation management
- File sharing support
- Online status indicators

### 📈 Analytics
- Detailed engagement metrics
- Platform performance comparison
- Optimal posting times
- Content performance analysis
- Custom date ranges

### 👤 Profile Management
- User profiles with bios
- Avatar upload
- Followers/Following system
- Post history
- Account settings

### ⚙️ Settings
- Account management
- Privacy settings
- Platform connections
- Notification preferences
- Theme customization

## 🔐 Authentication Flow

### Registration/Login
1. User registers with email/password
2. Backend validates and hashes password
3. JWT token issued on successful auth
4. Token stored in localStorage
5. Protected routes check token validity

### Social Media Integration
1. OAuth flow for each platform
2. Tokens stored securely in database
3. API calls authenticated with platform tokens
4. Automatic token refresh handling

## 📱 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/publish` - Publish post

### Messages
- `GET /api/messages/conversations` - Get conversations
- `POST /api/messages/conversations` - Create conversation
- `GET /api/messages/conversations/:id/messages` - Get messages
- `POST /api/messages/conversations/:id/messages` - Send message

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/search` - Search users
- `POST /api/users/:id/follow` - Follow/unfollow user

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard metrics
- `GET /api/analytics/engagement` - Get engagement data
- `GET /api/analytics/schedule` - Get schedule analytics

## 🚀 Running the Application

### Development Mode
```bash
# Terminal 1: Frontend
npm start

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: MongoDB (if local)
mongod
```

### Production Mode
```bash
# Build frontend
npm run build

# Start backend
cd backend
npm start
```

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Check MongoDB is running
   mongod --version
   
   # Check connection string in .env
   MONGODB_URI=mongodb://localhost:27017/socialsight
   ```

2. **JWT Authentication Errors**
   ```bash
   # Ensure JWT_SECRET is set in .env
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

3. **File Upload Issues**
   ```bash
   # Check uploads directory exists
   mkdir -p backend/uploads/avatars
   mkdir -p backend/uploads/messages
   ```

4. **CORS Issues**
   ```bash
   # Check FRONTEND_URL in backend .env
   FRONTEND_URL=http://localhost:3000
   ```

## 📚 Additional Resources

### Technologies Used
- **Frontend**: React, TailwindCSS, Lucide Icons
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **File Upload**: Multer
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate Limiting

### Next Steps
1. Set up social media OAuth credentials
2. Configure real-time messaging with Socket.io
3. Add push notifications
4. Implement advanced analytics
5. Add more social media platforms
6. Set up CI/CD pipeline
7. Add automated tests

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

---

**Need Help?** Check the documentation or create an issue on GitHub!
