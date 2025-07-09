import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function MetricsChart({ data, title }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="facebook" 
            stroke="#1877f2" 
            strokeWidth={2}
            name="Facebook"
          />
          <Line 
            type="monotone" 
            dataKey="instagram" 
            stroke="#e4405f" 
            strokeWidth={2}
            name="Instagram"
          />
          <Line 
            type="monotone" 
            dataKey="twitter" 
            stroke="#1da1f2" 
            strokeWidth={2}
            name="Twitter"
          />
          <Line 
            type="monotone" 
            dataKey="linkedin" 
            stroke="#0077b5" 
            strokeWidth={2}
            name="LinkedIn"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MetricsChart;
