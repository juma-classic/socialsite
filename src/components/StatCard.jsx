import React from 'react';
import { TrendingUp, Users, Heart, MessageCircle, Share2 } from 'lucide-react';

function StatCard({ title, value, change, icon: Icon, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary-500 text-white',
    green: 'bg-green-500 text-white',
    pink: 'bg-pink-500 text-white',
    blue: 'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center">
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-sm text-green-600 font-medium">{change}</span>
          <span className="text-sm text-gray-500 ml-2">vs last week</span>
        </div>
      )}
    </div>
  );
}

export default StatCard;
