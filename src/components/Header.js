import React from 'react';
import { useAuth } from '../services/auth';
import { Bell, Search, LogOut, Menu } from 'lucide-react';

const Header = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();

  return (
    <header className={`bg-gray-900 border-b border-gray-800 transition-all duration-300 ${
      isCollapsed ? 'ml-16' : 'ml-64'
    } fixed top-0 right-0 left-0 z-20 shadow-dark`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Mobile menu button and search */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-400" />
            </button>
            
            <div className="hidden md:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search employees, departments..."
                className="nr-input block w-80 pl-10 pr-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Right side - Notifications and user menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors group">
              <Bell className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary-500 rounded-full shadow-newrelic animate-pulse"></span>
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-100">{user?.email}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
              
              <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-newrelic">
                <span className="text-white text-sm font-medium capitalize">
                  {user?.email?.charAt(0)}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors group"
                title="Sign out"
              >
                <LogOut className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;