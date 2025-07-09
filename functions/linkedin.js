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
    const apiKey = process.env.LINKEDIN_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'LinkedIn API key not configured' })
      };
    }

    // LinkedIn API endpoints
    const baseUrl = 'https://api.linkedin.com/v2';
    
    // Note: LinkedIn API requires OAuth 2.0 authentication
    // This is a simplified example - you'll need to implement proper OAuth flow
    
    // Fetch organization info and posts
    const orgId = 'YOUR_ORG_ID'; // Replace with actual organization ID
    const [orgResponse, postsResponse] = await Promise.all([
      fetch(`${baseUrl}/organizations/${orgId}?projection=(id,name,followerCount)`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }),
      fetch(`${baseUrl}/shares?q=owners&owners=urn:li:organization:${orgId}&projection=(elements*(id,commentary,content,statistics))`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      })
    ]);
    
    if (!orgResponse.ok || !postsResponse.ok) {
      throw new Error(`LinkedIn API error: ${orgResponse.status} or ${postsResponse.status}`);
    }
    
    const orgData = await orgResponse.json();
    const postsData = await postsResponse.json();
    
    // Process the data
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    const hashtags = [];
    
    if (postsData.elements) {
      postsData.elements.forEach(post => {
        totalLikes += post.statistics?.likeCount || 0;
        totalComments += post.statistics?.commentCount || 0;
        totalShares += post.statistics?.shareCount || 0;
        
        // Extract hashtags from post commentary
        if (post.commentary) {
          const hashtagMatches = post.commentary.match(/#\w+/g);
          if (hashtagMatches) {
            hashtags.push(...hashtagMatches);
          }
        }
      });
    }
    
    const result = {
      platform: 'linkedin',
      followers: orgData.followerCount || 0,
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
    console.error('LinkedIn API error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch LinkedIn metrics',
        details: error.message 
      })
    };
  }
};
