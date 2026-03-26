import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { Breadcrumbs } from '../navigation/Breadcrumbs';
import { ThemeToggle } from './ThemeToggle';

interface MainContentProps {
  children: React.ReactNode;
}

export const MainContent: React.FC<MainContentProps> = ({ children }) => {
  const { 
    isSidebarCollapsed, 
    toggleSidebar, 
    searchQuery, 
    setSearchQuery,
    isLoading 
  } = useDashboard();

  return (
    <div 
      className={`flex flex-col flex-1 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}
    >
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center flex-1">
          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleSidebar}
            className="p-2 mr-4 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search Bar */}
          <div className="max-w-md w-full relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dashboard..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
            />
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-2 right-2.5 block w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-gray-900"></span>
          </button>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="py-2">
          <Breadcrumbs />
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
