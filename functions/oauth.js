exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const { platform } = event.queryStringParameters || {};
  const pathSegments = event.path.split('/');
  const action = pathSegments[pathSegments.length - 1];

  try {
    if (action === 'connect' || event.path.includes('connect')) {
      // Generate OAuth URLs for different platforms
      const oauthConfigs = {
        facebook: {
          authUrl: `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent('https://socialsignt.netlify.app/.netlify/functions/oauth')}&scope=pages_show_list,pages_read_engagement,pages_read_user_content&response_type=code&state=facebook`,
          scopes: ['pages_show_list', 'pages_read_engagement', 'pages_read_user_content']
        },
        instagram: {
          authUrl: `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent('https://socialsignt.netlify.app/.netlify/functions/oauth')}&scope=user_profile,user_media&response_type=code&state=instagram`,
          scopes: ['user_profile', 'user_media']
        },
        twitter: {
          authUrl: `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent('https://socialsignt.netlify.app/.netlify/functions/oauth')}&scope=tweet.read%20users.read%20follows.read&state=twitter&code_challenge=challenge&code_challenge_method=plain`,
          scopes: ['tweet.read', 'users.read', 'follows.read']
        },
        linkedin: {
          authUrl: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent('https://socialsignt.netlify.app/.netlify/functions/oauth')}&scope=r_liteprofile%20r_emailaddress&state=linkedin`,
          scopes: ['r_liteprofile', 'r_emailaddress']
        }
      };

      const config = oauthConfigs[platform];
      if (!config) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Unsupported platform' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          authUrl: config.authUrl,
          platform: platform
        })
      };
    }

    if (action === 'callback' || event.queryStringParameters?.code) {
      // Handle OAuth callback
      const { code, state } = event.queryStringParameters || {};
      
      if (!code) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Authorization code required' })
        };
      }

      // Exchange code for access token
      let tokenResponse;
      let userData;

      switch (state) {
        case 'facebook':
          tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&redirect_uri=${encodeURIComponent('https://socialsignt.netlify.app/.netlify/functions/oauth')}&code=${code}`);
          const fbTokenData = await tokenResponse.json();
          
          if (fbTokenData.access_token) {
            const userResponse = await fetch(`https://graph.facebook.com/me?access_token=${fbTokenData.access_token}&fields=name,id`);
            userData = await userResponse.json();
          }
          break;

        case 'instagram':
          const igFormData = new FormData();
          igFormData.append('client_id', process.env.INSTAGRAM_CLIENT_ID);
          igFormData.append('client_secret', process.env.INSTAGRAM_CLIENT_SECRET);
          igFormData.append('grant_type', 'authorization_code');
          igFormData.append('redirect_uri', 'https://socialsignt.netlify.app/.netlify/functions/oauth');
          igFormData.append('code', code);

          tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
            method: 'POST',
            body: igFormData
          });
          const igTokenData = await tokenResponse.json();
          
          if (igTokenData.access_token) {
            const userResponse = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${igTokenData.access_token}`);
            userData = await userResponse.json();
          }
          break;

        case 'twitter':
          const twitterTokenData = {
            grant_type: 'authorization_code',
            client_id: process.env.TWITTER_CLIENT_ID,
            code: code,
            redirect_uri: 'https://socialsignt.netlify.app/.netlify/functions/oauth',
            code_verifier: 'challenge'
          };

          tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`
            },
            body: new URLSearchParams(twitterTokenData).toString()
          });
          const twTokenData = await tokenResponse.json();
          
          if (twTokenData.access_token) {
            const userResponse = await fetch('https://api.twitter.com/2/users/me', {
              headers: {
                'Authorization': `Bearer ${twTokenData.access_token}`
              }
            });
            const twUserData = await userResponse.json();
            userData = twUserData.data;
          }
          break;

        case 'linkedin':
          const linkedinTokenData = {
            grant_type: 'authorization_code',
            code: code,
            client_id: process.env.LINKEDIN_CLIENT_ID,
            client_secret: process.env.LINKEDIN_CLIENT_SECRET,
            redirect_uri: 'https://socialsignt.netlify.app/.netlify/functions/oauth'
          };

          tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(linkedinTokenData).toString()
          });
          const liTokenData = await tokenResponse.json();
          
          if (liTokenData.access_token) {
            const userResponse = await fetch('https://api.linkedin.com/v2/people/~?projection=(id,firstName,lastName)', {
              headers: {
                'Authorization': `Bearer ${liTokenData.access_token}`
              }
            });
            userData = await userResponse.json();
          }
          break;

        default:
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid state parameter' })
          };
      }

      // Return success page that will communicate with parent window
      const successPage = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Account Connected Successfully</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .success { color: #10b981; font-size: 24px; margin-bottom: 20px; }
              .info { color: #6b7280; margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="success">✅ Account Connected Successfully!</div>
            <div class="info">You can close this window now.</div>
            <script>
              window.opener.postMessage({
                type: 'OAUTH_SUCCESS',
                platform: '${state}',
                username: '${userData?.username || userData?.name || userData?.firstName}',
                userId: '${userData?.id}'
              }, window.location.origin);
              setTimeout(() => window.close(), 2000);
            </script>
          </body>
        </html>
      `;

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'text/html'
        },
        body: successPage
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    console.error('OAuth error:', error);
    
    // Return error page for OAuth callback errors
    if (action === 'callback') {
      const errorPage = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Connection Failed</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: #ef4444; font-size: 24px; margin-bottom: 20px; }
              .info { color: #6b7280; margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="error">❌ Connection Failed</div>
            <div class="info">There was an error connecting your account. Please try again.</div>
            <script>
              window.opener.postMessage({
                type: 'OAUTH_ERROR',
                error: '${error.message}'
              }, window.location.origin);
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `;

      return {
        statusCode: 500,
        headers: {
          ...headers,
          'Content-Type': 'text/html'
        },
        body: errorPage
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'OAuth authentication failed',
        details: error.message 
      })
    };
  }
};
