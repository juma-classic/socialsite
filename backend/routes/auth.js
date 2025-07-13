const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// OAuth Configuration
const getOAuthConfig = (platform) => {
  const configs = {
    facebook: {
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      userInfoUrl: 'https://graph.facebook.com/me',
      clientId: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      scope: 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,pages_show_list',
      fields: 'id,name,email'
    },
    twitter: {
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
      userInfoUrl: 'https://api.twitter.com/2/users/me',
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      scope: 'tweet.read tweet.write users.read offline.access',
      fields: 'id,name,username'
    },
    linkedin: {
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      userInfoUrl: 'https://api.linkedin.com/v2/people/~',
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      scope: 'r_liteprofile r_emailaddress w_member_social r_organization_social w_organization_social',
      fields: 'id,firstName,lastName,emailAddress'
    },
    google: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile',
      fields: 'id,name,email'
    },
    tiktok: {
      authUrl: 'https://www.tiktok.com/auth/authorize',
      tokenUrl: 'https://open-api.tiktok.com/oauth/access_token',
      userInfoUrl: 'https://open-api.tiktok.com/user/info',
      clientId: process.env.TIKTOK_CLIENT_KEY,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET,
      scope: 'user.info.basic,video.list,video.upload',
      fields: 'open_id,display_name,avatar_url'
    }
  };
  
  return configs[platform];
};

/**
 * Initiate OAuth flow for a platform
 */
router.get('/:platform', authenticateToken, async (req, res) => {
  try {
    const { platform } = req.params;
    const config = getOAuthConfig(platform);
    
    if (!config) {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    // Generate state parameter for security
    const state = Buffer.from(JSON.stringify({
      userId: req.user.id,
      platform: platform,
      timestamp: Date.now()
    })).toString('base64');

    // Store state in session
    req.session.oauthState = state;

    // Build authorization URL
    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.append('client_id', config.clientId);
    authUrl.searchParams.append('redirect_uri', process.env.OAUTH_REDIRECT_URI);
    authUrl.searchParams.append('scope', config.scope);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);

    // Platform-specific parameters
    if (platform === 'twitter') {
      authUrl.searchParams.append('code_challenge', 'challenge');
      authUrl.searchParams.append('code_challenge_method', 'plain');
    }

    res.json({
      authUrl: authUrl.toString(),
      state: state
    });
  } catch (error) {
    console.error('OAuth initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth flow' });
  }
});

/**
 * Handle OAuth callback from all platforms
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.status(400).json({ error: `OAuth error: ${error}` });
    }

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }

    // Verify state parameter
    if (state !== req.session.oauthState) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    // Decode state to get platform and user info
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const { platform, userId } = stateData;

    const config = getOAuthConfig(platform);
    if (!config) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(platform, code, config);
    if (!tokenData.success) {
      return res.status(400).json({ error: tokenData.error });
    }

    // Get user info from platform
    const userInfo = await getPlatformUserInfo(platform, tokenData.tokens, config);
    if (!userInfo.success) {
      return res.status(400).json({ error: userInfo.error });
    }

    // Get additional platform-specific data
    const platformData = await getPlatformSpecificData(platform, tokenData.tokens, config);

    // Save to database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user can add more platforms
    if (!user.canAddPlatform()) {
      return res.status(403).json({ 
        error: 'Platform limit reached', 
        message: `You can only connect ${user.subscription.features.maxPlatforms} platforms` 
      });
    }

    // Remove existing account for this platform
    user.socialAccounts = user.socialAccounts.filter(acc => acc.platform !== platform);

    // Add new account
    const socialAccount = {
      platform: platform,
      platformUserId: userInfo.user.id,
      username: userInfo.user.username || userInfo.user.name,
      displayName: userInfo.user.displayName || userInfo.user.name,
      avatar: userInfo.user.avatar,
      accessToken: tokenData.tokens.access_token,
      refreshToken: tokenData.tokens.refresh_token,
      tokenExpiry: tokenData.tokens.expires_in ? 
        new Date(Date.now() + tokenData.tokens.expires_in * 1000) : null,
      scopes: config.scope.split(' '),
      pages: platformData.pages || [],
      lastSync: new Date(),
      connectedAt: new Date()
    };

    user.socialAccounts.push(socialAccount);
    await user.save();

    // Clear session state
    delete req.session.oauthState;

    res.json({
      success: true,
      platform: platform,
      user: {
        id: userInfo.user.id,
        username: userInfo.user.username || userInfo.user.name,
        displayName: userInfo.user.displayName || userInfo.user.name,
        avatar: userInfo.user.avatar
      },
      pages: platformData.pages || [],
      connectedAt: new Date()
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Failed to complete OAuth flow' });
  }
});

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(platform, code, config) {
  try {
    const tokenPayload = {
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: code,
      redirect_uri: process.env.OAUTH_REDIRECT_URI
    };

    // Platform-specific token request modifications
    if (platform === 'twitter') {
      tokenPayload.code_verifier = 'challenge';
      delete tokenPayload.client_secret;
    }

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    if (platform === 'twitter') {
      headers['Authorization'] = `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`;
    }

    const response = await axios.post(config.tokenUrl, 
      new URLSearchParams(tokenPayload), 
      { headers }
    );

    return {
      success: true,
      tokens: response.data
    };
  } catch (error) {
    console.error(`${platform} token exchange error:`, error.response?.data);
    return {
      success: false,
      error: error.response?.data?.error_description || error.message
    };
  }
}

/**
 * Get user info from platform
 */
async function getPlatformUserInfo(platform, tokens, config) {
  try {
    const headers = {
      'Authorization': `Bearer ${tokens.access_token}`
    };

    let url = config.userInfoUrl;
    const params = {};

    // Platform-specific modifications
    if (platform === 'facebook') {
      params.fields = config.fields;
    } else if (platform === 'linkedin') {
      url += '?projection=(id,firstName,lastName,emailAddress)';
    } else if (platform === 'tiktok') {
      // TikTok requires POST request with different parameters
      const response = await axios.post(url, {
        access_token: tokens.access_token,
        open_id: tokens.open_id
      });
      
      return {
        success: true,
        user: {
          id: tokens.open_id,
          username: response.data.data.user.display_name,
          displayName: response.data.data.user.display_name,
          avatar: response.data.data.user.avatar_url
        }
      };
    }

    const response = await axios.get(url, { headers, params });
    let user = response.data;

    // Normalize user data across platforms
    if (platform === 'linkedin') {
      user = {
        id: user.id,
        name: `${user.firstName.localized.en_US} ${user.lastName.localized.en_US}`,
        username: `${user.firstName.localized.en_US} ${user.lastName.localized.en_US}`,
        email: user.emailAddress
      };
    } else if (platform === 'twitter') {
      user = {
        id: user.id,
        name: user.name,
        username: user.username
      };
    }

    return {
      success: true,
      user: user
    };
  } catch (error) {
    console.error(`${platform} user info error:`, error.response?.data);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

/**
 * Get platform-specific data (pages, channels, etc.)
 */
async function getPlatformSpecificData(platform, tokens, config) {
  try {
    const data = { pages: [] };

    if (platform === 'facebook') {
      // Get Facebook pages
      const pagesResponse = await axios.get('https://graph.facebook.com/me/accounts', {
        params: {
          access_token: tokens.access_token,
          fields: 'id,name,access_token,category,fan_count'
        }
      });

      data.pages = pagesResponse.data.data.map(page => ({
        id: page.id,
        name: page.name,
        accessToken: page.access_token,
        type: 'page',
        followers: page.fan_count || 0,
        isActive: true
      }));

      // Get Instagram accounts for each page
      for (const page of data.pages) {
        try {
          const igResponse = await axios.get(`https://graph.facebook.com/${page.id}`, {
            params: {
              fields: 'instagram_business_account',
              access_token: page.accessToken
            }
          });

          if (igResponse.data.instagram_business_account) {
            const igDetailsResponse = await axios.get(`https://graph.facebook.com/${igResponse.data.instagram_business_account.id}`, {
              params: {
                fields: 'name,username,followers_count',
                access_token: page.accessToken
              }
            });

            data.pages.push({
              id: igResponse.data.instagram_business_account.id,
              name: igDetailsResponse.data.name,
              accessToken: page.accessToken,
              type: 'instagram_business',
              followers: igDetailsResponse.data.followers_count || 0,
              isActive: true,
              parentPageId: page.id
            });
          }
        } catch (igError) {
          console.log(`No Instagram account for page ${page.name}`);
        }
      }
    } else if (platform === 'linkedin') {
      // Get LinkedIn company pages
      try {
        const companiesResponse = await axios.get('https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee', {
          headers: { 'Authorization': `Bearer ${tokens.access_token}` }
        });

        data.pages = companiesResponse.data.elements.map(org => ({
          id: org.organizationalTarget,
          name: org.organizationalTarget, // Would need additional API call for name
          accessToken: tokens.access_token,
          type: 'company',
          isActive: true
        }));
      } catch (companyError) {
        console.log('No LinkedIn company pages found');
      }
    } else if (platform === 'google') {
      // Get YouTube channel
      try {
        const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
          params: {
            part: 'snippet,statistics',
            mine: true,
            access_token: tokens.access_token
          }
        });

        if (channelResponse.data.items.length > 0) {
          const channel = channelResponse.data.items[0];
          data.pages.push({
            id: channel.id,
            name: channel.snippet.title,
            accessToken: tokens.access_token,
            type: 'youtube_channel',
            followers: parseInt(channel.statistics.subscriberCount) || 0,
            isActive: true
          });
        }
      } catch (channelError) {
        console.log('No YouTube channel found');
      }
    }

    return data;
  } catch (error) {
    console.error(`${platform} specific data error:`, error.response?.data);
    return { pages: [] };
  }
}

/**
 * Disconnect a platform
 */
router.delete('/:platform', authenticateToken, async (req, res) => {
  try {
    const { platform } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove the platform account
    user.socialAccounts = user.socialAccounts.filter(acc => acc.platform !== platform);
    await user.save();

    res.json({ success: true, message: `${platform} disconnected successfully` });
  } catch (error) {
    console.error('Platform disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect platform' });
  }
});

/**
 * Get connected platforms
 */
router.get('/connected', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const connectedPlatforms = user.socialAccounts
      .filter(acc => acc.isActive)
      .map(acc => ({
        platform: acc.platform,
        username: acc.username,
        displayName: acc.displayName,
        avatar: acc.avatar,
        connectedAt: acc.connectedAt,
        lastSync: acc.lastSync,
        pages: acc.pages.filter(page => page.isActive)
      }));

    res.json({
      connectedPlatforms,
      totalConnected: connectedPlatforms.length,
      maxPlatforms: user.subscription.features.maxPlatforms
    });
  } catch (error) {
    console.error('Get connected platforms error:', error);
    res.status(500).json({ error: 'Failed to get connected platforms' });
  }
});

/**
 * Refresh token for a platform
 */
router.post('/:platform/refresh', authenticateToken, async (req, res) => {
  try {
    const { platform } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const account = user.getSocialAccount(platform);
    if (!account || !account.refreshToken) {
      return res.status(404).json({ error: 'Platform not connected or no refresh token' });
    }

    const config = getOAuthConfig(platform);
    const refreshResult = await refreshAccessToken(platform, account.refreshToken, config);

    if (!refreshResult.success) {
      return res.status(400).json({ error: refreshResult.error });
    }

    // Update tokens in database
    account.accessToken = refreshResult.tokens.access_token;
    if (refreshResult.tokens.refresh_token) {
      account.refreshToken = refreshResult.tokens.refresh_token;
    }
    account.tokenExpiry = refreshResult.tokens.expires_in ? 
      new Date(Date.now() + refreshResult.tokens.expires_in * 1000) : null;
    account.lastSync = new Date();

    await user.save();

    res.json({ success: true, message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(platform, refreshToken, config) {
  try {
    const tokenPayload = {
      grant_type: 'refresh_token',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken
    };

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const response = await axios.post(config.tokenUrl, 
      new URLSearchParams(tokenPayload), 
      { headers }
    );

    return {
      success: true,
      tokens: response.data
    };
  } catch (error) {
    console.error(`${platform} token refresh error:`, error.response?.data);
    return {
      success: false,
      error: error.response?.data?.error_description || error.message
    };
  }
}

module.exports = router;
