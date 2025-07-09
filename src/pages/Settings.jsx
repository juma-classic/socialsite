import React, { useState } from 'react';
import { Save, Key, Bell, Database, Globe } from 'lucide-react';
import ConnectAccounts from '../components/ConnectAccounts';

function Settings() {
  const [activeTab, setActiveTab] = useState('api');
  const [settings, setSettings] = useState({
    facebook: { token: '', enabled: true },
    instagram: { token: '', enabled: true },
    twitter: { token: '', enabled: true },
    linkedin: { token: '', enabled: true },
    notifications: {
      email: true,
      push: false,
      frequency: 'daily'
    },
    general: {
      timezone: 'UTC',
      currency: 'USD',
      theme: 'light'
    }
  });

  const tabs = [
    { id: 'api', name: 'API Keys', icon: Key },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'data', name: 'Data & Storage', icon: Database },
    { id: 'general', name: 'General', icon: Globe },
  ];

  const handleSave = () => {
    // Here you would typically save to your backend or localStorage
    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">Configure your Social Sight dashboard</p>
      </div>

      <div className="flex space-x-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow">
            {activeTab === 'api' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect Your Social Media Accounts</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Connect your social media accounts using secure OAuth authentication. You'll login directly on each platform's official website.
                </p>
                
                <ConnectAccounts onAccountConnected={(platform, data) => {
                  console.log(`Connected ${platform}:`, data);
                }} />
                
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Advanced: Manual API Configuration</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    If you're a developer and prefer to use your own API keys, you can configure them manually below.
                  </p>
                  <details className="mt-2">
                    <summary className="text-sm font-medium text-yellow-800 cursor-pointer hover:text-yellow-900">
                      Show Manual Configuration
                    </summary>
                    <div className="mt-4 space-y-6">
                      {['facebook', 'instagram', 'twitter', 'linkedin'].map((platform) => (
                        <div key={platform} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <h4 className="text-sm font-medium text-gray-900 capitalize">{platform}</h4>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                settings[platform]?.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {settings[platform]?.enabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings[platform]?.enabled || false}
                                onChange={(e) => updateSetting(platform, 'enabled', e.target.checked)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Access Token
                            </label>
                            <input
                              type="password"
                              placeholder={`Enter your ${platform} access token`}
                              value={settings[platform]?.token || ''}
                              onChange={(e) => updateSetting(platform, 'token', e.target.value)}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Types</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.email}
                          onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.push}
                          onChange={(e) => updateSetting('notifications', 'push', e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Push notifications</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Frequency
                    </label>
                    <select
                      value={settings.notifications.frequency}
                      onChange={(e) => updateSetting('notifications', 'frequency', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="real-time">Real-time</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data & Storage</h3>
                
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Data Retention</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Configure how long to keep historical data
                    </p>
                    <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                      <option>30 days</option>
                      <option>90 days</option>
                      <option>1 year</option>
                      <option>Forever</option>
                    </select>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Export Data</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Download your data for backup or analysis
                    </p>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      Export All Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.general.currency}
                      onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <select
                      value={settings.general.theme}
                      onChange={(e) => updateSetting('general', 'theme', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
