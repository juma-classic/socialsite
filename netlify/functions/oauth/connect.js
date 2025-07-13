// OAuth Connect Handler
const { supabase } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseClient = supabase(supabaseUrl, supabaseKey);

// OAuth configurations for each platform
const oauthConfigs = {
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    redirectUri: `${process.env.URL}/.netlify/functions/oauth/callback?platform=facebook`,
    scope: 'pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth'
  },
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    redirectUri: `${process.env.URL}/.netlify/functions/oauth/callback?platform=instagram`,
    scope: 'user_profile,user_media',
    authUrl: 'https://api.instagram.com/oauth/authorize'
  },
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    redirectUri: `${process.env.URL}/.netlify/functions/oauth/callback?platform=twitter`,
    scope: 'tweet.read,users.read,offline.access',
    authUrl: 'https://twitter.com/i/oauth2/authorize'
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: `${process.env.URL}/.netlify/functions/oauth/callback?platform=linkedin`,
    scope: 'r_liteprofile,r_emailaddress,w_member_social',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization'
  }
};

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const { platform } = event.queryStringParameters;
    
    if (!platform || !oauthConfigs[platform]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid platform specified' })
      };
    }

    const config = oauthConfigs[platform];
    
    // Check if required environment variables are set
    if (!config.clientId || !config.clientSecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: `${platform.toUpperCase()} OAuth credentials not configured`,
          setup: `Please set ${platform.toUpperCase()}_CLIENT_ID and ${platform.toUpperCase()}_CLIENT_SECRET environment variables`
        })
      };
    }

    // Generate state parameter for security
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store state in your database for verification
    // In production, you'd store this in a secure way
    
    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope,
      response_type: 'code',
      state: state
    });

    const authUrl = `${config.authUrl}?${params.toString()}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        authUrl,
        state,
        platform 
      })
    };

  } catch (error) {
    console.error('OAuth connect error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};
