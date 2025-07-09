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
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    
    if (!bearerToken) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Twitter bearer token not configured' })
      };
    }

    // Twitter API v2 endpoints
    const userId = 'YOUR_USER_ID'; // Replace with actual user ID
    const baseUrl = 'https://api.twitter.com/2';
    
    // Fetch user data and recent tweets
    const [userResponse, tweetsResponse] = await Promise.all([
      fetch(`${baseUrl}/users/${userId}?user.fields=public_metrics`, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`
        }
      }),
      fetch(`${baseUrl}/users/${userId}/tweets?tweet.fields=public_metrics,created_at&max_results=100`, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`
        }
      })
    ]);
    
    if (!userResponse.ok || !tweetsResponse.ok) {
      throw new Error(`Twitter API error: ${userResponse.status} or ${tweetsResponse.status}`);
    }
    
    const userData = await userResponse.json();
    const tweetsData = await tweetsResponse.json();
    
    // Process the data
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    const hashtags = [];
    
    if (tweetsData.data) {
      tweetsData.data.forEach(tweet => {
        totalLikes += tweet.public_metrics?.like_count || 0;
        totalComments += tweet.public_metrics?.reply_count || 0;
        totalShares += tweet.public_metrics?.retweet_count || 0;
        
        // Extract hashtags from tweet text
        if (tweet.text) {
          const hashtagMatches = tweet.text.match(/#\w+/g);
          if (hashtagMatches) {
            hashtags.push(...hashtagMatches);
          }
        }
      });
    }
    
    const result = {
      platform: 'twitter',
      followers: userData.data?.public_metrics?.followers_count || 0,
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
    console.error('Twitter API error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch Twitter metrics',
        details: error.message 
      })
    };
  }
};
