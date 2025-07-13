# 🚀 Social Sight - Complete Social Media Integration Guide

## 📋 **System Overview**

Social Sight will integrate with 6 major platforms using OAuth 2.0 authentication and provide:
- User authentication via OAuth 2.0
- Content publishing (posts/videos)
- Analytics retrieval
- Post scheduling and queuing

**Tech Stack:** Node.js + Express + MongoDB
**Architecture:** RESTful API with job queuing system

---

## 🔧 **Core Backend Setup**

### **1. Dependencies Installation**

```bash
npm install express mongoose dotenv
npm install passport passport-oauth2 passport-facebook passport-google-oauth20 passport-linkedin-oauth2
npm install axios form-data multer
npm install bull redis  # For job queuing
npm install node-cron   # For scheduling
npm install jsonwebtoken bcryptjs
```

### **2. Environment Variables (.env)**

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/socialsight
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_here

# Facebook/Instagram
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# X (Twitter)
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Google (YouTube/GMB)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# TikTok
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# Redirect URI (same for all platforms)
OAUTH_REDIRECT_URI=https://yourdomain.com/auth/callback
```

### **3. Core Database Models**

```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  socialAccounts: [{
    platform: { type: String, enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'google', 'tiktok'] },
    platformUserId: String,
    username: String,
    accessToken: String,
    refreshToken: String,
    tokenExpiry: Date,
    pages: [{ // For Facebook pages, LinkedIn company pages, etc.
      id: String,
      name: String,
      accessToken: String
    }]
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

// models/Post.js
const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: {
    text: String,
    imageUrl: String,
    videoUrl: String,
    link: String
  },
  platforms: [{
    platform: String,
    platformPostId: String,
    status: { type: String, enum: ['scheduled', 'published', 'failed'], default: 'scheduled' },
    scheduledFor: Date,
    publishedAt: Date,
    error: String
  }],
  analytics: [{
    platform: String,
    likes: Number,
    comments: Number,
    shares: Number,
    views: Number,
    lastUpdated: Date
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
```

---

## 📱 **Platform Integrations**

### **1. FACEBOOK & INSTAGRAM**

#### **OAuth Setup**
```javascript
// routes/auth/facebook.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Step 1: Redirect to Facebook OAuth
router.get('/facebook', (req, res) => {
  const authURL = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${process.env.FACEBOOK_APP_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.OAUTH_REDIRECT_URI)}&` +
    `scope=pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish&` +
    `response_type=code&` +
    `state=facebook`;
  
  res.redirect(authURL);
});

// Step 2: Handle OAuth callback
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (state === 'facebook') {
    try {
      // Exchange code for access token
      const tokenResponse = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${process.env.FACEBOOK_APP_ID}&` +
        `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
        `redirect_uri=${encodeURIComponent(process.env.OAUTH_REDIRECT_URI)}&` +
        `code=${code}`);
      
      const { access_token } = tokenResponse.data;
      
      // Get user info
      const userResponse = await axios.get(`https://graph.facebook.com/me?access_token=${access_token}&fields=id,name,email`);
      const user = userResponse.data;
      
      // Get user's Facebook pages
      const pagesResponse = await axios.get(`https://graph.facebook.com/me/accounts?access_token=${access_token}`);
      const pages = pagesResponse.data.data;
      
      // Get Instagram accounts
      const instagramAccounts = [];
      for (const page of pages) {
        try {
          const igResponse = await axios.get(`https://graph.facebook.com/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`);
          if (igResponse.data.instagram_business_account) {
            instagramAccounts.push({
              pageId: page.id,
              pageName: page.name,
              instagramId: igResponse.data.instagram_business_account.id,
              accessToken: page.access_token
            });
          }
        } catch (err) {
          console.log('No Instagram account for page:', page.name);
        }
      }
      
      // Save to database
      await User.findOneAndUpdate(
        { email: user.email },
        {
          $addToSet: {
            socialAccounts: {
              platform: 'facebook',
              platformUserId: user.id,
              username: user.name,
              accessToken: access_token,
              pages: pages.map(p => ({ id: p.id, name: p.name, accessToken: p.access_token }))
            }
          }
        },
        { upsert: true, new: true }
      );
      
      res.json({ success: true, platforms: ['facebook', 'instagram'], pages, instagramAccounts });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
});

module.exports = router;
```

#### **Publishing Content**
```javascript
// services/facebook.js
class FacebookService {
  
  async publishPost(pageAccessToken, pageId, content) {
    try {
      const postData = {
        message: content.text,
        access_token: pageAccessToken
      };
      
      if (content.imageUrl) {
        postData.url = content.imageUrl;
      }
      
      const response = await axios.post(`https://graph.facebook.com/v18.0/${pageId}/feed`, postData);
      return { success: true, postId: response.data.id };
    } catch (error) {
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }
  
  async publishInstagramPost(pageAccessToken, instagramAccountId, content) {
    try {
      // Step 1: Create media object
      const mediaData = {
        image_url: content.imageUrl,
        caption: content.text,
        access_token: pageAccessToken
      };
      
      const mediaResponse = await axios.post(`https://graph.facebook.com/v18.0/${instagramAccountId}/media`, mediaData);
      const creationId = mediaResponse.data.id;
      
      // Step 2: Publish the media
      const publishResponse = await axios.post(`https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`, {
        creation_id: creationId,
        access_token: pageAccessToken
      });
      
      return { success: true, postId: publishResponse.data.id };
    } catch (error) {
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }
  
  async getPostAnalytics(postId, accessToken) {
    try {
      const response = await axios.get(`https://graph.facebook.com/v18.0/${postId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${accessToken}`);
      return {
        likes: response.data.likes?.summary?.total_count || 0,
        comments: response.data.comments?.summary?.total_count || 0,
        shares: response.data.shares?.count || 0
      };
    } catch (error) {
      console.error('Facebook analytics error:', error);
      return null;
    }
  }
}

module.exports = new FacebookService();
```

#### **App Configuration Required:**
- **Platform:** Facebook Developers (developers.facebook.com)
- **App Type:** Business
- **Required Products:** Facebook Login, Instagram Basic Display
- **Permissions:** `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`
- **Redirect URI:** `https://yourdomain.com/auth/callback`

---

### **2. X (TWITTER)**

#### **OAuth Setup**
```javascript
// routes/auth/twitter.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/twitter', (req, res) => {
  const authURL = `https://twitter.com/i/oauth2/authorize?` +
    `response_type=code&` +
    `client_id=${process.env.TWITTER_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.OAUTH_REDIRECT_URI)}&` +
    `scope=tweet.read%20tweet.write%20users.read%20offline.access&` +
    `state=twitter&` +
    `code_challenge=challenge&` +
    `code_challenge_method=plain`;
  
  res.redirect(authURL);
});

// Handle callback
router.get('/callback/twitter', async (req, res) => {
  const { code } = req.query;
  
  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://api.twitter.com/2/oauth2/token', {
      grant_type: 'authorization_code',
      client_id: process.env.TWITTER_CLIENT_ID,
      code: code,
      redirect_uri: process.env.OAUTH_REDIRECT_URI,
      code_verifier: 'challenge'
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`
      }
    });
    
    const { access_token, refresh_token } = tokenResponse.data;
    
    // Get user info
    const userResponse = await axios.get('https://api.twitter.com/2/users/me', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    
    const user = userResponse.data.data;
    
    // Save to database
    await User.findOneAndUpdate(
      { _id: req.user.id },
      {
        $addToSet: {
          socialAccounts: {
            platform: 'twitter',
            platformUserId: user.id,
            username: user.username,
            accessToken: access_token,
            refreshToken: refresh_token
          }
        }
      }
    );
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
```

#### **Publishing & Analytics**
```javascript
// services/twitter.js
class TwitterService {
  
  async publishTweet(accessToken, content) {
    try {
      const tweetData = { text: content.text };
      
      if (content.imageUrl) {
        // First upload media
        const mediaResponse = await this.uploadMedia(accessToken, content.imageUrl);
        tweetData.media = { media_ids: [mediaResponse.media_id_string] };
      }
      
      const response = await axios.post('https://api.twitter.com/2/tweets', tweetData, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      return { success: true, postId: response.data.data.id };
    } catch (error) {
      return { success: false, error: error.response?.data?.title || error.message };
    }
  }
  
  async uploadMedia(accessToken, imageUrl) {
    try {
      // Download image
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);
      
      // Upload to Twitter
      const FormData = require('form-data');
      const form = new FormData();
      form.append('media', imageBuffer, 'image.jpg');
      
      const response = await axios.post('https://upload.twitter.com/1.1/media/upload.json', form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Error('Media upload failed: ' + error.message);
    }
  }
  
  async getTweetAnalytics(tweetId, accessToken) {
    try {
      const response = await axios.get(`https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      const metrics = response.data.data.public_metrics;
      return {
        likes: metrics.like_count,
        comments: metrics.reply_count,
        shares: metrics.retweet_count,
        views: metrics.impression_count
      };
    } catch (error) {
      console.error('Twitter analytics error:', error);
      return null;
    }
  }
}

module.exports = new TwitterService();
```

#### **App Configuration Required:**
- **Platform:** Twitter Developer Portal (developer.twitter.com)
- **App Type:** OAuth 2.0 App
- **Required Permissions:** `tweet.read`, `tweet.write`, `users.read`, `offline.access`
- **Redirect URI:** `https://yourdomain.com/auth/callback`

---

### **3. LINKEDIN**

#### **OAuth Setup**
```javascript
// routes/auth/linkedin.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/linkedin', (req, res) => {
  const authURL = `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.OAUTH_REDIRECT_URI)}&` +
    `scope=r_liteprofile%20r_emailaddress%20w_member_social%20r_organization_social%20w_organization_social&` +
    `state=linkedin`;
  
  res.redirect(authURL);
});

// Handle callback
router.get('/callback/linkedin', async (req, res) => {
  const { code } = req.query;
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
      grant_type: 'authorization_code',
      code: code,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      redirect_uri: process.env.OAUTH_REDIRECT_URI
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const { access_token } = tokenResponse.data;
    
    // Get user profile
    const profileResponse = await axios.get('https://api.linkedin.com/v2/people/~?projection=(id,firstName,lastName,emailAddress)', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    
    const profile = profileResponse.data;
    
    // Get company pages (if user has access)
    const companiesResponse = await axios.get('https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    
    // Save to database
    await User.findOneAndUpdate(
      { _id: req.user.id },
      {
        $addToSet: {
          socialAccounts: {
            platform: 'linkedin',
            platformUserId: profile.id,
            username: `${profile.firstName.localized.en_US} ${profile.lastName.localized.en_US}`,
            accessToken: access_token,
            pages: companiesResponse.data.elements.map(org => ({
              id: org.organizationalTarget,
              name: org.organizationalTarget, // You'd need additional API call to get name
              accessToken: access_token
            }))
          }
        }
      }
    );
    
    res.json({ success: true, profile });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
```

#### **Publishing & Analytics**
```javascript
// services/linkedin.js
class LinkedInService {
  
  async publishPost(accessToken, userId, content, isCompanyPost = false, companyId = null) {
    try {
      const author = isCompanyPost ? `urn:li:organization:${companyId}` : `urn:li:person:${userId}`;
      
      const postData = {
        author: author,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content.text
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };
      
      if (content.imageUrl) {
        // Upload image first
        const mediaUrn = await this.uploadImage(accessToken, content.imageUrl);
        postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
          status: 'READY',
          media: mediaUrn
        }];
      }
      
      const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return { success: true, postId: response.data.id };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }
  
  async uploadImage(accessToken, imageUrl) {
    try {
      // Register upload
      const registerResponse = await axios.post('https://api.linkedin.com/v2/assets?action=registerUpload', {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: 'urn:li:person:' + userId,
          serviceRelationships: [{
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent'
          }]
        }
      }, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const asset = registerResponse.data.value.asset;
      
      // Download and upload image
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      await axios.put(uploadUrl, imageResponse.data, {
        headers: { 'Content-Type': 'application/octet-stream' }
      });
      
      return asset;
    } catch (error) {
      throw new Error('Image upload failed: ' + error.message);
    }
  }
  
  async getPostAnalytics(postId, accessToken) {
    try {
      const response = await axios.get(`https://api.linkedin.com/v2/socialMetadata/${postId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      return {
        likes: response.data.totalSocialActivityCounts.numLikes,
        comments: response.data.totalSocialActivityCounts.numComments,
        shares: response.data.totalSocialActivityCounts.numShares,
        views: response.data.totalSocialActivityCounts.numViews
      };
    } catch (error) {
      console.error('LinkedIn analytics error:', error);
      return null;
    }
  }
}

module.exports = new LinkedInService();
```

#### **App Configuration Required:**
- **Platform:** LinkedIn Developer Portal (developer.linkedin.com)
- **Required Products:** Marketing Developer Platform, Sign In with LinkedIn
- **Permissions:** `r_liteprofile`, `r_emailaddress`, `w_member_social`, `r_organization_social`, `w_organization_social`
- **Redirect URI:** `https://yourdomain.com/auth/callback`

---

This is the first part of the comprehensive guide. Would you like me to continue with the remaining platforms (TikTok, Google/YouTube) and the scheduling/queuing system?
