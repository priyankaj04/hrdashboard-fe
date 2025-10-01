import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../services/auth';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isAuthenticated } = useAuth();
  // const location = useLocation(); // Future use for breadcrumbs

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Sidebar 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <Header 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      {/* Main Content */}
      <main className={`transition-all duration-300 ${
        isCollapsed ? 'ml-16' : 'ml-64'
      } pt-20 p-6`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;