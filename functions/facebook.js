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
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    
    if (!accessToken) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Facebook access token not configured' })
      };
    }

    // Facebook Graph API endpoints
    const pageId = 'YOUR_PAGE_ID'; // Replace with actual page ID
    const baseUrl = `https://graph.facebook.com/v18.0/${pageId}`;
    
    // Fetch page insights
    const response = await fetch(`${baseUrl}?fields=followers_count,posts{likes.summary(true),comments.summary(true),shares}&access_token=${accessToken}`);
    
    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the data
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    const hashtags = [];
    
    if (data.posts && data.posts.data) {
      data.posts.data.forEach(post => {
        totalLikes += post.likes?.summary?.total_count || 0;
        totalComments += post.comments?.summary?.total_count || 0;
        totalShares += post.shares?.count || 0;
        
        // Extract hashtags from post message
        if (post.message) {
          const hashtagMatches = post.message.match(/#\w+/g);
          if (hashtagMatches) {
            hashtags.push(...hashtagMatches);
          }
        }
      });
    }
    
    const result = {
      platform: 'facebook',
      followers: data.followers_count || 0,
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      hashtags: [...new Set(hashtags)], // Remove duplicates
      lastUpdated: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
    
  } catch (error) {
    console.error('Facebook API error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch Facebook metrics',
        details: error.message 
      })
    };
  }
};
