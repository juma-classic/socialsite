import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

function MetricsChart({ data, title }) {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">Track your growth across platforms</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center px-3 py-1 bg-green-50 rounded-full">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-sm font-medium text-green-600">+12.5%</span>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700">Export</button>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Line 
            type="monotone" 
            dataKey="facebook" 
            stroke="#1877f2" 
            strokeWidth={3}
            name="Facebook"
            dot={{ fill: '#1877f2', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#1877f2', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="instagram" 
            stroke="#e4405f" 
            strokeWidth={3}
            name="Instagram"
            dot={{ fill: '#e4405f', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#e4405f', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="twitter" 
            stroke="#000000" 
            strokeWidth={3}
            name="X (Twitter)"
            dot={{ fill: '#000000', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#000000', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="linkedin" 
            stroke="#0077b5" 
            strokeWidth={3}
            name="LinkedIn"
            dot={{ fill: '#0077b5', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#0077b5', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MetricsChart;
