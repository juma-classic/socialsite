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

  // Debug endpoint to check environment variables
  const envCheck = {
    facebook_client_id: process.env.FACEBOOK_CLIENT_ID ? 'SET' : 'NOT_SET',
    facebook_client_secret: process.env.FACEBOOK_CLIENT_SECRET ? 'SET' : 'NOT_SET',
    instagram_client_id: process.env.INSTAGRAM_CLIENT_ID ? 'SET' : 'NOT_SET',
    instagram_client_secret: process.env.INSTAGRAM_CLIENT_SECRET ? 'SET' : 'NOT_SET',
    twitter_client_id: process.env.TWITTER_CLIENT_ID ? 'SET' : 'NOT_SET',
    twitter_client_secret: process.env.TWITTER_CLIENT_SECRET ? 'SET' : 'NOT_SET',
    linkedin_client_id: process.env.LINKEDIN_CLIENT_ID ? 'SET' : 'NOT_SET',
    linkedin_client_secret: process.env.LINKEDIN_CLIENT_SECRET ? 'SET' : 'NOT_SET',
    all_env_vars: Object.keys(process.env).filter(key => 
      key.includes('CLIENT') || key.includes('SECRET') || key.includes('FACEBOOK') || 
      key.includes('INSTAGRAM') || key.includes('TWITTER') || key.includes('LINKEDIN')
    )
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(envCheck, null, 2)
  };
};
