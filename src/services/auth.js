import { createContext, useContext, useState, useEffect } from 'react';
import apiService, { setAuthToken, removeAuthToken, getAuthToken } from './api';

// Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const userData = await apiService.auth.profile();
          setUser(userData?.data?.user);
        } catch (error) {
          console.error('Failed to get user profile:', error);
          removeAuthToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.auth.login(credentials);

      console.log("response", response)
      if (response.data?.token) {
        setAuthToken(response.data?.token);
        setUser(response.data?.user);
        return { success: true };
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.auth.register(userData);
      
      if (response.token) {
        setAuthToken(response.token);
        setUser(response.user);
        return { success: true };
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiService.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeAuthToken();
      setUser(null);
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiService.auth.changePassword(passwordData);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async () => {
    try {
      const userData = await apiService.auth.profile();
      setUser(userData);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    changePassword,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isHR: user?.role === 'hr' || user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'hr' || user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newrelic-green"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      window.location.href = '/login';
      return null;
    }

    return <Component {...props} />;
  };
};

// Role-based access component
export const RequireRole = ({ roles, children, fallback = null }) => {
  const { user } = useAuth();
  
  if (!user || !roles.includes(user.role)) {
    return fallback || (
      <div className="nr-card p-6 text-center">
        <p className="text-red-400">You don't have permission to access this feature.</p>
      </div>
    );
  }
  
  return children;
};

export default AuthContext;