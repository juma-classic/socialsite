const axios = require('axios');
const FormData = require('form-data');

class FacebookService {
  constructor() {
    this.baseURL = 'https://graph.facebook.com/v18.0';
  }

  /**
   * Publish a post to Facebook Page
   */
  async publishPost(pageAccessToken, pageId, content) {
    try {
      const postData = {
        message: content.text,
        access_token: pageAccessToken
      };

      // Handle image attachment
      if (content.images && content.images.length > 0) {
        if (content.images.length === 1) {
          postData.url = content.images[0].url;
        } else {
          // Multiple images - create photo album
          return await this.publishPhotoAlbum(pageAccessToken, pageId, content);
        }
      }

      // Handle link attachment
      if (content.links && content.links.length > 0) {
        postData.link = content.links[0].url;
      }

      const response = await axios.post(`${this.baseURL}/${pageId}/feed`, postData);
      
      return { 
        success: true, 
        postId: response.data.id,
        platform: 'facebook'
      };
    } catch (error) {
      console.error('Facebook publish error:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message,
        platform: 'facebook'
      };
    }
  }

  /**
   * Publish multiple photos as album
   */
  async publishPhotoAlbum(pageAccessToken, pageId, content) {
    try {
      const photos = [];
      
      // Upload each photo
      for (const image of content.images) {
        const photoResponse = await axios.post(`${this.baseURL}/${pageId}/photos`, {
          url: image.url,
          published: false,
          access_token: pageAccessToken
        });
        photos.push({ media_fbid: photoResponse.data.id });
      }

      // Create album post
      const albumResponse = await axios.post(`${this.baseURL}/${pageId}/feed`, {
        message: content.text,
        attached_media: photos,
        access_token: pageAccessToken
      });

      return { 
        success: true, 
        postId: albumResponse.data.id,
        platform: 'facebook'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message,
        platform: 'facebook'
      };
    }
  }

  /**
   * Publish to Instagram Business Account
   */
  async publishInstagramPost(pageAccessToken, instagramAccountId, content) {
    try {
      if (!content.images || content.images.length === 0) {
        throw new Error('Instagram posts require at least one image');
      }

      let mediaContainers = [];

      // Create media containers for each image
      for (const image of content.images) {
        const containerResponse = await axios.post(`${this.baseURL}/${instagramAccountId}/media`, {
          image_url: image.url,
          caption: content.text,
          access_token: pageAccessToken
        });
        mediaContainers.push(containerResponse.data.id);
      }

      // For single image
      if (mediaContainers.length === 1) {
        const publishResponse = await axios.post(`${this.baseURL}/${instagramAccountId}/media_publish`, {
          creation_id: mediaContainers[0],
          access_token: pageAccessToken
        });

        return { 
          success: true, 
          postId: publishResponse.data.id,
          platform: 'instagram'
        };
      }

      // For carousel (multiple images)
      const carouselResponse = await axios.post(`${this.baseURL}/${instagramAccountId}/media`, {
        media_type: 'CAROUSEL',
        children: mediaContainers,
        caption: content.text,
        access_token: pageAccessToken
      });

      const publishResponse = await axios.post(`${this.baseURL}/${instagramAccountId}/media_publish`, {
        creation_id: carouselResponse.data.id,
        access_token: pageAccessToken
      });

      return { 
        success: true, 
        postId: publishResponse.data.id,
        platform: 'instagram'
      };
    } catch (error) {
      console.error('Instagram publish error:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message,
        platform: 'instagram'
      };
    }
  }

  /**
   * Publish Instagram Story
   */
  async publishInstagramStory(pageAccessToken, instagramAccountId, content) {
    try {
      const storyResponse = await axios.post(`${this.baseURL}/${instagramAccountId}/media`, {
        image_url: content.images[0].url,
        media_type: 'STORIES',
        access_token: pageAccessToken
      });

      const publishResponse = await axios.post(`${this.baseURL}/${instagramAccountId}/media_publish`, {
        creation_id: storyResponse.data.id,
        access_token: pageAccessToken
      });

      return { 
        success: true, 
        postId: publishResponse.data.id,
        platform: 'instagram_story'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message,
        platform: 'instagram_story'
      };
    }
  }

  /**
   * Get post analytics
   */
  async getPostAnalytics(postId, accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/${postId}`, {
        params: {
          fields: 'likes.summary(true),comments.summary(true),shares,reactions.summary(true)',
          access_token: accessToken
        }
      });

      const data = response.data;
      return {
        likes: data.likes?.summary?.total_count || 0,
        comments: data.comments?.summary?.total_count || 0,
        shares: data.shares?.count || 0,
        reactions: data.reactions?.summary?.total_count || 0,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Facebook analytics error:', error.response?.data);
      return null;
    }
  }

  /**
   * Get Instagram post analytics
   */
  async getInstagramAnalytics(mediaId, accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/${mediaId}/insights`, {
        params: {
          metric: 'impressions,reach,likes,comments,saves',
          access_token: accessToken
        }
      });

      const insights = response.data.data;
      const analytics = {};

      insights.forEach(insight => {
        analytics[insight.name] = insight.values[0].value;
      });

      return {
        impressions: analytics.impressions || 0,
        reach: analytics.reach || 0,
        likes: analytics.likes || 0,
        comments: analytics.comments || 0,
        saves: analytics.saves || 0,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Instagram analytics error:', error.response?.data);
      return null;
    }
  }

  /**
   * Get user's Facebook pages
   */
  async getUserPages(accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/me/accounts`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,access_token,category,fan_count'
        }
      });

      return response.data.data.map(page => ({
        id: page.id,
        name: page.name,
        accessToken: page.access_token,
        category: page.category,
        followers: page.fan_count || 0,
        type: 'page'
      }));
    } catch (error) {
      console.error('Error fetching Facebook pages:', error.response?.data);
      return [];
    }
  }

  /**
   * Get Instagram business accounts connected to pages
   */
  async getInstagramAccounts(pageAccessToken, pageId) {
    try {
      const response = await axios.get(`${this.baseURL}/${pageId}`, {
        params: {
          fields: 'instagram_business_account',
          access_token: pageAccessToken
        }
      });

      if (response.data.instagram_business_account) {
        const igResponse = await axios.get(`${this.baseURL}/${response.data.instagram_business_account.id}`, {
          params: {
            fields: 'id,name,username,followers_count,media_count',
            access_token: pageAccessToken
          }
        });

        return {
          id: igResponse.data.id,
          name: igResponse.data.name,
          username: igResponse.data.username,
          followers: igResponse.data.followers_count || 0,
          mediaCount: igResponse.data.media_count || 0,
          type: 'instagram_business'
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching Instagram account:', error.response?.data);
      return null;
    }
  }

  /**
   * Upload media to Facebook
   */
  async uploadMedia(pageAccessToken, pageId, mediaUrl, mediaType = 'photo') {
    try {
      const endpoint = mediaType === 'video' ? 'videos' : 'photos';
      const response = await axios.post(`${this.baseURL}/${pageId}/${endpoint}`, {
        url: mediaUrl,
        published: false,
        access_token: pageAccessToken
      });

      return {
        success: true,
        mediaId: response.data.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Schedule a post (Facebook native scheduling)
   */
  async schedulePost(pageAccessToken, pageId, content, scheduledTime) {
    try {
      const postData = {
        message: content.text,
        published: false,
        scheduled_publish_time: Math.floor(scheduledTime.getTime() / 1000),
        access_token: pageAccessToken
      };

      if (content.images && content.images.length > 0) {
        postData.url = content.images[0].url;
      }

      const response = await axios.post(`${this.baseURL}/${pageId}/feed`, postData);
      
      return { 
        success: true, 
        postId: response.data.id,
        platform: 'facebook'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message,
        platform: 'facebook'
      };
    }
  }

  /**
   * Delete a post
   */
  async deletePost(postId, accessToken) {
    try {
      const response = await axios.delete(`${this.baseURL}/${postId}`, {
        params: { access_token: accessToken }
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message 
      };
    }
  }

  /**
   * Validate access token
   */
  async validateToken(accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/me`, {
        params: { access_token: accessToken }
      });

      return {
        valid: true,
        user: response.data
      };
    } catch (error) {
      return {
        valid: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Get page insights
   */
  async getPageInsights(pageId, accessToken, metrics = ['page_fans', 'page_impressions', 'page_engagements']) {
    try {
      const response = await axios.get(`${this.baseURL}/${pageId}/insights`, {
        params: {
          metric: metrics.join(','),
          access_token: accessToken
        }
      });

      const insights = {};
      response.data.data.forEach(insight => {
        insights[insight.name] = insight.values[0].value;
      });

      return insights;
    } catch (error) {
      console.error('Page insights error:', error.response?.data);
      return {};
    }
  }
}

module.exports = new FacebookService();
