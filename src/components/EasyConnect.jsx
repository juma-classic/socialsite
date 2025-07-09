import React, { useState, useEffect } from 'react';
import { ExternalLink, Check, AlertCircle, Loader } from 'lucide-react';

const OAUTH_CONFIGS = {
  facebook: {
    name: 'Facebook',
    color: 'bg-blue-600 hover:bg-blue-700',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scope: 'pages_read_engagement,pages_read_user_content,pages_show_list',
    description: 'Connect your Facebook Pages to track likes, comments, and shares'
  },
  instagram: {
    name: 'Instagram',
    color: 'bg-pink-600 hover:bg-pink-700', 
    authUrl: 'https://api.instagram.com/oauth/authorize',
    scope: 'user_profile,user_media',
    description: 'Connect your Instagram account to track posts and engagement'
  },
  twitter: {
    name: 'Twitter',
    color: 'bg-blue-400 hover:bg-blue-500',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    scope: 'tweet.read,users.read,follows.read',
    description: 'Connect your Twitter account to track tweets and followers'
  },
  linkedin: {
    name: 'LinkedIn',
    color: 'bg-blue-700 hover:bg-blue-800',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    scope: 'r_liteprofile,r_emailaddress,w_member_social',
    description: 'Connect your LinkedIn account or company page'
  }
};

function OAuthConnection({ platform, config, onConnect, isConnected, isLoading }) {
  const handleConnect = () => {
    const clientId = process.env.REACT_APP_FACEBOOK_CLIENT_ID || 'your-client-id';
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    const state = encodeURIComponent(JSON.stringify({ platform, timestamp: Date.now() }));
    
    const authUrl = `${config.authUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${config.scope}&response_type=code&state=${state}`;
    
    // Open OAuth popup
    const popup = window.open(
      authUrl,
      'oauth',
      'width=600,height=600,scrollbars=yes,resizable=yes'
    );
    
    // Listen for popup completion
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        onConnect(platform);
      }
    }, 1000);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center text-white font-bold`}>
            {config.name[0]}
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">{config.name}</h3>
            <p className="text-sm text-gray-500">{config.description}</p>
          </div>
        </div>
        
        {isConnected ? (
          <div className="flex items-center text-green-600">
            <Check className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">Connected</span>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${config.color} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
          >
            {isLoading ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>
        )}
      </div>
    </div>
  );
}

function EasyConnect() {
  const [connections, setConnections] = useState({
    facebook: false,
    instagram: false,
    twitter: false,
    linkedin: false
  });
  
  const [loading, setLoading] = useState({});

  useEffect(() => {
    // Check for existing connections
    const savedConnections = localStorage.getItem('socialConnections');
    if (savedConnections) {
      setConnections(JSON.parse(savedConnections));
    }
    
    // Handle OAuth callback
    const handleOAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && state) {
        try {
          const { platform } = JSON.parse(decodeURIComponent(state));
          handleConnectionComplete(platform, code);
        } catch (error) {
          console.error('OAuth callback error:', error);
        }
      }
    };
    
    handleOAuthCallback();
  }, []);

  const handleConnect = async (platform) => {
    setLoading(prev => ({ ...prev, [platform]: true }));
    
    // In a real implementation, you would:
    // 1. Open OAuth popup
    // 2. Handle the callback
    // 3. Exchange code for access token
    // 4. Store the token securely
    
    // For demo purposes, simulate connection
    setTimeout(() => {
      const newConnections = { ...connections, [platform]: true };
      setConnections(newConnections);
      localStorage.setItem('socialConnections', JSON.stringify(newConnections));
      setLoading(prev => ({ ...prev, [platform]: false }));
    }, 2000);
  };

  const handleConnectionComplete = async (platform, code) => {
    try {
      // Exchange authorization code for access token
      const response = await fetch(`/api/auth/${platform}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      if (response.ok) {
        const newConnections = { ...connections, [platform]: true };
        setConnections(newConnections);
        localStorage.setItem('socialConnections', JSON.stringify(newConnections));
      }
    } catch (error) {
      console.error('Token exchange error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Social Media Accounts</h2>
        <p className="text-gray-600">
          Click the Connect button for each platform to securely link your accounts. 
          You'll be redirected to the official platform login page.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Secure OAuth Authentication</h3>
            <p className="text-sm text-blue-700 mt-1">
              We use official OAuth authentication - you'll login directly on each platform's secure website. 
              We never see or store your passwords.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(OAUTH_CONFIGS).map(([platform, config]) => (
          <OAuthConnection
            key={platform}
            platform={platform}
            config={config}
            onConnect={handleConnect}
            isConnected={connections[platform]}
            isLoading={loading[platform]}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">What happens when you connect?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="font-medium text-green-600 mr-2">✓</span>
            You'll be redirected to the official platform login page
          </li>
          <li className="flex items-start">
            <span className="font-medium text-green-600 mr-2">✓</span>
            Login with your existing username and password on their secure site
          </li>
          <li className="flex items-start">
            <span className="font-medium text-green-600 mr-2">✓</span>
            Grant permission for Social Sight to read your public metrics
          </li>
          <li className="flex items-start">
            <span className="font-medium text-green-600 mr-2">✓</span>
            You'll be redirected back to Social Sight with secure access
          </li>
        </ul>
      </div>
    </div>
  );
}

export default EasyConnect;
