import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase,
  Clock, 
  Calendar, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ 
  isCollapsed, 
  setIsCollapsed 
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    /* { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }, */
    { id: 'employees', label: 'Employees', icon: Users, path: '/employees' },
    { id: 'positions', label: 'Positions', icon: Briefcase, path: '/positions' },
    { id: 'attendance', label: 'Attendance', icon: Clock, path: '/attendance' },
    { id: 'leaves', label: 'Leave Management', icon: Calendar, path: '/leaves' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (user?.role === 'employee') {
      return ['dashboard', 'attendance', 'leaves'].includes(item.id);
    }
    // HR and admin can access positions
    return true;
  });

  return (
    <div className={`bg-gray-900 border-r border-gray-800 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } h-screen fixed left-0 top-0 z-30 shadow-dark-lg`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-newrelic">
                <span className="text-white font-bold text-sm">HR</span>
              </div>
              <span className="font-bold text-gray-100 gradient-text">Dashboard</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors group"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-900 text-primary-300 border border-primary-800 shadow-newrelic'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary-400' : 'text-gray-500'}`} />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User info (at bottom) */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-newrelic">
                <span className="text-white text-sm font-medium capitalize">
                  {user?.email?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-100 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;