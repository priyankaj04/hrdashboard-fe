// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Token management
const getAuthToken = () => {
  return localStorage.getItem('hr_auth_token');
};

const setAuthToken = (token) => {
  localStorage.setItem('hr_auth_token', token);
};

const removeAuthToken = () => {
  localStorage.removeItem('hr_auth_token');
};

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    // Handle authentication errors
    if (response.status === 401) {
      removeAuthToken();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error('API Request failed:', error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw error;
  }
};

// API Service Object
const apiService = {
  // Health Check
  health: {
    check: () => apiRequest('/health'),
  },

  // Authentication APIs
  auth: {
    login: (credentials) => 
      apiRequest('/api/auth/login', {
        method: 'POST',
        body: credentials,
      }),
    
    register: (userData) => 
      apiRequest('/api/auth/register', {
        method: 'POST',
        body: userData,
      }),
    
    profile: () => 
      apiRequest('/api/auth/profile'),
    
    changePassword: (passwordData) => 
      apiRequest('/api/auth/change-password', {
        method: 'PUT',
        body: passwordData,
      }),
    
    logout: () => 
      apiRequest('/api/auth/logout', {
        method: 'POST',
      }),
  },

  // Employee APIs
  employees: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/api/employees${query ? `?${query}` : ''}`);
    },
    
    getOne: (id) => 
      apiRequest(`/api/employees/${id}`),
    
    create: (employeeData) => 
      apiRequest('/api/employees', {
        method: 'POST',
        body: employeeData,
      }),
    
    update: (id, employeeData) => 
      apiRequest(`/api/employees/${id}`, {
        method: 'PUT',
        body: employeeData,
      }),
    
    delete: (id) => 
      apiRequest(`/api/employees/${id}`, {
        method: 'DELETE',
      }),
    
    byDepartment: (departmentId) => 
      apiRequest(`/api/employees/department/${departmentId}`),
    
    byManager: (managerId) => 
      apiRequest(`/api/employees/manager/${managerId}`),
  },

  // Department APIs
  departments: {
    getAll: () => 
      apiRequest('/api/departments'),
    
    getOne: (id) => 
      apiRequest(`/api/departments/${id}`),
    
    create: (departmentData) => 
      apiRequest('/api/departments', {
        method: 'POST',
        body: departmentData,
      }),
    
    update: (id, departmentData) => 
      apiRequest(`/api/departments/${id}`, {
        method: 'PUT',
        body: departmentData,
      }),
    
    delete: (id) => 
      apiRequest(`/api/departments/${id}`, {
        method: 'DELETE',
      }),
    
    budgetStats: (id) => 
      apiRequest(`/api/departments/${id}/budget-stats`),
  },

  // Positions APIs
  positions: {
    getAll: () => 
      apiRequest('/api/positions'),
    
    getByDepartment: (departmentId) => 
      apiRequest(`/api/positions/department/${departmentId}`),
    
    search: (query) => {
      const params = new URLSearchParams({ q: query }).toString();
      return apiRequest(`/api/positions/search?${params}`);
    },
    
    getBySalaryRange: (minSalary, maxSalary) => {
      const params = new URLSearchParams({
        min_salary: minSalary,
        max_salary: maxSalary
      }).toString();
      return apiRequest(`/api/positions/salary-range?${params}`);
    },
    
    getOne: (id) => 
      apiRequest(`/api/positions/${id}`),
    
    create: (positionData) => 
      apiRequest('/api/positions', {
        method: 'POST',
        body: positionData,
      }),
    
    update: (id, positionData) => 
      apiRequest(`/api/positions/${id}`, {
        method: 'PUT',
        body: positionData,
      }),
    
    delete: (id) => 
      apiRequest(`/api/positions/${id}`, {
        method: 'DELETE',
      }),
  },

  // Attendance APIs
  attendance: {
    // Dashboard APIs - accessible by all authenticated users
    monthly: (params = {}) => {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''))
      ).toString();
      return apiRequest(`/api/attendance/monthly${query ? `?${query}` : ''}`);
    },
    
    daily: (params = {}) => {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''))
      ).toString();
      return apiRequest(`/api/attendance/daily${query ? `?${query}` : ''}`);
    },
    
    analytics: (params = {}) => {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''))
      ).toString();
      return apiRequest(`/api/attendance/analytics${query ? `?${query}` : ''}`);
    },
    
    employees: (params = {}) => {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''))
      ).toString();
      return apiRequest(`/api/attendance/employees${query ? `?${query}` : ''}`);
    },
    
    departments: (params = {}) => {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''))
      ).toString();
      return apiRequest(`/api/attendance/departments${query ? `?${query}` : ''}`);
    },
    
    export: (params = {}) => {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''))
      ).toString();
      return apiRequest(`/api/attendance/export${query ? `?${query}` : ''}`);
    },

    // Check-in/out routes - employees can check themselves in/out
    checkIn: (checkInData) => 
      apiRequest('/api/attendance/check-in', {
        method: 'POST',
        body: checkInData,
      }),
    
    checkOut: (checkOutData) => 
      apiRequest('/api/attendance/check-out', {
        method: 'POST',
        body: checkOutData,
      }),

    // Legacy routes - accessible by all authenticated users
    getAll: (params = {}) => {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''))
      ).toString();
      return apiRequest(`/api/attendance${query ? `?${query}` : ''}`);
    },
    
    getOne: (id) => 
      apiRequest(`/api/attendance/${id}`),
    
    summary: (employeeId, params = {}) => {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''))
      ).toString();
      return apiRequest(`/api/attendance/summary/${employeeId}${query ? `?${query}` : ''}`);
    },
    
    departmentSummary: (departmentId, params = {}) => {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''))
      ).toString();
      return apiRequest(`/api/attendance/department-summary/${departmentId}${query ? `?${query}` : ''}`);
    },

    // Routes for Admin/HR/Manager
    create: (attendanceData) => 
      apiRequest('/api/attendance', {
        method: 'POST',
        body: attendanceData,
      }),
    
    update: (id, attendanceData) => 
      apiRequest(`/api/attendance/${id}`, {
        method: 'PUT',
        body: attendanceData,
      }),

    // Admin/HR only routes
    delete: (id) => 
      apiRequest(`/api/attendance/${id}`, {
        method: 'DELETE',
      }),
  },
};

// Export utilities and service
export {
  apiService,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  API_BASE_URL,
};

export default apiService;