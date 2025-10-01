import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Users,
  Building,
  Briefcase,
  Loader,
  AlertCircle
} from 'lucide-react';
import apiService from '../services/api';
import { mockPositions } from '../data/mockData';

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [positionsResponse, departmentsResponse] = await Promise.all([
          apiService.positions.getAll().catch(() => ({ data: mockPositions })),
          apiService.departments.getAll().catch(() => ({ data: [] }))
        ]);

        const positionsData = positionsResponse?.data || positionsResponse || mockPositions;
        const departmentsData = departmentsResponse.data || departmentsResponse || [];

        setPositions(positionsData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Failed to fetch positions:', error);
        setError('Failed to load positions. Showing demo data.');
        setPositions(mockPositions);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // Reset to all positions
      try {
        setSearchLoading(true);
        const response = await apiService.positions.getAll().catch(() => ({ data: mockPositions }));
        const positionsData = response?.data || response || mockPositions;
        setPositions(positionsData);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setSearchLoading(false);
      }
      return;
    }

    try {
      setSearchLoading(true);
      const response = await apiService.positions.search(searchTerm);
      const searchResults = response?.data || response || [];
      setPositions(searchResults.length > 0 ? searchResults : []);
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to client-side search
      const filteredPositions = mockPositions.filter(pos =>
        pos.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pos.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setPositions(filteredPositions);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle department filter
  const handleDepartmentFilter = async (departmentId) => {
    setSelectedDepartment(departmentId);
    
    if (!departmentId) {
      // Reset to all positions
      try {
        setSearchLoading(true);
        const response = await apiService.positions.getAll().catch(() => ({ data: mockPositions }));
        const positionsData = response?.data || response || mockPositions;
        setPositions(positionsData);
      } catch (error) {
        console.error('Filter failed:', error);
      } finally {
        setSearchLoading(false);
      }
      return;
    }

    try {
      setSearchLoading(true);
      const response = await apiService.positions.getByDepartment(departmentId);
      const filteredResults = response?.data || response || [];
      setPositions(filteredResults.length > 0 ? filteredResults : []);
    } catch (error) {
      console.error('Department filter failed:', error);
      // Fallback to client-side filtering
      const filteredPositions = mockPositions.filter(pos => pos.department_id === departmentId);
      setPositions(filteredPositions);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle salary range filter
  const handleSalaryFilter = async () => {
    if (!minSalary || !maxSalary) {
      alert('Please enter both minimum and maximum salary values');
      return;
    }

    try {
      setSearchLoading(true);
      const response = await apiService.positions.getBySalaryRange(minSalary, maxSalary);
      const filteredResults = response?.data || response || [];
      setPositions(filteredResults.length > 0 ? filteredResults : []);
    } catch (error) {
      console.error('Salary filter failed:', error);
      // Fallback to client-side filtering
      const filteredPositions = mockPositions.filter(pos =>
        pos.min_salary >= parseInt(minSalary) && pos.max_salary <= parseInt(maxSalary)
      );
      setPositions(filteredPositions);
    } finally {
      setSearchLoading(false);
    }
  };

  // Reset all filters
  const resetFilters = async () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setMinSalary('');
    setMaxSalary('');
    
    try {
      setSearchLoading(true);
      const response = await apiService.positions.getAll().catch(() => ({ data: mockPositions }));
      const positionsData = response?.data || response || mockPositions;
      setPositions(positionsData);
    } catch (error) {
      console.error('Reset failed:', error);
      setPositions(mockPositions);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleViewPosition = (position) => {
    setSelectedPosition(position);
    setShowDetailsModal(true);
  };

  const formatSalary = (min, max) => {
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }
    return 'Not specified';
  };

  const getEmploymentTypeColor = (type) => {
    switch (type) {
      case 'full-time': return 'bg-green-900/20 text-green-400 border-green-700';
      case 'part-time': return 'bg-blue-900/20 text-blue-400 border-blue-700';
      case 'contract': return 'bg-yellow-900/20 text-yellow-400 border-yellow-700';
      case 'internship': return 'bg-purple-900/20 text-purple-400 border-purple-700';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-700';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'junior': return 'bg-blue-900/20 text-blue-400 border-blue-700';
      case 'mid': return 'bg-green-900/20 text-green-400 border-green-700';
      case 'senior': return 'bg-purple-900/20 text-purple-400 border-purple-700';
      case 'lead': return 'bg-orange-900/20 text-orange-400 border-orange-700';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading positions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Positions</h1>
          <p className="text-gray-400 mt-1">Manage job positions and requirements</p>
        </div>
        {/* <div className="flex items-center space-x-3">
          <button className="nr-btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Position
          </button>
        </div> */}
      </div>

      {/* Search and Filters */}
      <div className="nr-card">
        <div className="nr-card-body space-y-6">
          {/* Main Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search positions by title or description..."
                  className="nr-input w-full pl-11 pr-4 py-3 text-base"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="nr-btn-primary px-6 py-3 flex items-center whitespace-nowrap"
              >
                {searchLoading ? (
                  <Loader className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Search className="h-5 w-5 mr-2" />
                )}
                Search
              </button>
              <button
                onClick={resetFilters}
                disabled={searchLoading}
                className="nr-btn-outline px-4 py-3 flex items-center"
                title="Reset all filters"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-300 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </h3>
              <span className="text-xs text-gray-400">
                Showing {positions.length} position{positions.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Department
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={selectedDepartment}
                    onChange={(e) => handleDepartmentFilter(e.target.value)}
                    className="nr-input pl-10 pr-8 appearance-none w-full"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Min Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Min Salary
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    placeholder="80,000"
                    className="nr-input pl-10 w-full"
                  />
                </div>
              </div>

              {/* Max Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Salary
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                    placeholder="120,000"
                    className="nr-input pl-10 w-full"
                  />
                </div>
              </div>

              {/* Apply Salary Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  &nbsp;
                </label>
                <button
                  onClick={handleSalaryFilter}
                  disabled={searchLoading || !minSalary || !maxSalary}
                  className="nr-btn-secondary w-full flex items-center justify-center"
                  title="Apply salary range filter"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Apply Range
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || selectedDepartment || (minSalary && maxSalary)) && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-400">Active filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-900/20 text-primary-400 border border-primary-700">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        resetFilters();
                      }}
                      className="ml-2 text-primary-300 hover:text-primary-200"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedDepartment && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900/20 text-blue-400 border border-blue-700">
                    Dept: {departments.find(d => d.id === selectedDepartment)?.name}
                    <button
                      onClick={() => handleDepartmentFilter('')}
                      className="ml-2 text-blue-300 hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                )}
                {minSalary && maxSalary && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-700">
                    Salary: ${parseInt(minSalary).toLocaleString()} - ${parseInt(maxSalary).toLocaleString()}
                    <button
                      onClick={() => {
                        setMinSalary('');
                        setMaxSalary('');
                        resetFilters();
                      }}
                      className="ml-2 text-green-300 hover:text-green-200"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="nr-card bg-red-900/20 border-red-700">
          <div className="nr-card-body">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Positions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {positions.map(position => (
          <div key={position.id} className="nr-card hover:shadow-newrelic-lg transition-all duration-300">
            <div className="nr-card-body">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-100 mb-1">
                    {position.title}
                  </h3>
                  <p className="text-sm text-gray-400 flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {position.department_name || 'N/A'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewPosition(position)}
                    className="text-primary-400 hover:text-primary-300 p-1"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {/* <button
                    className="text-gray-400 hover:text-gray-300 p-1"
                    title="Edit Position"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Delete Position"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button> */}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-300 line-clamp-2">
                  {position.description || 'No description available'}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-primary-400">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="text-sm font-semibold">
                      {formatSalary(position.min_salary, position.max_salary)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getEmploymentTypeColor(position.employment_type)}`}>
                    {position.employment_type || 'N/A'}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getLevelColor(position.level)}`}>
                    {position.level || 'N/A'}
                  </span>
                </div>

                {position.requirements && position.requirements.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Key Requirements:</p>
                    <ul className="text-xs text-gray-300 space-y-1">
                      {position.requirements.slice(0, 2).map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary-400 mr-2">•</span>
                          {req}
                        </li>
                      ))}
                      {position.requirements.length > 2 && (
                        <li className="text-gray-400 italic">
                          +{position.requirements.length - 2} more...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {positions.length === 0 && !loading && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No positions found</p>
          <p className="text-gray-500">Try adjusting your search criteria or add a new position</p>
        </div>
      )}

      {/* Position Details Modal */}
      {showDetailsModal && selectedPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="nr-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="nr-card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold gradient-text">Position Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-200 text-2xl font-light"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="nr-card-body space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-100 mb-2">
                    {selectedPosition.title}
                  </h3>
                  <p className="text-lg text-gray-300 flex items-center mb-4">
                    <Building className="h-5 w-5 mr-2" />
                    {selectedPosition.department_name || 'N/A'}
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getEmploymentTypeColor(selectedPosition.employment_type)}`}>
                      {selectedPosition.employment_type || 'N/A'}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getLevelColor(selectedPosition.level)}`}>
                      {selectedPosition.level || 'N/A'}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      selectedPosition.is_active 
                        ? 'bg-green-900/20 text-green-400 border border-green-700'
                        : 'bg-red-900/20 text-red-400 border border-red-700'
                    }`}>
                      {selectedPosition.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-400">
                    {formatSalary(selectedPosition.min_salary, selectedPosition.max_salary)}
                  </p>
                  <p className="text-sm text-gray-400">Salary Range</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-100 mb-4 border-b border-gray-700 pb-2">
                    Description
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    {selectedPosition.description || 'No description available'}
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-100 mb-4 border-b border-gray-700 pb-2">
                    Requirements
                  </h4>
                  {selectedPosition.requirements && selectedPosition.requirements.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedPosition.requirements.map((req, index) => (
                        <li key={index} className="flex items-start text-gray-300">
                          <span className="text-primary-400 mr-3 mt-1">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">No specific requirements listed</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-100 mb-4 border-b border-gray-700 pb-2">
                  Additional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-gray-400 mb-1">Created Date</label>
                    <p className="text-gray-200">
                      {selectedPosition.created_at 
                        ? new Date(selectedPosition.created_at).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Position ID</label>
                    <p className="text-gray-200">{selectedPosition.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Positions;