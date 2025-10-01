import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader,
  AlertCircle
} from 'lucide-react';
import apiService from '../services/api';
import { mockEmployees, Employee } from '../data/mockData';

// Employee Form Component
const EmployeeForm = ({
  onClose,
  onSubmit,
  departments,
  positions,
  loading,
  title,
  initialData = null,
  isEdit = false
}) => {
  const [formData, setFormData] = useState({
    // User data
    email: initialData?.personal_email || '',
    password: '',
    role: initialData?.role || 'employee',

    // Employee data
    employee_id: initialData?.employee_id || '',
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    date_of_birth: initialData?.date_of_birth || '',
    gender: initialData?.gender || '',
    phone: initialData?.phone || '',
    personal_email: initialData?.personal_email || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    postal_code: initialData?.postal_code || '',
    country: initialData?.country || 'United States',
    department_id: initialData?.department_id || '',
    position_id: initialData?.position_id || '',
    manager_id: initialData?.manager_id || '',
    hire_date: initialData?.hire_date || '',
    employment_status: initialData?.employment_status || 'active',
    employment_type: initialData?.employment_type || 'full-time',
    salary: initialData?.salary || '',
    salary_type: initialData?.salary_type || 'annual',
    currency: initialData?.currency || 'USD'
  });

  const [errors, setErrors] = useState({});
  const [departmentPositions, setDepartmentPositions] = useState([]);
  const [positionLoading, setPositionLoading] = useState(false);

  // Load positions for initial department (edit mode)
  useEffect(() => {
    if (formData.department_id && isEdit) {
      handleDepartmentChange(formData.department_id);
    }
  }, [isEdit]); // Only run once when component mounts in edit mode

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Handle department change - fetch positions for selected department
    if (name === 'department_id' && value) {
      handleDepartmentChange(value);
    } else if (name === 'department_id' && !value) {
      // Reset positions when no department is selected
      setDepartmentPositions([]);
      setFormData(prev => ({
        ...prev,
        position_id: '' // Clear selected position
      }));
    }

    // Handle position change - auto-populate salary if available
    if (name === 'position_id' && value && departmentPositions.length > 0) {
      const selectedPosition = departmentPositions.find(pos => pos.id === value);
      if (selectedPosition && selectedPosition.min_salary && !formData.salary) {
        // Auto-populate with minimum salary if no salary is set
        setFormData(prev => ({
          ...prev,
          position_id: value,
          salary: selectedPosition.min_salary
        }));
        return; // Prevent the normal setState
      }
    }
  };

  const handleDepartmentChange = async (departmentId) => {
    try {
      setPositionLoading(true);
      
      // Try to fetch positions from API
      const response = await apiService.positions.getByDepartment(departmentId);
      const deptPositions = response?.data || response || [];
      
      if (deptPositions.length > 0) {
        setDepartmentPositions(deptPositions);
      } else {
        // Fallback to filtering existing positions
        const filteredPositions = positions.filter(pos => pos.department_id === departmentId);
        setDepartmentPositions(filteredPositions);
      }
      
      // Clear any previously selected position since department changed
      setFormData(prev => ({
        ...prev,
        position_id: ''
      }));
      
    } catch (error) {
      console.error('Failed to fetch positions for department:', error);
      // Fallback to client-side filtering
      const filteredPositions = positions.filter(pos => pos.department_id === departmentId);
      setDepartmentPositions(filteredPositions);
    } finally {
      setPositionLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    const requiredFields = [
      'first_name', 'last_name', 'phone', 'personal_email',
      'department_id', 'hire_date', 'salary'
    ];

    if (!isEdit) {
      requiredFields.push('email', 'password', 'employee_id');
    }

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.personal_email && !emailRegex.test(formData.personal_email)) {
      newErrors.personal_email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Salary validation
    if (formData.salary && isNaN(formData.salary)) {
      newErrors.salary = 'Salary must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const submitData = { ...formData };

    // Convert salary to number
    if (submitData.salary) {
      submitData.salary = parseFloat(submitData.salary);
    }

    // For edit, don't send password if empty
    if (isEdit && !submitData.password) {
      delete submitData.password;
    }

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="nr-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="nr-card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold gradient-text">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 text-2xl font-light"
              disabled={loading}
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="nr-card-body space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-100 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={`nr-input w-full ${errors.first_name ? 'border-red-500' : ''}`}
                  placeholder="Enter first name"
                  disabled={loading}
                />
                {errors.first_name && (
                  <p className="text-red-400 text-xs mt-1">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={`nr-input w-full ${errors.last_name ? 'border-red-500' : ''}`}
                  placeholder="Enter last name"
                  disabled={loading}
                />
                {errors.last_name && (
                  <p className="text-red-400 text-xs mt-1">{errors.last_name}</p>
                )}
              </div>

              {!isEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleInputChange}
                    className={`nr-input w-full ${errors.employee_id ? 'border-red-500' : ''}`}
                    placeholder="Enter employee ID"
                    disabled={loading}
                  />
                  {errors.employee_id && (
                    <p className="text-red-400 text-xs mt-1">{errors.employee_id}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="nr-input w-full"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="nr-select w-full"
                  disabled={loading}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-100 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`nr-input w-full ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="Enter phone number"
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Personal Email *
                </label>
                <input
                  type="email"
                  name="personal_email"
                  value={formData.personal_email}
                  onChange={handleInputChange}
                  className={`nr-input w-full ${errors.personal_email ? 'border-red-500' : ''}`}
                  placeholder="Enter personal email"
                  disabled={loading}
                />
                {errors.personal_email && (
                  <p className="text-red-400 text-xs mt-1">{errors.personal_email}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="nr-input w-full"
                  placeholder="Enter address"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="nr-input w-full"
                  placeholder="Enter city"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="nr-input w-full"
                  placeholder="Enter state"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  className="nr-input w-full"
                  placeholder="Enter postal code"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="nr-input w-full"
                  placeholder="Enter country"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-100 mb-4">Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Department *
                  <span className="text-xs text-gray-400 ml-1">(Select to load positions)</span>
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleInputChange}
                  className={`nr-select w-full ${errors.department_id ? 'border-red-500' : ''}`}
                  disabled={loading}
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                {errors.department_id && (
                  <p className="text-red-400 text-xs mt-1">{errors.department_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Position
                  {positionLoading && (
                    <span className="ml-2 text-xs text-primary-400">
                      <Loader className="inline h-3 w-3 animate-spin mr-1" />
                      Loading positions...
                    </span>
                  )}
                </label>
                <select
                  name="position_id"
                  value={formData.position_id}
                  onChange={handleInputChange}
                  className="nr-select w-full"
                  disabled={loading || !formData.department_id || positionLoading}
                >
                  {!formData.department_id ? (
                    <option value="">Select department first</option>
                  ) : positionLoading ? (
                    <option value="">Loading positions...</option>
                  ) : departmentPositions.length === 0 ? (
                    <option value="">No positions available</option>
                  ) : (
                    <>
                      <option value="">Select position</option>
                      {departmentPositions.map(pos => (
                        <option key={pos.id} value={pos.id}>
                          {pos.title} {pos.min_salary && pos.max_salary && 
                            `($${pos.min_salary.toLocaleString()} - $${pos.max_salary.toLocaleString()})`
                          }
                        </option>
                      ))}
                    </>
                  )}
                </select>
                
                {/* Show selected position details */}
                {formData.position_id && departmentPositions.length > 0 && (
                  <div className="mt-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                    {(() => {
                      const selectedPos = departmentPositions.find(pos => pos.id === formData.position_id);
                      if (!selectedPos) return null;
                      
                      return (
                        <div className="text-sm">
                          <p className="text-gray-300 font-medium">{selectedPos.title}</p>
                          {selectedPos.description && (
                            <p className="text-gray-400 mt-1 text-xs">{selectedPos.description}</p>
                          )}
                          {selectedPos.min_salary && selectedPos.max_salary && (
                            <p className="text-primary-400 mt-1 font-semibold">
                              Salary Range: ${selectedPos.min_salary.toLocaleString()} - ${selectedPos.max_salary.toLocaleString()}
                            </p>
                          )}
                          {selectedPos.employment_type && (
                            <p className="text-gray-400 mt-1 text-xs">
                              Type: <span className="capitalize">{selectedPos.employment_type}</span>
                              {selectedPos.level && (
                                <span className="ml-2">• Level: <span className="capitalize">{selectedPos.level}</span></span>
                              )}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Hire Date *
                </label>
                <input
                  type="date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleInputChange}
                  className={`nr-input w-full ${errors.hire_date ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
                {errors.hire_date && (
                  <p className="text-red-400 text-xs mt-1">{errors.hire_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Employment Status
                </label>
                <select
                  name="employment_status"
                  value={formData.employment_status}
                  onChange={handleInputChange}
                  className="nr-select w-full"
                  disabled={loading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="terminated">Terminated</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Employment Type
                </label>
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleInputChange}
                  className="nr-select w-full"
                  disabled={loading}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Salary *
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className={`nr-input w-full ${errors.salary ? 'border-red-500' : ''}`}
                  placeholder="Enter salary"
                  disabled={loading}
                />
                {errors.salary && (
                  <p className="text-red-400 text-xs mt-1">{errors.salary}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Salary Type
                </label>
                <select
                  name="salary_type"
                  value={formData.salary_type}
                  onChange={handleInputChange}
                  className="nr-select w-full"
                  disabled={loading}
                >
                  <option value="annual">Annual</option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-100 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isEdit && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`nr-input w-full ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="Enter work email"
                      disabled={loading}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`nr-input w-full ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="Enter password"
                      disabled={loading}
                    />
                    {errors.password && (
                      <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>
                </>
              )}

              {isEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    New Password (optional)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="nr-input w-full"
                    placeholder="Leave empty to keep current password"
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="nr-select w-full"
                  disabled={loading}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="nr-btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="nr-btn-primary flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEdit ? 'Update Employee' : 'Create Employee'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch employees, departments, and positions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [employeesResponse, departmentsResponse, positionsResponse] = await Promise.all([
          apiService.employees.getAll().catch(() => ({ data: mockEmployees })),
          apiService.departments.getAll().catch(() => ({ data: [] })),
          apiService.positions.getAll().catch(() => ({ data: [] }))
        ]);

        const employeesData = employeesResponse?.data || employeesResponse || mockEmployees;
        const departmentsData = departmentsResponse.data || departmentsResponse || [];
        const positionsData = positionsResponse.data || positionsResponse || [];

        setEmployees(employeesData);
        setDepartments(departmentsData);

        // Use API positions or fallback to mock positions
        if (positionsData.length > 0) {
          setPositions(positionsData);
        } else {
          // Fallback to mock positions from mock data
          const { mockPositions } = await import('../data/mockData');
          setPositions(mockPositions);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load data. Showing demo data.');
        setEmployees(mockEmployees);
        // Load mock positions as fallback
        import('../data/mockData').then(({ mockPositions }) => {
          setPositions(mockPositions);
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique departments from employees or use fetched departments
  const employeeDepartments = departments.length > 0
    ? departments.map(dept => dept.name).filter(Boolean) // Remove any undefined/null department names
    : Array.from(new Set(employees
        .map(emp => {
          // Extract department name consistently with filtering logic
          if (emp.department_id && departments.length > 0) {
            const dept = departments.find(d => d.id === emp.department_id);
            return dept?.name;
          }
          return emp.department || emp.department_name;
        })
        .filter(Boolean) // Remove undefined/null values
      ));

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const fullName = emp.name || `${emp.first_name} ${emp.last_name}` || '';
    const email = emp.email || emp.personal_email || '';
    const position = emp.position?.title || emp.position_title || '';

    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Get employee's department name - handle both ID-based and name-based department data
    let empDepartmentName = '';
    if (emp.department_id) {
      // If employee has department_id, find the department name from departments array
      const dept = departments.find(d => d.id === emp.department_id);
      empDepartmentName = dept?.name || '';
    } else {
      // Fallback to direct department name if no ID
      empDepartmentName = emp.department || emp.department_name || '';
    }
    
    const matchesDepartment = selectedDepartment === '' || empDepartmentName === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Position utility functions
  const fetchPositionsByDepartment = async (departmentId) => {
    try {
      const response = await apiService.positions.getByDepartment(departmentId);
      return response.data || response || [];
    } catch (error) {
      console.error('Failed to fetch positions for department:', error);
      // Fallback to filtering existing positions
      return positions.filter(pos => pos.department_id === departmentId);
    }
  };

  const searchPositions = async (query) => {
    try {
      const response = await apiService.positions.search(query);
      return response.data || response || [];
    } catch (error) {
      console.error('Failed to search positions:', error);
      // Fallback to client-side search
      return positions.filter(pos => 
        pos.title.toLowerCase().includes(query.toLowerCase()) ||
        pos.description?.toLowerCase().includes(query.toLowerCase())
      );
    }
  };

  const getPositionsBySalaryRange = async (minSalary, maxSalary) => {
    try {
      const response = await apiService.positions.getBySalaryRange(minSalary, maxSalary);
      return response.data || response || [];
    } catch (error) {
      console.error('Failed to fetch positions by salary range:', error);
      // Fallback to client-side filtering
      return positions.filter(pos => 
        pos.min_salary >= minSalary && pos.max_salary <= maxSalary
      );
    }
  };

  // CRUD Operations
  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      try {
        setActionLoading(true);
        await apiService.employees.delete(id);
        setEmployees(employees.filter(emp => emp.id !== id));
        alert('Employee deleted successfully!');
      } catch (error) {
        console.error('Failed to delete employee:', error);
        alert(`Failed to delete employee: ${error.message}`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleAddEmployee = async (employeeData) => {
    try {
      setActionLoading(true);
      const response = await apiService.employees.create(employeeData);
      const newEmployee = response.data || response;
      setEmployees([...employees, newEmployee]);
      setShowAddModal(false);
      alert('Employee added successfully!');

      // Refresh employees list to get updated data
      const refreshResponse = await apiService.employees.getAll();
      setEmployees(refreshResponse.data || refreshResponse);
    } catch (error) {
      console.error('Failed to add employee:', error);
      alert(`Failed to add employee: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateEmployee = async (id, employeeData) => {
    try {
      setActionLoading(true);
      const response = await apiService.employees.update(id, employeeData);
      const updatedEmployee = response.data || response;
      setEmployees(employees.map(emp => emp.id === id ? updatedEmployee : emp));
      setShowEditModal(false);
      setSelectedEmployee(null);
      alert('Employee updated successfully!');
    } catch (error) {
      console.error('Failed to update employee:', error);
      alert(`Failed to update employee: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = async (employee) => {
    try {
      setActionLoading(true);
      // Fetch detailed employee data
      const response = await apiService.employees.getOne(employee.id);
      const detailedEmployee = response.data || response || employee;
      setSelectedEmployee(detailedEmployee);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to fetch employee details:', error);
      // Fallback to basic employee data
      setSelectedEmployee(employee);
      setShowDetailsModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const getSalaryType = (salaryType) => {
    const salaryTypeMap = {
      'annual': 'per year',
      'monthly': 'per month',
      'weekly': 'per week',
      'hourly': 'per hour',
      'daily': 'per day'
    };
    return salaryTypeMap[salaryType?.toLowerCase()] || 'per year';
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 gradient-text">Employees</h1>
            <p className="text-gray-400 mt-2">Loading employees...</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-newrelic-green mx-auto mb-4" />
            <p className="text-gray-400">Fetching employee data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 gradient-text">Employees</h1>
          <p className="text-gray-400 mt-2">Manage your team members</p>
          {error && (
            <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-700 rounded text-yellow-400 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
          {/* Debug info - remove in production */}
          {/* {process.env.NODE_ENV === 'development' && selectedDepartment && (
            <div className="mt-2 p-2 bg-blue-900/20 border border-blue-700 rounded text-blue-400 text-xs">
              Debug: Selected department: "{selectedDepartment}" | Available departments: {employeeDepartments.join(', ')} | Departments data: {departments.length} items
            </div>
          )} */}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="nr-btn-primary mt-4 md:mt-0 inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="nr-card">
        <div className="nr-card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="nr-input block w-full pl-10 pr-3 py-2"
              />
            </div>

            {/* Department Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-500" />
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="nr-select block w-full pl-10 pr-3 py-2 appearance-none"
              >
                <option value="">All Departments</option>
                {employeeDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Results Count and Clear Filters */}
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>
                Showing {filteredEmployees.length} of {employees.length} employees
                {(searchTerm || selectedDepartment) && (
                  <span className="ml-2 text-primary-400">
                    (filtered)
                  </span>
                )}
              </span>
              {(searchTerm || selectedDepartment) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDepartment('');
                  }}
                  className="nr-btn-secondary flex items-center justify-center"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees && filteredEmployees.map((employee) => (
          <div key={employee.id} className="nr-card hover:shadow-dark-lg transition-all duration-200 group">
            <div className="nr-card-body">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-newrelic">
                    <span className="text-white font-semibold text-lg">
                      {employee?.first_name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-100">{employee?.first_name + " " + employee?.last_name}</h3>
                    <p className="text-sm text-gray-400">{employee?.position?.title}</p>
                  </div>
                </div>
                <span className={`nr-badge ${employee.employment_status === 'active'
                  ? 'nr-badge-success'
                  : 'nr-badge-info'
                  }`}>
                  {employee.employment_status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-300 group-hover:text-gray-200">
                  <Mail className="h-4 w-4 mr-2 text-primary-400" />
                  {employee.personal_email}
                </div>
                <div className="flex items-center text-sm text-gray-300 group-hover:text-gray-200">
                  <Phone className="h-4 w-4 mr-2 text-primary-400" />
                  {employee.phone}
                </div>
                <div className="flex items-center text-sm text-gray-300 group-hover:text-gray-200">
                  <MapPin className="h-4 w-4 mr-2 text-primary-400" />
                  {departments?.filter(dept => dept.id === employee.department_id).map(dept => dept.name)}
                </div>
                <div className="flex items-center text-sm text-gray-300 group-hover:text-gray-200">
                  <Calendar className="h-4 w-4 mr-2 text-primary-400" />
                  Joined {new Date(employee.hire_date).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <span className="text-lg font-semibold text-primary-400">
                  ${employee.salary.toLocaleString()} {getSalaryType(employee.salary_type)}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDetails(employee)}
                    className="p-2 text-gray-400 hover:text-primary-400 hover:bg-gray-700 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditEmployee(employee)}
                    className="p-2 text-gray-400 hover:text-primary-400 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Edit Employee"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Delete Employee"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Employee Details Modal */}
      {showDetailsModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="nr-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="nr-card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold gradient-text">Employee Details</h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleEditEmployee(selectedEmployee)}
                    className="nr-btn-primary text-sm flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-200 text-2xl font-light"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div className="nr-card-body space-y-6">
              {/* Employee Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-newrelic">
                    <span className="text-white font-semibold text-2xl">
                      {selectedEmployee?.first_name?.charAt(0) || selectedEmployee?.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-100">
                      {selectedEmployee.first_name && selectedEmployee.last_name
                        ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                        : selectedEmployee.name
                      }
                    </h3>
                    <p className="text-lg text-gray-300">
                      {selectedEmployee.position?.title || selectedEmployee.position}
                    </p>
                    <p className="text-sm text-gray-400">
                      Employee ID: {selectedEmployee.employee_id}
                    </p>
                    <div className="mt-2">
                      <span className={`nr-badge ${selectedEmployee.employment_status === 'active'
                          ? 'nr-badge-success'
                          : 'nr-badge-info'
                        }`}>
                        {selectedEmployee.employment_status || selectedEmployee.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-400">
                    ${selectedEmployee.salary?.toLocaleString() || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {selectedEmployee.salary_type || 'annual'}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                <button className="flex items-center text-primary-400 hover:text-primary-300">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </button>
                <button className="flex items-center text-primary-400 hover:text-primary-300">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </button>
                <button className="flex items-center text-primary-400 hover:text-primary-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-100 mb-4 border-b border-gray-700 pb-2">
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Full Name</label>
                        <p className="mt-1 text-sm text-gray-100">
                          {selectedEmployee.first_name && selectedEmployee.last_name
                            ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                            : selectedEmployee.name || 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Date of Birth</label>
                        <p className="mt-1 text-sm text-gray-100">
                          {selectedEmployee.date_of_birth
                            ? new Date(selectedEmployee.date_of_birth).toLocaleDateString()
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Gender</label>
                        <p className="mt-1 text-sm text-gray-100 capitalize">
                          {selectedEmployee.gender || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-100 mb-4 border-b border-gray-700 pb-2">
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Personal Email</label>
                        <p className="mt-1 text-sm text-gray-100">
                          {selectedEmployee.personal_email || selectedEmployee.email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Phone Number</label>
                        <p className="mt-1 text-sm text-gray-100">
                          {selectedEmployee.phone || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Address</label>
                        <p className="mt-1 text-sm text-gray-100">
                          {[selectedEmployee.address, selectedEmployee.city, selectedEmployee.state, selectedEmployee.postal_code]
                            .filter(Boolean)
                            .join(', ') || 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Country</label>
                        <p className="mt-1 text-sm text-gray-100">
                          {selectedEmployee.country || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-100 mb-4 border-b border-gray-700 pb-2">
                      Employment Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Department</label>
                        <p className="mt-1 text-sm text-gray-100">
                          {departments.find(d => d.id === selectedEmployee.department_id)?.name ||
                            selectedEmployee.department || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Position</label>
                        <p className="mt-1 text-sm text-gray-100">
                          {selectedEmployee.position?.title || selectedEmployee.position || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Employment Type</label>
                        <p className="mt-1 text-sm text-gray-100 capitalize">
                          {selectedEmployee.employment_type || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Hire Date</label>
                        <p className="mt-1 text-sm text-gray-100">
                          {selectedEmployee.hire_date
                            ? new Date(selectedEmployee.hire_date).toLocaleDateString()
                            : selectedEmployee.joinDate
                              ? new Date(selectedEmployee.joinDate).toLocaleDateString()
                              : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Manager</label>
                        <p className="mt-1 text-sm text-gray-100">
                          {selectedEmployee.manager?.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-100 mb-4 border-b border-gray-700 pb-2">
                      Compensation
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Base Salary</label>
                        <p className="mt-1 text-lg font-semibold text-primary-400">
                          ${selectedEmployee.salary?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Salary Type</label>
                        <p className="mt-1 text-sm text-gray-100 capitalize">
                          {selectedEmployee.salary_type || 'Annual'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Currency</label>
                        <p className="mt-1 text-sm text-gray-100">
                          {selectedEmployee.currency || 'USD'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact (if available) */}
              {selectedEmployee.emergencyContact && (
                <div>
                  <h4 className="text-lg font-medium text-gray-100 mb-4 border-b border-gray-700 pb-2">
                    Emergency Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Name</label>
                      <p className="mt-1 text-sm text-gray-100">
                        {selectedEmployee.emergencyContact.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Phone</label>
                      <p className="mt-1 text-sm text-gray-100">
                        {selectedEmployee.emergencyContact.phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Relationship</label>
                      <p className="mt-1 text-sm text-gray-100">
                        {selectedEmployee.emergencyContact.relationship || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-100 mb-4 border-b border-gray-700 pb-2">
                  Account Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">User Role</label>
                    <p className="mt-1 text-sm text-gray-100 capitalize">
                      {selectedEmployee.role || 'Employee'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Account Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${selectedEmployee.is_active !== false
                        ? 'bg-green-900/20 text-green-400 border border-green-700'
                        : 'bg-red-900/20 text-red-400 border border-red-700'
                      }`}>
                      {selectedEmployee.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <EmployeeForm
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddEmployee}
          departments={departments}
          positions={positions}
          loading={actionLoading}
          title="Add New Employee"
        />
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <EmployeeForm
          onClose={() => {
            setShowEditModal(false);
            setSelectedEmployee(null);
          }}
          onSubmit={(data) => handleUpdateEmployee(selectedEmployee.id, data)}
          departments={departments}
          positions={positions}
          loading={actionLoading}
          title="Edit Employee"
          initialData={selectedEmployee}
          isEdit={true}
        />
      )}
    </div>
  );
};

export default Employees;