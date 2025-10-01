import { useState, useContext, createContext } from 'react';

const AuthContext = createContext(undefined);

// Mock users for demonstration
const mockUsers = {
  'admin@company.com': {
    id: '1',
    name: 'John Admin',
    email: 'admin@company.com',
    role: 'admin',
    password: 'admin123'
  },
  'hr@company.com': {
    id: '2',
    name: 'Sarah HR',
    email: 'hr@company.com',
    role: 'hr',
    password: 'hr123'
  },
  'employee@company.com': {
    id: '3',
    name: 'Mike Employee',
    email: 'employee@company.com',
    role: 'employee',
    password: 'emp123'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (email, password) => {
    const mockUser = mockUsers[email];
    if (mockUser && mockUser.password === password) {
      const userData = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};