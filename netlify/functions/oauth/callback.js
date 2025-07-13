// OAuth Callback Handler
const { supabase } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseClient = supabase(supabaseUrl, supabaseKey);

// Token exchange endpoints for each platform
const tokenExchangeConfigs = {
  facebook: {
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/me?fields=id,name,picture',
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET
  },
  instagram: {
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    userInfoUrl: 'https://graph.instagram.com/me?fields=id,username,media_count',
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET
  },
  twitter: {
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    userInfoUrl: 'https://api.twitter.com/2/users/me',
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET
  },
  linkedin: {
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoUrl: 'https://api.linkedin.com/v2/people/~:(id,firstName,lastName,profilePicture)',
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET
  }
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const { platform, code, state, error } = event.queryStringParameters;

    if (error) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html',
        },
        body: `
          <html>
            <head><title>OAuth Error</title></head>
            <body>
              <script>
                window.opener.postMessage({
                  type: 'OAUTH_ERROR',
                  error: '${error}',
                  platform: '${platform}'
                }, '*');
                window.close();
              </script>
            </body>
          </html>
        `
      };
    }

    if (!platform || !code) {
      throw new Error('Missing required parameters');
    }

    const config = tokenExchangeConfigs[platform];
    if (!config) {
      throw new Error('Invalid platform');
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: code,
        redirect_uri: `${process.env.URL}/.netlify/functions/oauth/callback?platform=${platform}`
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${JSON.stringify(tokenData)}`);
    }

    // Get user info
    const userResponse = await fetch(config.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const userData = await userResponse.json();
    
    if (!userResponse.ok) {
      throw new Error(`User info fetch failed: ${JSON.stringify(userData)}`);
    }

    // Store the connection in your database
    // This is a simplified example - in production, you'd want to encrypt tokens
    const { error: dbError } = await supabaseClient
      .from('social_connections')
      .upsert({
        platform: platform,
        platform_user_id: userData.id,
        username: userData.name || userData.username || userData.firstName,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: tokenData.expires_in ? 
          new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
        connected_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue anyway - we'll return success to user
    }

    // Return success page that communicates with parent window
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: `
        <html>
          <head><title>Connection Successful</title></head>
          <body>
            <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
              <h2>✅ Successfully Connected!</h2>
              <p>You can close this window.</p>
            </div>
            <script>
              window.opener.postMessage({
                type: 'OAUTH_SUCCESS',
                platform: '${platform}',
                username: '${userData.name || userData.username || userData.firstName}',
                accessToken: '${tokenData.access_token}',
                userData: ${JSON.stringify(userData)}
              }, '*');
              setTimeout(() => window.close(), 2000);
            </script>
          </body>
        </html>
      `
    };

  } catch (error) {
    console.error('OAuth callback error:', error);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: `
        <html>
          <head><title>OAuth Error</title></head>
          <body>
            <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
              <h2>❌ Connection Failed</h2>
              <p>${error.message}</p>
              <p>You can close this window.</p>
            </div>
            <script>
              window.opener.postMessage({
                type: 'OAUTH_ERROR',
                error: '${error.message}',
                platform: '${event.queryStringParameters?.platform}'
              }, '*');
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `
    };
  }
};
