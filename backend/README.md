# Social Sight Backend - Installation & Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB 4.4+
- Redis 6.0+
- NPM or Yarn

### Installation

1. **Clone and Install Dependencies**
```bash
cd backend
npm install
```

2. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
notepad .env  # Windows
nano .env     # Linux/Mac
```

3. **Start Services**
```bash
# Start MongoDB (if not using cloud)
mongod

# Start Redis
redis-server

# Start the application
npm run dev
```

4. **Verify Installation**
```bash
curl http://localhost:3000/health
```

## 📋 OAuth App Setup Guide

### 1. Facebook/Instagram Setup

**Step 1: Create Facebook App**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create New App → Business → Next
3. App Name: "Social Sight"
4. Contact Email: your-email@example.com

**Step 2: Add Products**
- Facebook Login
- Instagram Basic Display
- Instagram API (for business accounts)

**Step 3: Configure OAuth Settings**
- Valid OAuth Redirect URIs: `https://yourdomain.com/auth/callback`
- App Domains: `yourdomain.com`

**Step 4: Get Credentials**
```bash
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
```

**Step 5: Request Permissions**
- `pages_manage_posts`
- `pages_read_engagement`
- `instagram_basic`
- `instagram_content_publish`

### 2. X (Twitter) Setup

**Step 1: Create Twitter App**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create Project → Production → Next
3. App Name: "Social Sight"
4. Use Case: "Making a bot or automation tool"

**Step 2: Configure OAuth 2.0**
- Type: Web App
- Callback URL: `https://yourdomain.com/auth/callback`
- Website URL: `https://yourdomain.com`

**Step 3: Get Credentials**
```bash
TWITTER_CLIENT_ID=your_client_id_here
TWITTER_CLIENT_SECRET=your_client_secret_here
```

**Step 4: Enable Required Scopes**
- `tweet.read`
- `tweet.write`
- `users.read`
- `offline.access`

### 3. LinkedIn Setup

**Step 1: Create LinkedIn App**
1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Create App
3. App Name: "Social Sight"
4. LinkedIn Page: Create or select a page

**Step 2: Add Products**
- Sign In with LinkedIn
- Marketing Developer Platform (if available)

**Step 3: OAuth Settings**
- Authorized redirect URLs: `https://yourdomain.com/auth/callback`

**Step 4: Get Credentials**
```bash
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
```

### 4. Google (YouTube) Setup

**Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create New Project: "Social Sight"
3. Enable APIs: YouTube Data API v3

**Step 2: Create OAuth Credentials**
1. APIs & Services → Credentials
2. Create Credentials → OAuth client ID
3. Application Type: Web application
4. Authorized redirect URIs: `https://yourdomain.com/auth/callback`

**Step 3: Get Credentials**
```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### 5. TikTok Setup

**Step 1: Create TikTok App**
1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Manage Apps → Create App
3. App Name: "Social Sight"

**Step 2: Configure Login Kit**
- Redirect URI: `https://yourdomain.com/auth/callback`
- Scopes: `user.info.basic`, `video.list`, `video.upload`

**Step 3: Get Credentials**
```bash
TIKTOK_CLIENT_KEY=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
```

## 🔧 Database Setup

### MongoDB Configuration

```javascript
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.posts.createIndex({ userId: 1, createdAt: -1 });
db.posts.createIndex({ "platforms.scheduledFor": 1 });
```

### Redis Configuration

```bash
# Redis for job queues
redis-server --port 6379

# Test Redis connection
redis-cli ping
```

## 🌐 API Endpoints

### Authentication
```
GET  /auth/:platform           # Initiate OAuth flow
GET  /auth/callback            # Handle OAuth callback
GET  /auth/connected           # Get connected platforms
POST /auth/:platform/refresh   # Refresh access token
DELETE /auth/:platform         # Disconnect platform
```

### Posts
```
POST /api/posts                # Create new post
GET  /api/posts                # Get user's posts
GET  /api/posts/:id            # Get specific post
PUT  /api/posts/:id            # Update post
DELETE /api/posts/:id          # Delete post
POST /api/posts/schedule       # Schedule post
GET  /api/posts/scheduled      # Get scheduled posts
```

### Analytics
```
GET  /api/analytics/dashboard      # Dashboard overview
GET  /api/analytics/posts/:id      # Post analytics
GET  /api/analytics/platform/:platform  # Platform analytics
GET  /api/analytics/summary        # Analytics summary
```

## 🔐 Security Configuration

### JWT Token Setup
```javascript
// Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

// Add to .env
JWT_SECRET=your_generated_secret_here
JWT_EXPIRES_IN=7d
```

### Rate Limiting
```javascript
// API rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Post rate limiting
const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 posts per hour
});
```

## 📊 Monitoring & Logging

### Health Check
```bash
curl http://localhost:3000/health
```

### Logging Configuration
```javascript
// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
```

## 🚀 Deployment

### Using PM2 (Production)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 logs
pm2 monit
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-mongodb-url
REDIS_URL=redis://your-redis-url
OAUTH_REDIRECT_URI=https://yourdomain.com/auth/callback
```

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Load tests
npm run test:load
```

### Test OAuth Flow
```bash
# Test Facebook OAuth
curl -X GET "http://localhost:3000/auth/facebook" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test post creation
curl -X POST "http://localhost:3000/api/posts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "text": "Test post from API"
    },
    "platforms": ["facebook", "twitter"]
  }'
```

## 📞 Support

### Common Issues

**1. MongoDB Connection Failed**
```bash
# Check MongoDB status
sudo systemctl status mongod
# Start MongoDB
sudo systemctl start mongod
```

**2. Redis Connection Failed**
```bash
# Check Redis status
redis-cli ping
# Start Redis
redis-server
```

**3. OAuth Errors**
- Verify redirect URIs match exactly
- Check app permissions and scopes
- Ensure SSL in production

**4. Rate Limiting Issues**
- Implement exponential backoff
- Use platform-specific rate limits
- Monitor API quotas

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check logs
tail -f logs/app.log
```

This backend provides a solid foundation for your Social Sight application with comprehensive OAuth flows, robust error handling, and scalable architecture. The modular design allows for easy extension and maintenance.

## 🔄 Next Steps

1. **Set up OAuth apps** for each platform
2. **Configure environment variables**
3. **Test OAuth flows** for each platform
4. **Implement frontend integration**
5. **Deploy to production**

For additional support or custom features, please refer to the platform-specific documentation or contact the development team.
