import React from 'react';
import ConnectAccounts from '../components/ConnectAccounts';
import { ArrowRight, Shield, Zap, BarChart3 } from 'lucide-react';

function WelcomePage({ onGetStarted }) {
  const features = [
    {
      icon: Shield,
      title: 'Secure OAuth',
      description: 'Connect accounts safely using OAuth 2.0 - no passwords required'
    },
    {
      icon: Zap,
      title: 'Real-time Data',
      description: 'Get instant updates on your social media metrics'
    },
    {
      icon: BarChart3,
      title: 'Beautiful Analytics',
      description: 'Visualize your data with interactive charts and insights'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-primary-600">Social Sight</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The easiest way to track and analyze your social media performance across all platforms. 
            No complex API setup - just click to connect your accounts securely.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <p className="text-sm text-gray-500">Free to use • No credit card required</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                <feature.icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Demo Screenshots */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Everything you need in one dashboard
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">📊 Real-time Analytics</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  Track followers, likes, comments, and shares
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  Monitor hashtag performance
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  Compare metrics across platforms
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  View engagement trends over time
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">🔒 Secure & Simple</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  One-click account connection
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  No API tokens or technical setup
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Industry-standard OAuth security
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Your passwords never leave your device
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-primary-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to get insights into your social media?</h2>
            <p className="text-primary-100 mb-6">Connect your first account and see your metrics in seconds</p>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center px-8 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Connect Your Accounts
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
