import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { useSocialMetrics } from './apiHooks/useSocialMetrics';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { metrics, loading, error, refreshMetrics } = useSocialMetrics();

  useEffect(() => {
    // Refresh metrics every 5 minutes
    const interval = setInterval(refreshMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm lg:static lg:overflow-y-visible">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative flex justify-between xl:grid xl:grid-cols-12 lg:gap-8">
                <div className="flex md:absolute md:left-0 md:inset-y-0 lg:static xl:col-span-2">
                  <div className="flex-shrink-0 flex items-center">
                    <button
                      type="button"
                      className="lg:hidden bg-white p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                      onClick={() => setSidebarOpen(true)}
                    >
                      <span className="sr-only">Open sidebar</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <h1 className="ml-4 text-xl font-bold text-gray-900">Social Sight</h1>
                  </div>
                </div>
                
                <div className="min-w-0 flex-1 md:px-8 lg:px-0 xl:col-span-8">
                  <div className="flex items-center px-6 py-4 md:max-w-3xl md:mx-auto lg:max-w-none lg:mx-0 xl:px-0">
                    <div className="w-full">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          placeholder="Search metrics..."
                          type="search"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center md:absolute md:right-0 md:inset-y-0 lg:static xl:col-span-2">
                  <div className="flex-shrink-0 relative ml-5">
                    <button
                      type="button"
                      className="bg-white rounded-full p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={refreshMetrics}
                    >
                      <span className="sr-only">Refresh</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard metrics={metrics} loading={loading} error={error} />} />
              <Route path="/analytics" element={<Analytics metrics={metrics} loading={loading} error={error} />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
