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

  // Leave Management APIs
  leaves: {
    // Get leave requests with filtering and pagination
    // GET /api/leaves
    getAll: (filters = {}) => {
      const params = new URLSearchParams();
      
      // Add filters to query params
      if (filters.employee_id) params.append('employee_id', filters.employee_id);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const queryString = params.toString();
      return apiRequest(`/api/leaves${queryString ? `?${queryString}` : ''}`);
    },

    // Create new leave request
    // POST /api/leaves
    create: (leaveData) => 
      apiRequest('/api/leaves', {
        method: 'POST',
        body: {
          employee_id: leaveData.employee_id,
          type: leaveData.type,
          start_date: leaveData.start_date,
          end_date: leaveData.end_date,
          reason: leaveData.reason,
          emergency_contact: leaveData.emergency_contact,
          handover_notes: leaveData.handover_notes
        },
      }),

    // Update leave request (only pending requests)
    // PUT /api/leaves/:id
    update: (id, updateData) => 
      apiRequest(`/api/leaves/${id}`, {
        method: 'PUT',
        body: {
          type: updateData.type,
          start_date: updateData.start_date,
          end_date: updateData.end_date,
          reason: updateData.reason,
          emergency_contact: updateData.emergency_contact,
          handover_notes: updateData.handover_notes
        },
      }),

    // Cancel/Delete leave request (only pending requests)
    // DELETE /api/leaves/:id
    cancel: (id) => 
      apiRequest(`/api/leaves/${id}`, {
        method: 'DELETE',
      }),

    // Approve or reject leave request (Admin/HR/Manager only)
    // PUT /api/leaves/:id/status
    updateStatus: (id, status, comments = '') => 
      apiRequest(`/api/leaves/${id}/status`, {
        method: 'PUT',
        body: {
          status, // 'approved' or 'rejected'
          comments
        },
      }),

    // Get leave statistics
    // GET /api/leaves/statistics
    getStatistics: (filters = {}) => {
      const params = new URLSearchParams();
      
      if (filters.employee_id) params.append('employee_id', filters.employee_id);
      if (filters.department_id) params.append('department_id', filters.department_id);
      if (filters.year) params.append('year', filters.year);
      if (filters.month) params.append('month', filters.month);

      const queryString = params.toString();
      return apiRequest(`/api/leaves/statistics${queryString ? `?${queryString}` : ''}`);
    },

    // Get employee leave balance
    // GET /api/leaves/balance/:employee_id
    getBalance: (employeeId, year = null) => {
      const params = new URLSearchParams();
      if (year) params.append('year', year);
      
      const queryString = params.toString();
      return apiRequest(`/api/leaves/balance/${employeeId}${queryString ? `?${queryString}` : ''}`);
    },

    // Get leave calendar view
    // GET /api/leaves/calendar
    getCalendar: (startDate, endDate, filters = {}) => {
      const params = new URLSearchParams();
      params.append('start_date', startDate);
      params.append('end_date', endDate);
      
      if (filters.department_id) params.append('department_id', filters.department_id);
      if (filters.employee_id) params.append('employee_id', filters.employee_id);

      return apiRequest(`/api/leaves/calendar?${params.toString()}`);
    },

    // Get all available leave types
    // GET /api/leaves/types
    getTypes: () => apiRequest('/api/leaves/types'),

    // Bulk approve/reject leave requests (Admin/HR/Manager only)
    // POST /api/leaves/bulk-action
    bulkAction: (action, leaveIds, comments = '') => 
      apiRequest('/api/leaves/bulk-action', {
        method: 'POST',
        body: {
          action, // 'approve' or 'reject'
          leave_ids: leaveIds,
          comments
        },
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