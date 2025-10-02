import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Check, 
  X, 
  Clock, 
  Filter,
  User,
  FileText,
  AlertCircle,
  Loader2,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Building
} from 'lucide-react';
import { mockLeaves, mockEmployees } from '../data/mockData';
import { useAuth } from '../services/auth';
import { apiService } from '../services/api';

const LeavesAdvanced = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, calendar, requests, approvals
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [leaves, setLeaves] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Filter State
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    employee: '',
    department: '',
    dateRange: {
      start: '',
      end: ''
    },
    search: ''
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Modal States
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [bulkSelectedLeaves, setBulkSelectedLeaves] = useState([]);
  
  // Form State
  const [leaveForm, setLeaveForm] = useState({
    employee_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
    emergency_contact: '',
    contact_info: ''
  });
  
  // Approval State
  const [approvalForm, setApprovalForm] = useState({
    status: '',
    comments: ''
  });

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, [user]);

  // Reload data when filters or pagination changes
  useEffect(() => {
    if (!loading) {
      loadLeaveData();
    }
  }, [filters, currentPage, currentMonth]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadLeaveData(),
        loadLeaveTypes(),
        loadStatistics(),
        loadLeaveBalance(),
        loadEmployees(),
        loadDepartments()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveData = async () => {
    try {
      const filterParams = {
        ...filters,
        status: filters.status || 'all',
        page: currentPage,
        limit: itemsPerPage,
        start_date: filters.dateRange.start,
        end_date: filters.dateRange.end
      };

      const response = await apiService.leaves.getAll(filterParams);
      
      if (response.success) {
        setLeaves(response.data.leaves || []);
        setTotalPages(Math.ceil((response.data.total || 0) / itemsPerPage));
      }
    } catch (error) {
      console.error('Failed to load leave data:', error);
      // Fallback to mock data
      setLeaves(mockLeaves);
    }
  };

  const loadLeaveTypes = async () => {
    try {
      const response = await apiService.leaves.getTypes();
      if (response.success) {
        setLeaveTypes(response.data);
      }
    } catch (error) {
      console.error('Failed to load leave types:', error);
      setLeaveTypes([
        { id: 'sick', name: 'Sick Leave', max_days: 12, color: '#EF4444' },
        { id: 'vacation', name: 'Vacation', max_days: 25, color: '#3B82F6' },
        { id: 'personal', name: 'Personal Leave', max_days: 5, color: '#8B5CF6' },
        { id: 'maternity', name: 'Maternity Leave', max_days: 90, color: '#EC4899' },
        { id: 'paternity', name: 'Paternity Leave', max_days: 15, color: '#10B981' }
      ]);
    }
  };

  const loadStatistics = async () => {
    try {
      const year = new Date().getFullYear();
      const response = await apiService.leaves.getStatistics({ year });
      if (response.success) {
        let data = {
        total_requests: response.data?.summary?.total_requests,
        pending_count: response.data?.summary?.pending_requests,
        approved_count: response.data?.summary?.approved_requests,
        rejected_count: response.data?.summary?.rejected_requests,
      }
        setStatistics(data);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
      // Mock statistics
      setStatistics({
        total_requests: 25,
        pending_count: 5,
        approved_count: 18,
        rejected_count: 2,
      });
    }
  };

  const loadLeaveBalance = async () => {
    if (!user?.id) return;
    
    try {
      const response = await apiService.leaves.getBalance(user.id);
      if (response.success) {
        setLeaveBalance(response.data);
      }
    } catch (error) {
      console.error('Failed to load leave balance:', error);
      // Mock balance
       setLeaveBalance({});
     /*  setLeaveBalance({
        employee_id: user.id,
        leave_types: {
          vacation: { allocated: 25, used: 15, pending: 3, remaining: 7 },
          sick: { allocated: 12, used: 4, pending: 0, remaining: 8 },
          personal: { allocated: 5, used: 2, pending: 1, remaining: 2 }
        },
        total_days: { allocated: 42, used: 21, pending: 4, remaining: 17 }
      }); */
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await apiService.employees.getAll();
      if (response.success) {
        setEmployees(response.data);

        console.log("response.data", response.data)
        
        // Extract unique departments from employees
        const uniqueDepartments = [...new Set(response.data.map(emp => emp.department))];
        const departmentObjects = uniqueDepartments.map(dept => ({
          id: dept?.id?.toLowerCase().replace(/\s+/g, '-'),
          name: dept?.name
        }));
        setDepartments(departmentObjects);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
      // Fallback to mock data
      setEmployees([]);
      setDepartments([]);
    }
  };

  const loadDepartments = async () => {
    // Departments are now loaded with employees in loadEmployees function
    // This function is kept for compatibility but departments are set in loadEmployees
  };

  const handleCreateLeave = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.leaves.create(leaveForm);
      if (response.success) {
        setShowRequestModal(false);
        setLeaveForm({
          employee_id: '',
          leave_type_id: '',
          start_date: '',
          end_date: '',
          reason: '',
          emergency_contact: '',
          contact_info: ''
        });
        loadAllData();
        alert('Leave request created successfully!');
      }
    } catch (error) {
      console.error('Failed to create leave request:', error);
      alert(error.message || 'Failed to create leave request');
    }
  };

  const handleApprovalAction = async (leaveId, status, comments = '') => {
    try {
      const response = await apiService.leaves.updateStatus(leaveId, status, comments);
      if (response.success) {
        setShowApprovalModal(false);
        setSelectedLeave(null);
        setApprovalForm({ status: '', comments: '' });
        loadAllData();
        alert(`Leave request ${status} successfully!`);
      }
    } catch (error) {
      console.error(`Failed to ${status} leave:`, error);
      alert(`Failed to ${status} leave request`);
    }
  };

  const handleBulkAction = async (action) => {
    if (bulkSelectedLeaves.length === 0) {
      alert('Please select leave requests first');
      return;
    }

    const comments = prompt(`Please provide comments for bulk ${action}:`);
    try {
      const response = await apiService.leaves.bulkAction(action, bulkSelectedLeaves, comments || '');
      if (response.success) {
        setBulkSelectedLeaves([]);
        loadAllData();
        alert(`Bulk ${action} completed successfully!`);
      }
    } catch (error) {
      console.error(`Failed to bulk ${action}:`, error);
      alert(`Failed to bulk ${action} leave requests`);
    }
  };

  const calculateRemainingDaysThisYear = () => {
    const currentDate = new Date();
    const yearEnd = new Date(currentDate.getFullYear(), 11, 31);
    const remainingDays = Math.ceil((yearEnd - currentDate) / (1000 * 60 * 60 * 24));
    return remainingDays;
  };

  const getLeaveTypeColor = (type) => {
    const leaveType = leaveTypes.find(lt => lt.id === type);
    return leaveType?.color || '#6B7280';
  };

  const canManageLeaves = () => {
    return ['admin', 'hr', 'manager'].includes(user?.role);
  };

  const canViewAllLeaves = () => {
    return ['admin', 'hr'].includes(user?.role);
  };

  // Generate calendar days
  const generateCalendarDays = (month) => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Get leaves for a specific date
  const getLeavesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return leaves.filter(leave => {
      const startDate = new Date(leave.start_date || leave.startDate);
      const endDate = new Date(leave.end_date || leave.endDate);
      const checkDate = new Date(dateStr);
      return checkDate >= startDate && checkDate <= endDate && leave.status === 'approved';
    });
  };

  // Render Calendar View
  const renderCalendarView = () => {
    const calendarDays = generateCalendarDays(currentMonth);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
      <div className="space-y-6">
        {/* Calendar Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-100">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="nr-btn-secondary text-sm"
          >
            Today
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="nr-card">
          <div className="nr-card-body p-0">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 border-b border-gray-700">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-4 text-center text-sm font-medium text-gray-400 border-r border-gray-700 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isToday = day.toDateString() === new Date().toDateString();
                const dayLeaves = getLeavesForDate(day);

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border-r border-b border-gray-700 last:border-r-0 ${
                      isCurrentMonth ? 'bg-gray-800' : 'bg-gray-900'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-2 ${
                      isToday ? 'text-primary-400' : 
                      isCurrentMonth ? 'text-gray-200' : 'text-gray-500'
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    {/* Leave indicators */}
                    <div className="space-y-1">
                      {dayLeaves.slice(0, 3).map((leave, idx) => {
                        const employee = employees.find(emp => emp.id === (leave.employee_id || leave.employeeId));
                        const leaveType = leaveTypes.find(lt => lt.id === leave.type);
                        return (
                          <div
                            key={idx}
                            className="text-xs p-1 rounded text-white truncate"
                            style={{ backgroundColor: leave?.leave_type?.color || '#6B7280' }}
                            title={`${employee?.first_name && employee?.last_name ? `${employee.first_name} ${employee.last_name}` : employee?.name || 'Unknown'} - ${leave?.leave_type?.name || leave.type} leave`}
                          >
                            {employee?.first_name || employee?.name?.split(' ')[0] || 'Unknown'} - {leave?.leave_type?.name || leave.type}
                          </div>
                        );
                      })}
                      {dayLeaves.length > 3 && (
                        <div className="text-xs text-gray-400 p-1">
                          +{dayLeaves.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Calendar Legend */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-gray-400">Leave Types:</span>
          {leaveTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <div 
                className="h-3 w-3 rounded"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-sm text-gray-300">{type.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Leave Requests View
  const renderRequestsView = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="nr-card">
        <div className="nr-card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="nr-select block w-full"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="nr-select block w-full"
              >
                <option value="">All Types</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            {canViewAllLeaves() && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Employee</label>
                <select
                  value={filters.employee}
                  onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
                  className="nr-select block w-full"
                >
                  <option value="">All Employees</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} - {emp.department?.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="nr-input pl-10 block w-full"
                  placeholder="Search leaves..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Showing {leaves.length} of {statistics.total_requests || 0} requests
              </span>
              
              {canManageLeaves() && (
                <button
                  onClick={() => {
                    const allIds = leaves.filter(l => l.status === 'pending').map(l => l.id);
                    setBulkSelectedLeaves(bulkSelectedLeaves.length === allIds.length ? [] : allIds);
                  }}
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  {bulkSelectedLeaves.length === leaves.filter(l => l.status === 'pending').length 
                    ? 'Deselect All' : 'Select All Pending'}
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button className="nr-btn-secondary text-sm inline-flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="nr-card">
        <div className="nr-card-body">
          <div className="space-y-4">
            {leaves.map((leave) => {
              return (
                <div key={leave.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800 hover:bg-gray-750 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {canManageLeaves() && leave.status === 'pending' && (
                        <input
                          type="checkbox"
                          checked={bulkSelectedLeaves.includes(leave.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkSelectedLeaves([...bulkSelectedLeaves, leave.id]);
                            } else {
                              setBulkSelectedLeaves(bulkSelectedLeaves.filter(id => id !== leave.id));
                            }
                          }}
                          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      )}
                      
                      <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {(() => {
                            const employee = employees.find(emp => emp.id === (leave.employee_id || leave.employeeId));
                            const name = employee?.first_name && employee?.last_name ? `${employee.first_name} ${employee.last_name}` : employee?.name || 'Unknown';
                            return name.charAt(0);
                          })()}
                        </span>
                      </div>
                    
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-100">
                            {(() => {
                              const employee = employees.find(emp => emp.id === (leave.employee_id || leave.employeeId));
                              return employee?.first_name && employee?.last_name ? `${employee.first_name} ${employee.last_name}` : employee?.name || 'Unknown Employee';
                            })()}
                          </h4>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-400">
                            {(() => {
                              const employee = employees.find(emp => emp.id === (leave.employee_id || leave.employeeId));
                              return employee?.position?.title;
                            })()}
                          </span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-400">
                            {(() => {
                              const employee = employees.find(emp => emp.id === (leave.employee_id || leave.employeeId));
                              return employee?.department?.name;
                            })()}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                          <div className="flex items-center space-x-1">
                            <div 
                              className="h-3 w-3 rounded"
                              style={{ backgroundColor: leave?.leave_type?.color || '#6B7280' }}
                            />
                            <span className="capitalize">{leave?.leave_type?.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(leave.start_date || leave.startDate).toLocaleDateString()} - 
                              {new Date(leave.end_date || leave.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{leave.total_days || leave.days} day{(leave.total_days || leave.days) > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-300 mb-2">{leave.reason}</p>
                        <p className="text-xs text-gray-500">
                          Applied on {new Date(leave.applied_date || leave.appliedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  
                    <div className="flex items-center space-x-3">
                      <span className={`nr-badge ${
                        leave.status === 'approved' ? 'nr-badge-success' :
                        leave.status === 'rejected' ? 'nr-badge-danger' :
                        'nr-badge-warning'
                      }`}>
                        {leave.status === 'approved' && <Check className="h-4 w-4" />}
                        {leave.status === 'rejected' && <X className="h-4 w-4" />}
                        {leave.status === 'pending' && <Clock className="h-4 w-4" />}
                        <span className="ml-1 capitalize">{leave.status}</span>
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {canManageLeaves() && leave.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprovalAction(leave.id, 'approved')}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedLeave(leave);
                                setApprovalForm({ status: 'rejected', comments: '' });
                                setShowApprovalModal(true);
                              }}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render Approvals View (Admin/HR/Manager only)
  const renderApprovalsView = () => {
    const pendingLeaves = leaves.filter(leave => leave.status === 'pending');
    
    return (
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-100">Pending Approvals</h2>
            <p className="text-sm text-gray-400 mt-1">Review and approve leave requests</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-orange-300 font-medium">{pendingLeaves.length} pending requests</span>
            {pendingLeaves.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="nr-btn-success text-sm"
                >
                  Approve All
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="nr-btn-danger text-sm"
                >
                  Reject All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="space-y-4">
          {pendingLeaves.length === 0 ? (
            <div className="nr-card">
              <div className="nr-card-body text-center py-12">
                <Check className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-200 mb-2">All Caught Up!</h3>
                <p className="text-gray-400">No pending leave requests require your attention</p>
              </div>
            </div>
          ) : (
            pendingLeaves.map((leave) => {
              
              return (
                <div key={leave.id} className="nr-card">
                  <div className="nr-card-body">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {(() => {
                              const employee = employees.find(emp => emp.id === (leave.employee_id || leave.employeeId));
                              const name = employee?.first_name && employee?.last_name ? `${employee.first_name} ${employee.last_name}` : employee?.name || 'Unknown';
                              return name.charAt(0);
                            })()}
                          </span>
                        </div>
                      
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-100">
                              {(() => {
                                const employee = employees.find(emp => emp.id === (leave.employee_id || leave.employeeId));
                                return employee?.first_name && employee?.last_name ? `${employee.first_name} ${employee.last_name}` : employee?.name || 'Unknown Employee';
                              })()}
                            </h4>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-400">
                              {(() => {
                                const employee = employees.find(emp => emp.id === (leave.employee_id || leave.employeeId));
                                return employee?.position?.title;
                              })()}
                            </span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-400">
                              {(() => {
                                const employee = employees.find(emp => emp.id === (leave.employee_id || leave.employeeId));
                                return employee?.department?.name;
                              })()}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                            <div className="flex items-center space-x-1">
                              <div 
                                className="h-3 w-3 rounded"
                                style={{ backgroundColor: leave?.leave_type?.color || '#6B7280' }}
                              />
                              <span>{leave?.leave_type?.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(leave.start_date || leave.startDate).toLocaleDateString()} - 
                                {new Date(leave.end_date || leave.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{leave.total_days || leave.days} days</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-300 mb-2">{leave.reason}</p>
                          <p className="text-xs text-gray-500">
                            Applied on {new Date(leave.applied_date || leave.appliedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleApprovalAction(leave.id, 'approved')}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setApprovalForm({ status: 'rejected', comments: '' });
                            setShowApprovalModal(true);
                          }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Render Statistics Dashboard
  const renderStatsDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="nr-card bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <div className="nr-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Total Requests</p>
                <p className="text-3xl font-bold text-white mt-1">{statistics.total_requests || 0}</p>
                <p className="text-xs text-blue-300 mt-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  This year
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="nr-card bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
          <div className="nr-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-400 text-sm font-medium">Pending Approval</p>
                <p className="text-3xl font-bold text-white mt-1">{statistics.pending_count || 0}</p>
                <p className="text-xs text-orange-300 mt-2 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Needs attention
                </p>
              </div>
              <div className="p-3 bg-orange-500 rounded-full">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="nr-card bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <div className="nr-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-white mt-1">{statistics.approved_count || 0}</p>
                <p className="text-xs text-green-300 mt-2 flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  This period
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <Check className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="nr-card bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30">
          <div className="nr-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold text-white mt-1">{statistics.rejected_count || 0}</p>
                <p className="text-xs text-red-300 mt-2 flex items-center">
                  <X className="h-3 w-3 mr-1" />
                  This period
                </p>
              </div>
              <div className="p-3 bg-red-500 rounded-full">
                <X className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Balance Section */}
      {leaveBalance && Object.keys(leaveBalance.leave_types || {}).length > 0 && (
        <div className="nr-card">
          <div className="nr-card-header">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-100">Your Leave Balance</h3>
                <p className="text-sm text-gray-400 mt-1">Track your remaining leave days</p>
              </div>
              <User className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div className="nr-card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(leaveBalance.leave_types || {}).map(([typeId, balance]) => {
                const leaveType = leaveTypes.find(lt => lt.id === typeId);
                const usagePercentage = (balance.used / balance.allocated) * 100;
                
                return (
                  <div key={typeId} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: getLeaveTypeColor(typeId) }}
                        />
                        <h4 className="font-semibold text-gray-100">{leaveType?.name || typeId}</h4>
                      </div>
                      <span className="text-2xl font-bold text-gray-200">{balance.remaining}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Available</span>
                        <span className="font-medium text-green-400">{balance.remaining} days</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Used</span>
                        <span className="font-medium text-red-400">{balance.used} of {balance.allocated}</span>
                      </div>
                      {balance.pending > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Pending</span>
                          <span className="font-medium text-orange-400">{balance.pending} days</span>
                        </div>
                      )}
                      
                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div className="flex h-full">
                            <div 
                              className="h-full transition-all duration-300"
                              style={{ 
                                width: `${usagePercentage}%`,
                                backgroundColor: getLeaveTypeColor(typeId)
                              }}
                            />
                            {balance.pending > 0 && (
                              <div 
                                className="h-full bg-orange-400 opacity-60"
                                style={{ width: `${(balance.pending / balance.allocated) * 100}%` }}
                              />
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>0</span>
                          <span>{balance.allocated} days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Leave Types Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="nr-card">
          <div className="nr-card-header">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-100">Leave Types</h3>
                <p className="text-sm text-gray-400 mt-1">Available leave categories</p>
              </div>
              <Building className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div className="nr-card-body">
            <div className="space-y-4">
              {leaveTypes?.map((type) => (
                <div key={type.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: type.color || '#6B7280' }}
                    />
                    {console.log("type", type)}
                    <div>
                      <h4 className="font-medium text-gray-100">{type.name}</h4>
                      <p className="text-sm text-gray-400">Max: {type.max_days} days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300">{type.advance_notice_days || 0} days</p>
                    <p className="text-xs text-gray-500">notice required</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="nr-card">
          <div className="nr-card-header">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-100">Quick Actions</h3>
                <p className="text-sm text-gray-400 mt-1">Common tasks and shortcuts</p>
              </div>
              <BarChart3 className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div className="nr-card-body">
            <div className="space-y-3">
              <button
                onClick={() => setShowRequestModal(true)}
                className="w-full flex items-center justify-between p-4 bg-primary-900 hover:bg-primary-800 rounded-lg border border-primary-700 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Plus className="h-5 w-5 text-primary-400" />
                  <span className="text-gray-100 font-medium">Request Leave</span>
                </div>
                <ChevronRight className="h-5 w-5 text-primary-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setCurrentView('calendar')}
                className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-100 font-medium">View Calendar</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setCurrentView('requests')}
                className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-green-400" />
                  <span className="text-gray-100 font-medium">My Requests</span>
                </div>
                <div className="flex items-center space-x-2">
                  {statistics.pending_count > 0 && (
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                      {statistics.pending_count}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {canManageLeaves() && (
                <button
                  onClick={() => setCurrentView('approvals')}
                  className="w-full flex items-center justify-between p-4 bg-orange-900 hover:bg-orange-800 rounded-lg border border-orange-700 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-orange-400" />
                    <span className="text-gray-100 font-medium">Pending Approvals</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {statistics.pending_count > 0 && (
                      <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full animate-pulse">
                        {statistics.pending_count}
                      </span>
                    )}
                    <ChevronRight className="h-5 w-5 text-orange-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="nr-card">
        <div className="nr-card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-100">Year Overview</h3>
              <p className="text-sm text-gray-400 mt-1">Leave statistics for {new Date().getFullYear()}</p>
            </div>
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
        </div>
        <div className="nr-card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-100">{calculateRemainingDaysThisYear()}</p>
              <p className="text-sm text-gray-400">Days remaining in year</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Users className="h-8 w-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-100">{employees?.length || 0}</p>
              <p className="text-sm text-gray-400">Total employees</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-100">{leaveTypes?.length || 0}</p>
              <p className="text-sm text-gray-400">Leave types available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 gradient-text">
            Leave Management System
          </h1>
          <p className="text-gray-400 mt-2">
            {canViewAllLeaves() 
              ? 'Comprehensive leave management and analytics' 
              : 'Manage your leave requests and view balance'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          {canManageLeaves() && (
            <>
              <button
                onClick={() => setShowRequestModal(true)}
                className="nr-btn-primary inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Leave Request
              </button>
              
              {bulkSelectedLeaves.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction('approve')}
                    className="nr-btn-success text-sm"
                  >
                    Bulk Approve ({bulkSelectedLeaves.length})
                  </button>
                  <button
                    onClick={() => handleBulkAction('reject')}
                    className="nr-btn-danger text-sm"
                  >
                    Bulk Reject ({bulkSelectedLeaves.length})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {['dashboard', 'calendar', 'requests', ...(canManageLeaves() ? ['approvals'] : [])].map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                currentView === view
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {view === 'approvals' ? 'Pending Approvals' : view}
            </button>
          ))}
        </nav>
      </div>

      {/* Content based on current view */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
          <span className="ml-2 text-gray-400">Loading leave management data...</span>
        </div>
      ) : (
        <>
          {currentView === 'dashboard' && renderStatsDashboard()}
          {currentView === 'calendar' && renderCalendarView()}
          {currentView === 'requests' && renderRequestsView()}
          {currentView === 'approvals' && canManageLeaves() && renderApprovalsView()}
        </>
      )}

      {/* Leave Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="nr-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="nr-card-header">
              <h2 className="text-xl font-semibold text-gray-100">
                {canManageLeaves() ? 'Create Leave Request' : 'Request Leave'}
              </h2>
            </div>
            <div className="nr-card-body">
              <form onSubmit={handleCreateLeave} className="space-y-4">
                {canManageLeaves() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Employee *
                    </label>
                    <select
                      value={leaveForm.employee_id}
                      onChange={(e) => setLeaveForm({ ...leaveForm, employee_id: e.target.value })}
                      className="nr-select block w-full"
                      required
                    >
                      <option value="">Select employee</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} - {emp.department?.name} ({emp.position?.title})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Leave Type *
                  </label>
                  <select
                    value={leaveForm.leave_type_id}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leave_type_id: e.target.value })}
                    className="nr-select block w-full"
                    required
                  >
                    <option value="">Select leave type</option>
                    {leaveTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.max_days} days max)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={leaveForm.start_date}
                      onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                      className="nr-input block w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={leaveForm.end_date}
                      onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                      className="nr-input block w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason *
                  </label>
                  <textarea
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    rows={3}
                    className="nr-input block w-full"
                    placeholder="Please provide a reason for the leave request..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={leaveForm.emergency_contact}
                    onChange={(e) => setLeaveForm({ ...leaveForm, emergency_contact: e.target.value })}
                    className="nr-input block w-full"
                    placeholder="Emergency contact person and phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Info
                  </label>
                  <textarea
                    value={leaveForm.contact_info}
                    onChange={(e) => setLeaveForm({ ...leaveForm, contact_info: e.target.value })}
                    rows={2}
                    className="nr-input block w-full"
                    placeholder="Any form of contact information..."
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="nr-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="nr-btn-primary"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="nr-card max-w-lg w-full">
            <div className="nr-card-header">
              <h2 className="text-xl font-semibold text-gray-100">
                {approvalForm.status === 'approved' ? 'Approve' : 'Reject'} Leave Request
              </h2>
            </div>
            <div className="nr-card-body">
              <div className="mb-4">
                <p className="text-gray-300">
                  Are you sure you want to {approvalForm.status} this leave request?
                </p>
                <div className="mt-2 p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400">Employee: {(() => {
                    const employee = employees.find(emp => emp.id === (selectedLeave.employee_id || selectedLeave.employeeId));
                    return employee?.first_name && employee?.last_name ? `${employee.first_name} ${employee.last_name}` : employee?.name || 'Unknown';
                  })()}</p>
                  <p className="text-sm text-gray-400">Duration: {new Date(selectedLeave.start_date || selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.end_date || selectedLeave.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Comments {approvalForm.status === 'rejected' ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  value={approvalForm.comments}
                  onChange={(e) => setApprovalForm({ ...approvalForm, comments: e.target.value })}
                  rows={3}
                  className="nr-input block w-full"
                  placeholder={`Please provide ${approvalForm.status === 'rejected' ? 'a reason for rejection' : 'any comments'}...`}
                  required={approvalForm.status === 'rejected'}
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedLeave(null);
                    setApprovalForm({ status: '', comments: '' });
                  }}
                  className="nr-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApprovalAction(selectedLeave.id, approvalForm.status, approvalForm.comments)}
                  className={approvalForm.status === 'approved' ? 'nr-btn-success' : 'nr-btn-danger'}
                >
                  {approvalForm.status === 'approved' ? 'Approve' : 'Reject'} Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Details Modal */}
      {showDetailsModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="nr-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="nr-card-header">
              <h2 className="text-xl font-semibold text-gray-100">Leave Request Details</h2>
            </div>
            <div className="nr-card-body">
              {(() => {
                const employee = employees.find(emp => emp.id === (selectedLeave.employee_id || selectedLeave.employeeId));
                const leaveType = leaveTypes.find(lt => lt.id === selectedLeave.type);
                
                return (
                  <div className="space-y-4">
                    {/* Employee Info */}
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-100 mb-3">Employee Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-400">Name:</span>
                          <p className="text-gray-200">{employee?.first_name && employee?.last_name ? `${employee.first_name} ${employee.last_name}` : employee?.name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Department:</span>
                          <p className="text-gray-200">{employee?.department}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Position:</span>
                          <p className="text-gray-200">{employee?.position}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Employee ID:</span>
                          <p className="text-gray-200">{selectedLeave.employee_id || selectedLeave.employeeId}</p>
                        </div>
                      </div>
                    </div>

                    {/* Leave Details */}
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-100 mb-3">Leave Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-400">Leave Type:</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <div 
                              className="h-3 w-3 rounded"
                              style={{ backgroundColor: leaveType?.color || '#6B7280' }}
                            />
                            <p className="text-gray-200">{leaveType?.name}</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Status:</span>
                          <span className={`ml-2 nr-badge ${
                            selectedLeave.status === 'approved' ? 'nr-badge-success' :
                            selectedLeave.status === 'rejected' ? 'nr-badge-danger' :
                            'nr-badge-warning'
                          }`}>
                            {selectedLeave.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Start Date:</span>
                          <p className="text-gray-200">{new Date(selectedLeave.start_date || selectedLeave.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">End Date:</span>
                          <p className="text-gray-200">{new Date(selectedLeave.end_date || selectedLeave.endDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Total Days:</span>
                          <p className="text-gray-200">{selectedLeave.total_days || selectedLeave.days}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Applied Date:</span>
                          <p className="text-gray-200">{new Date(selectedLeave.applied_date || selectedLeave.appliedDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-100 mb-3">Reason</h3>
                      <p className="text-gray-200">{selectedLeave.reason}</p>
                    </div>

                    {/* Additional Information */}
                    {(selectedLeave.emergency_contact || selectedLeave.contact_info) && (
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-100 mb-3">Additional Information</h3>
                        {selectedLeave.emergency_contact && (
                          <div className="mb-3">
                            <span className="text-sm text-gray-400">Emergency Contact:</span>
                            <p className="text-gray-200">{selectedLeave.emergency_contact}</p>
                          </div>
                        )}
                        {selectedLeave.contact_info && (
                          <div>
                            <span className="text-sm text-gray-400">Contact Info:</span>
                            <p className="text-gray-200">{selectedLeave.contact_info}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Approval Information */}
                    {selectedLeave.status !== 'pending' && (
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-100 mb-3">Approval Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-400">Approved By:</span>
                            <p className="text-gray-200">{selectedLeave.approved_by || 'System'}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Decision Date:</span>
                            <p className="text-gray-200">
                              {selectedLeave.approved_date 
                                ? new Date(selectedLeave.approved_date).toLocaleDateString()
                                : 'N/A'
                              }
                            </p>
                          </div>
                        </div>
                        {selectedLeave.rejection_reason && (
                          <div className="mt-3">
                            <span className="text-sm text-gray-400">Comments:</span>
                            <p className="text-gray-200">{selectedLeave.rejection_reason}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-3 pt-4">
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          setSelectedLeave(null);
                        }}
                        className="nr-btn-secondary"
                      >
                        Close
                      </button>
                      {canManageLeaves() && selectedLeave.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setShowDetailsModal(false);
                              handleApprovalAction(selectedLeave.id, 'approved');
                            }}
                            className="nr-btn-success text-sm inline-flex items-center"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setShowDetailsModal(false);
                              setApprovalForm({ status: 'rejected', comments: '' });
                              setShowApprovalModal(true);
                            }}
                            className="nr-btn-danger text-sm inline-flex items-center"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavesAdvanced;