exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    
    if (!accessToken) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Instagram access token not configured' })
      };
    }

    // Instagram Basic Display API endpoints
    const baseUrl = 'https://graph.instagram.com/me';
    
    // Fetch user profile and media
    const [profileResponse, mediaResponse] = await Promise.all([
      fetch(`${baseUrl}?fields=id,username,account_type,media_count&access_token=${accessToken}`),
      fetch(`${baseUrl}/media?fields=id,caption,like_count,comments_count,timestamp&access_token=${accessToken}`)
    ]);
    
    if (!profileResponse.ok || !mediaResponse.ok) {
      throw new Error(`Instagram API error: ${profileResponse.status} or ${mediaResponse.status}`);
    }
    
    const profileData = await profileResponse.json();
    const mediaData = await mediaResponse.json();
    
    // Process the data
    let totalLikes = 0;
    let totalComments = 0;
    const hashtags = [];
    
    if (mediaData.data) {
      mediaData.data.forEach(post => {
        totalLikes += post.like_count || 0;
        totalComments += post.comments_count || 0;
        
        // Extract hashtags from caption
        if (post.caption) {
          const hashtagMatches = post.caption.match(/#\w+/g);
          if (hashtagMatches) {
            hashtags.push(...hashtagMatches);
          }
        }
      });
    }
    
    const result = {
      platform: 'instagram',
      followers: profileData.media_count || 0, // Note: Instagram Basic Display doesn't provide follower count
      likes: totalLikes,
      comments: totalComments,
      shares: 0, // Instagram doesn't provide share count via API
      hashtags: [...new Set(hashtags)], // Remove duplicates
      lastUpdated: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
    
  } catch (error) {
    console.error('Instagram API error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch Instagram metrics',
        details: error.message 
      })
    };
  }
};
