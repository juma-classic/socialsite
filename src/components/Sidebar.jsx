import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  Settings, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin,
  X
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const socialPlatforms = [
  { name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
  { name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
  { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
];

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 bg-primary-600">
          <h1 className="text-xl font-bold text-white">Social Sight</h1>
          <button
            type="button"
            className="text-primary-200 hover:text-white lg:hidden"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 px-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Connected Platforms
            </h3>
            <div className="mt-4 space-y-1">
              {socialPlatforms.map((platform) => (
                <div
                  key={platform.name}
                  className="flex items-center px-2 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50"
                >
                  <platform.icon className={`mr-3 h-5 w-5 ${platform.color}`} />
                  {platform.name}
                  <div className="ml-auto">
                    <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}

export default Sidebar;
