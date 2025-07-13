// Social Media API Service
import { supabase } from '../lib/supabase';

class SocialMediaService {
  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-site.netlify.app' 
      : 'http://localhost:3000';
  }

  // Get user's connected social media accounts
  async getConnectedAccounts() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('social_connections')
        .select('platform, username, connected_at, platform_user_id')
        .eq('user_id', user.user.id);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
      throw error;
    }
  }

  // Disconnect a social media account
  async disconnectAccount(platform) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('social_connections')
        .delete()
        .eq('user_id', user.user.id)
        .eq('platform', platform);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error disconnecting account:', error);
      throw error;
    }
  }

  // Get access token for a platform (for making API calls)
  async getAccessToken(platform) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('social_connections')
        .select('access_token, token_expires_at')
        .eq('user_id', user.user.id)
        .eq('platform', platform)
        .single();

      if (error) throw error;
      if (!data) throw new Error(`No ${platform} connection found`);

      // Check if token is expired
      if (data.token_expires_at && new Date(data.token_expires_at) < new Date()) {
        throw new Error(`${platform} token has expired`);
      }

      return data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  // Facebook API methods
  async getFacebookPageMetrics(pageId) {
    try {
      const accessToken = await this.getAccessToken('facebook');
      
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/insights?metric=page_fans,page_impressions,page_engaged_users&period=day&limit=30&access_token=${accessToken}`
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Facebook API error');
      
      return data;
    } catch (error) {
      console.error('Facebook API error:', error);
      throw error;
    }
  }

  async getFacebookPosts(pageId, limit = 10) {
    try {
      const accessToken = await this.getAccessToken('facebook');
      
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/posts?fields=message,created_time,likes.summary(true),comments.summary(true),shares&limit=${limit}&access_token=${accessToken}`
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Facebook API error');
      
      return data;
    } catch (error) {
      console.error('Facebook posts error:', error);
      throw error;
    }
  }

  // Instagram API methods
  async getInstagramMedia(limit = 10) {
    try {
      const accessToken = await this.getAccessToken('instagram');
      
      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${accessToken}`
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Instagram API error');
      
      return data;
    } catch (error) {
      console.error('Instagram API error:', error);
      throw error;
    }
  }

  async getInstagramInsights(mediaId) {
    try {
      const accessToken = await this.getAccessToken('instagram');
      
      const response = await fetch(
        `https://graph.instagram.com/${mediaId}/insights?metric=impressions,reach,engagement&access_token=${accessToken}`
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Instagram API error');
      
      return data;
    } catch (error) {
      console.error('Instagram insights error:', error);
      throw error;
    }
  }

  // Twitter API methods
  async getTwitterTweets(userId, maxResults = 10) {
    try {
      const accessToken = await this.getAccessToken('twitter');
      
      const response = await fetch(
        `https://api.twitter.com/2/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics,context_annotations`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Twitter API error');
      
      return data;
    } catch (error) {
      console.error('Twitter API error:', error);
      throw error;
    }
  }

  async getTwitterUserMetrics(userId) {
    try {
      const accessToken = await this.getAccessToken('twitter');
      
      const response = await fetch(
        `https://api.twitter.com/2/users/${userId}?user.fields=public_metrics,verified`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Twitter API error');
      
      return data;
    } catch (error) {
      console.error('Twitter user metrics error:', error);
      throw error;
    }
  }

  // LinkedIn API methods
  async getLinkedInProfile() {
    try {
      const accessToken = await this.getAccessToken('linkedin');
      
      const response = await fetch(
        'https://api.linkedin.com/v2/people/~:(id,firstName,lastName,profilePicture)',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'LinkedIn API error');
      
      return data;
    } catch (error) {
      console.error('LinkedIn API error:', error);
      throw error;
    }
  }

  async getLinkedInCompanyMetrics(companyId) {
    try {
      const accessToken = await this.getAccessToken('linkedin');
      
      const response = await fetch(
        `https://api.linkedin.com/v2/organizationFollowerStatistics?q=organization&organization=urn:li:organization:${companyId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'LinkedIn API error');
      
      return data;
    } catch (error) {
      console.error('LinkedIn company metrics error:', error);
      throw error;
    }
  }

  // Unified method to get metrics from all connected platforms
  async getAllPlatformMetrics() {
    try {
      const connectedAccounts = await this.getConnectedAccounts();
      const metrics = {};

      for (const account of connectedAccounts) {
        try {
          switch (account.platform) {
            case 'facebook':
              metrics.facebook = await this.getFacebookPageMetrics(account.platform_user_id);
              break;
            case 'instagram':
              metrics.instagram = await this.getInstagramMedia(5);
              break;
            case 'twitter':
              metrics.twitter = await this.getTwitterUserMetrics(account.platform_user_id);
              break;
            case 'linkedin':
              metrics.linkedin = await this.getLinkedInProfile();
              break;
          }
        } catch (error) {
          console.error(`Error fetching ${account.platform} metrics:`, error);
          metrics[account.platform] = { error: error.message };
        }
      }

      return metrics;
    } catch (error) {
      console.error('Error fetching all platform metrics:', error);
      throw error;
    }
  }
}

export default new SocialMediaService();
