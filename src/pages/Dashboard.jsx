import React from 'react';
import StatCard from '../components/StatCard';
import MetricsChart from '../components/MetricsChart';
import { Users, Heart, MessageCircle, Share2, Hash } from 'lucide-react';

// Mock data for demonstration
const mockChartData = [
  { date: '2024-01-01', facebook: 1200, instagram: 800, twitter: 600, linkedin: 400 },
  { date: '2024-01-02', facebook: 1350, instagram: 950, twitter: 750, linkedin: 500 },
  { date: '2024-01-03', facebook: 1100, instagram: 1100, twitter: 700, linkedin: 450 },
  { date: '2024-01-04', facebook: 1400, instagram: 1200, twitter: 800, linkedin: 550 },
  { date: '2024-01-05', facebook: 1600, instagram: 1400, twitter: 900, linkedin: 650 },
  { date: '2024-01-06', facebook: 1800, instagram: 1600, twitter: 1100, linkedin: 750 },
  { date: '2024-01-07', facebook: 2000, instagram: 1800, twitter: 1200, linkedin: 800 },
];

function Dashboard({ metrics, loading, error }) {
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading metrics</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use mock data if no metrics are available
  const displayMetrics = metrics || {
    totalFollowers: 15420,
    totalLikes: 8650,
    totalComments: 1250,
    totalShares: 890,
    topHashtags: ['#socialmedia', '#marketing', '#growth', '#engagement', '#analytics']
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-1">Track your social media performance across all platforms</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Followers"
          value={displayMetrics.totalFollowers?.toLocaleString() || '15,420'}
          change="+12.5%"
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Total Likes"
          value={displayMetrics.totalLikes?.toLocaleString() || '8,650'}
          change="+8.2%"
          icon={Heart}
          color="pink"
        />
        <StatCard
          title="Total Comments"
          value={displayMetrics.totalComments?.toLocaleString() || '1,250'}
          change="+15.3%"
          icon={MessageCircle}
          color="blue"
        />
        <StatCard
          title="Total Shares"
          value={displayMetrics.totalShares?.toLocaleString() || '890'}
          change="+5.7%"
          icon={Share2}
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <MetricsChart
          data={mockChartData}
          title="Followers Growth Over Time"
        />
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Hashtags</h3>
          <div className="space-y-3">
            {(displayMetrics.topHashtags || ['#socialmedia', '#marketing', '#growth', '#engagement', '#analytics']).map((hashtag, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Hash className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{hashtag}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full" 
                      style={{ width: `${100 - (index * 15)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">{100 - (index * 15)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { platform: 'Instagram', action: 'New post received 250 likes', time: '2 hours ago', color: 'bg-pink-100 text-pink-800' },
              { platform: 'Facebook', action: 'Page gained 45 new followers', time: '4 hours ago', color: 'bg-blue-100 text-blue-800' },
              { platform: 'Twitter', action: 'Tweet got 120 retweets', time: '6 hours ago', color: 'bg-blue-100 text-blue-800' },
              { platform: 'LinkedIn', action: 'Article received 30 comments', time: '8 hours ago', color: 'bg-blue-100 text-blue-800' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.color}`}>
                    {activity.platform}
                  </span>
                  <span className="ml-3 text-sm text-gray-900">{activity.action}</span>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
