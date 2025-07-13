import React from 'react';
import { TrendingUp, TrendingDown, Users, Heart, MessageCircle, Share2 } from 'lucide-react';

function StatCard({ title, value, change, icon: Icon, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600',
    green: 'bg-gradient-to-r from-green-500 to-green-600',
    pink: 'bg-gradient-to-r from-pink-500 to-pink-600',
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600'
  };

  const backgroundClasses = {
    primary: 'bg-blue-50',
    green: 'bg-green-50',
    pink: 'bg-pink-50',
    blue: 'bg-blue-50',
    purple: 'bg-purple-50'
  };

  const isPositive = change && change.startsWith('+');
  const isNegative = change && change.startsWith('-');

  return (
    <div className={`${backgroundClasses[color]} rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isPositive ? 'bg-green-100 text-green-700' : 
            isNegative ? 'bg-red-100 text-red-700' : 
            'bg-gray-100 text-gray-700'
          }`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : isNegative ? (
              <TrendingDown className="h-4 w-4 mr-1" />
            ) : null}
            {change}
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      
      {change && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {isPositive ? 'Increased' : isNegative ? 'Decreased' : 'Changed'} by {change} from last week
          </p>
        </div>
      )}
    </div>
  );
}

export default StatCard;
