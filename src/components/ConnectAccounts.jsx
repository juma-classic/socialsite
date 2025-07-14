import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Twitter, Linkedin, CheckCircle, AlertCircle } from 'lucide-react';
import socialMediaService from '../services/socialMediaService';

const platforms = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600 hover:bg-blue-700',
    description: 'Connect your Facebook Page to track posts, likes, and comments'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-pink-600 hover:bg-pink-700',
    description: 'Connect your Instagram Business account for photos and stories analytics'
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: Twitter,
    color: 'bg-black hover:bg-gray-800',
    description: 'Connect your X (Twitter) account to track posts and engagement'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-700 hover:bg-blue-800',
    description: 'Connect your LinkedIn Company Page for professional insights'
  }
];

function ConnectAccounts({ onAccountConnected }) {
  const [connectedAccounts, setConnectedAccounts] = useState({});
  const [connectingAccount, setConnectingAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load connected accounts on mount
  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      const accounts = await socialMediaService.getConnectedAccounts();
      const accountsMap = {};
      
      accounts.forEach(account => {
        accountsMap[account.platform] = {
          connected: true,
          username: account.username,
          connectedAt: account.connected_at,
          platformUserId: account.platform_user_id
        };
      });
      
      setConnectedAccounts(accountsMap);
    } catch (error) {
      console.error('Error loading connected accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform) => {
    setConnectingAccount(platform.id);
    
    try {
      // Start OAuth flow
      const response = await fetch(`/.netlify/functions/oauth/connect?platform=${platform.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('OAuth setup error:', errorData);
        alert(`Failed to setup OAuth for ${platform.name}: ${errorData.error || 'Unknown error'}`);
        return;
      }
      
      const data = await response.json();
      
      if (data.authUrl) {
        // Open OAuth popup
        const popup = window.open(
          data.authUrl,
          'oauth',
          'width=600,height=600,scrollbars=yes,resizable=yes'
        );
        
        // Listen for OAuth completion
        const handleMessage = async (event) => {
          // Allow messages from any origin for OAuth popups
          console.log('Received message:', event.data);
          
          if (event.data.type === 'OAUTH_SUCCESS' && event.data.platform === platform.id) {
            // Reload connected accounts from database
            await loadConnectedAccounts();
            
            if (popup && !popup.closed) {
              popup.close();
            }
            window.removeEventListener('message', handleMessage);
            onAccountConnected?.(platform.id, event.data);
            setConnectingAccount(null);
          } else if (event.data.type === 'OAUTH_ERROR') {
            console.error('OAuth error:', event.data.error);
            if (popup && !popup.closed) {
              popup.close();
            }
            window.removeEventListener('message', handleMessage);
            setConnectingAccount(null);
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        // Check if popup was closed manually
        const checkClosed = setInterval(() => {
          if (popup && popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            setConnectingAccount(null);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert(`Failed to connect ${platform.name}: ${error.message}`);
    } finally {
      setConnectingAccount(null);
    }
  };

  const handleDisconnect = async (platformId) => {
    try {
      await socialMediaService.disconnectAccount(platformId);
      setConnectedAccounts(prev => {
        const updated = { ...prev };
        delete updated[platformId];
        return updated;
      });
    } catch (error) {
      console.error('Error disconnecting account:', error);
      alert(`Failed to disconnect ${platformId}: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Social Media Accounts</h2>
        <p className="text-lg text-gray-600">
          Securely connect your accounts with one click - no API tokens needed!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const isConnected = connectedAccounts[platform.id]?.connected;
          const isConnecting = connectingAccount === platform.id;
          const Icon = platform.icon;

          return (
            <div key={platform.id} className="bg-white rounded-lg shadow-md p-6 border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${platform.color.split(' ')[0]} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
                    {isConnected && (
                      <p className="text-sm text-gray-500">
                        Connected as @{connectedAccounts[platform.id].username}
                      </p>
                    )}
                  </div>
                </div>
                
                {isConnected ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-gray-400" />
                )}
              </div>

              <p className="text-gray-600 text-sm mb-4">{platform.description}</p>

              {isConnected ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Status:</span>
                    <span className="text-green-600 font-medium">Connected</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Connected:</span>
                    <span>{new Date(connectedAccounts[platform.id].connectedAt).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => handleDisconnect(platform.id)}
                    className="w-full mt-3 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                  >
                    Disconnect Account
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(platform)}
                  disabled={isConnecting}
                  className={`w-full px-4 py-2 text-white font-medium rounded-md transition-colors ${
                    isConnecting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : platform.color
                  }`}
                >
                  {isConnecting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    `Connect ${platform.name}`
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800">Secure Authentication</h4>
            <p className="text-sm text-blue-700 mt-1">
              We use OAuth 2.0 - the same security standard used by "Login with Google" and similar services. 
              Your passwords are never stored or transmitted through our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConnectAccounts;
