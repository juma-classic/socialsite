// OAuth callback handler functions
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { code } = JSON.parse(event.body);
    const platform = event.path.split('/').pop(); // Extract platform from URL
    
    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Authorization code required' })
      };
    }

    let tokenResponse;
    let clientId;
    let clientSecret;
    let redirectUri = `${process.env.URL}/auth/callback`;

    switch (platform) {
      case 'facebook':
        clientId = process.env.FACEBOOK_CLIENT_ID;
        clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
        
        tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&redirect_uri=${redirectUri}`);
        break;
        
      case 'instagram':
        clientId = process.env.INSTAGRAM_CLIENT_ID;
        clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
        
        tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&redirect_uri=${redirectUri}&code=${code}`
        });
        break;
        
      case 'twitter':
        clientId = process.env.TWITTER_CLIENT_ID;
        clientSecret = process.env.TWITTER_CLIENT_SECRET;
        
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}&code_verifier=challenge`
        });
        break;
        
      case 'linkedin':
        clientId = process.env.LINKEDIN_CLIENT_ID;
        clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
        
        tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}&client_id=${clientId}&client_secret=${clientSecret}`
        });
        break;
        
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Unsupported platform' })
        };
    }

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    
    // Store the access token securely (you might want to encrypt it)
    // For this example, we'll return it to be stored client-side
    // In production, store it in a secure database
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        platform,
        // Don't expose the actual token in production
        message: 'Connection successful'
      })
    };
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Authentication failed',
        details: error.message
      })
    };
  }
};
