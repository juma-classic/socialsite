# 🚀 Social Media Platform Integration Guide

This guide will help you connect your social media management dashboard to real social media platforms using OAuth authentication.

## 📋 Prerequisites

1. **Supabase Database Setup**
   - Run the SQL script in `supabase_social_connections.sql` in your Supabase SQL editor
   - This creates the `social_connections` table to store OAuth tokens

2. **Social Media Developer Accounts**
   - You'll need developer accounts for each platform you want to integrate

## 🔧 Platform Setup Instructions

### 1. Facebook & Instagram Integration

**Step 1: Create Facebook App**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App" → "Business" → "Continue"
3. Fill in app details and create app

**Step 2: Configure Facebook Login**
1. In app dashboard, go to "Add Product" → "Facebook Login"
2. Set Valid OAuth Redirect URIs:
   ```
   https://your-site.netlify.app/.netlify/functions/oauth/callback?platform=facebook
   http://localhost:3000/.netlify/functions/oauth/callback?platform=facebook
   ```

**Step 3: Add Instagram Basic Display**
1. Go to "Add Product" → "Instagram Basic Display"
2. Set Valid OAuth Redirect URIs:
   ```
   https://your-site.netlify.app/.netlify/functions/oauth/callback?platform=instagram
   http://localhost:3000/.netlify/functions/oauth/callback?platform=instagram
   ```

**Step 4: Get App Credentials**
1. Go to Settings → Basic
2. Copy App ID and App Secret
3. Add to your `.env` file:
   ```
   FACEBOOK_CLIENT_ID=your_facebook_app_id
   FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
   INSTAGRAM_CLIENT_ID=your_facebook_app_id
   INSTAGRAM_CLIENT_SECRET=your_facebook_app_secret
   ```

### 2. Twitter/X Integration

**Step 1: Create Twitter App**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Apply for developer account if needed
3. Create a new app

**Step 2: Configure OAuth**
1. In app settings, go to "Authentication settings"
2. Enable OAuth 2.0
3. Set Callback URLs:
   ```
   https://your-site.netlify.app/.netlify/functions/oauth/callback?platform=twitter
   http://localhost:3000/.netlify/functions/oauth/callback?platform=twitter
   ```

**Step 3: Get Credentials**
1. Go to "Keys and tokens" tab
2. Copy Client ID and Client Secret
3. Add to your `.env` file:
   ```
   TWITTER_CLIENT_ID=your_twitter_client_id
   TWITTER_CLIENT_SECRET=your_twitter_client_secret
   ```

### 3. LinkedIn Integration

**Step 1: Create LinkedIn App**
1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Click "Create App"
3. Fill in app details and create app

**Step 2: Configure OAuth**
1. In app dashboard, go to "Auth" tab
2. Add Authorized Redirect URLs:
   ```
   https://your-site.netlify.app/.netlify/functions/oauth/callback?platform=linkedin
   http://localhost:3000/.netlify/functions/oauth/callback?platform=linkedin
   ```

**Step 3: Get Credentials**
1. In "Auth" tab, find Client ID and Client Secret
2. Add to your `.env` file:
   ```
   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   ```

## 🌐 Deployment Setup

### Netlify Environment Variables
1. Go to your Netlify dashboard
2. Site Settings → Environment Variables
3. Add all the OAuth credentials from your `.env` file

### Important Notes:
- **Never commit OAuth secrets to version control**
- **Use different apps for development and production**
- **Regularly rotate OAuth secrets**
- **Monitor API usage and rate limits**

## 🧪 Testing the Integration

1. **Start Development Server**
   ```bash
   npm start
   ```

2. **Test OAuth Flow**
   - Go to Settings → Connect Account
   - Click "Connect" on any platform
   - You should be redirected to the platform's OAuth page
   - After authorization, you'll be redirected back

3. **Check Database**
   - Verify connections are stored in `social_connections` table
   - Check that tokens are encrypted/secured

## 🔍 Troubleshooting

### Common Issues:

**1. "OAuth credentials not configured"**
- Ensure environment variables are set correctly
- Check spelling of environment variable names

**2. "Invalid redirect URI"**
- Verify redirect URIs in platform developer console
- Make sure they match exactly (including query parameters)

**3. "Token expired"**
- Some platforms require token refresh
- Implement refresh token logic for long-term access

**4. "CORS errors"**
- Ensure Netlify functions are deployed
- Check network tab for actual error messages

## 📊 Using the Connected Accounts

Once connected, you can:

1. **Fetch Real Metrics**
   ```javascript
   import socialMediaService from './services/socialMediaService';
   
   const metrics = await socialMediaService.getAllPlatformMetrics();
   ```

2. **Get Platform-Specific Data**
   ```javascript
   const facebookPosts = await socialMediaService.getFacebookPosts(pageId);
   const instagramMedia = await socialMediaService.getInstagramMedia();
   ```

3. **Manage Connections**
   ```javascript
   const accounts = await socialMediaService.getConnectedAccounts();
   await socialMediaService.disconnectAccount('facebook');
   ```

## 🚀 Next Steps

1. **Implement Data Refresh**
   - Set up cron jobs to refresh data periodically
   - Handle token expiration and refresh

2. **Add More Platforms**
   - YouTube, TikTok, Pinterest, etc.
   - Follow the same OAuth pattern

3. **Enhance Security**
   - Implement token encryption
   - Add rate limiting
   - Monitor for suspicious activity

4. **Add Analytics**
   - Track connection success rates
   - Monitor API usage
   - Set up alerts for failures

## 📝 API Rate Limits

- **Facebook**: 200 calls per hour per user
- **Instagram**: 240 calls per hour per user
- **Twitter**: 300 requests per 15 minutes
- **LinkedIn**: 1000 requests per day

Plan your data fetching accordingly and implement proper caching!
