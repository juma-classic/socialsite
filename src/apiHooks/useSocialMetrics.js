import { useState, useEffect, useCallback } from 'react';

export function useSocialMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch metrics from all platforms
      const responses = await Promise.allSettled([
        fetch('/api/facebook').then(res => res.json()),
        fetch('/api/instagram').then(res => res.json()),
        fetch('/api/twitter').then(res => res.json()),
        fetch('/api/linkedin').then(res => res.json()),
      ]);

      const [facebookResult, instagramResult, twitterResult, linkedinResult] = responses;

      // Combine results
      const combinedMetrics = {
        totalFollowers: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        topHashtags: [],
        platforms: {
          facebook: facebookResult.status === 'fulfilled' ? facebookResult.value : { error: facebookResult.reason },
          instagram: instagramResult.status === 'fulfilled' ? instagramResult.value : { error: instagramResult.reason },
          twitter: twitterResult.status === 'fulfilled' ? twitterResult.value : { error: twitterResult.reason },
          linkedin: linkedinResult.status === 'fulfilled' ? linkedinResult.value : { error: linkedinResult.reason },
        }
      };

      // Calculate totals
      Object.values(combinedMetrics.platforms).forEach(platform => {
        if (!platform.error) {
          combinedMetrics.totalFollowers += platform.followers || 0;
          combinedMetrics.totalLikes += platform.likes || 0;
          combinedMetrics.totalComments += platform.comments || 0;
          combinedMetrics.totalShares += platform.shares || 0;
          
          if (platform.hashtags) {
            combinedMetrics.topHashtags.push(...platform.hashtags);
          }
        }
      });

      // Process top hashtags
      const hashtagCounts = {};
      combinedMetrics.topHashtags.forEach(tag => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      });
      
      combinedMetrics.topHashtags = Object.entries(hashtagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag);

      setMetrics(combinedMetrics);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refreshMetrics: fetchMetrics
  };
}
