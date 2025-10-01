import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Users,
  TrendingUp,
  Filter,
  Download,
  Clock,
  Loader,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { mockEmployees, mockAttendance, monthlyAttendance } from '../data/mockData';
import { useAuth } from '../services/auth';
import apiService from '../services/api';

const Attendance = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch departments and employees on mount
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        // Fetch departments
        const deptResponse = await apiService.attendance.departments()
          .catch(() => ({ data: [] }));
        console.log('Departments API response:', deptResponse);
        setDepartments(deptResponse.data || []);

        // Fetch employees for filtering
        const empResponse = await apiService.attendance.employees({ limit: 100 })
          .catch(() => ({ data: { employees: [] } }));
        console.log('Employees API response:', empResponse);
        const empData = empResponse.data?.employees || empResponse.data || [];
        setEmployees(empData);
      } catch (error) {
        console.error('Failed to fetch static data:', error);
        // Fallback to mock data
        setDepartments([...new Set(mockEmployees.map(emp => ({ name: emp.department })))]);
        setEmployees(mockEmployees);
      }
    };

    fetchStaticData();
  }, []);

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch monthly attendance data using the new API structure
        const params = {
          month: selectedMonth,
          year: selectedYear
        };
        
        // Add optional filters
        if (selectedDepartment) {
          params.department_id = selectedDepartment;
        }
        if (selectedEmployee) {
          params.employee_id = selectedEmployee;
        }
        
        const response = await apiService.attendance.monthly(params)
          .catch(() => ({ data: { employees: [], summary: {} } }));
        
        // Debug: Log the API response structure
        console.log('Monthly attendance API response:', response);
        
        // Extract the response data based on backend structure
        const responseData = response.data || response;
        
        // Handle the API response structure
        const allRecords = [];
        if (responseData.employees && Array.isArray(responseData.employees)) {
          responseData.employees.forEach(employeeData => {
            // Handle records array for each employee
            if (employeeData.records && Array.isArray(employeeData.records)) {
              employeeData.records.forEach(record => {
                allRecords.push({
                  ...record,
                  // Ensure we have the employee details
                  employee: employeeData.employee || employeeData.employeeDetails || record.employee,
                  // Normalize field names for compatibility
                  employee_id: record.employee_id || employeeData.employee?.id
                });
              });
            }
          });
        }
        
        // Set attendance data - use mock data if no real data available
        setAttendance(allRecords.length > 0 ? allRecords : mockAttendance);

        // Check if current user is already checked in today
        if (user) {
          const userAttendance = allRecords.find(att => 
            (att.employee_id === user.employee_id || att.employee_id === user.id) && 
            att.date === selectedDate
          );
          if (userAttendance && userAttendance.check_in && !userAttendance.check_out) {
            setIsCheckedIn(true);
            setCheckInTime(userAttendance.check_in);
          } else {
            setIsCheckedIn(false);
            setCheckInTime(null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
        setError('Failed to load attendance data. Showing demo data.');
        setAttendance(mockAttendance);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedMonth, selectedYear, selectedDate, selectedDepartment, selectedEmployee, user]);

  // Filter attendance data based on selected month/year
  useEffect(() => {
    if (attendance.length > 0) {
      const filtered = attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() + 1 === selectedMonth && 
               recordDate.getFullYear() === selectedYear;
      });
      setFilteredAttendance(filtered);
    }
  }, [attendance, selectedMonth, selectedYear]);

  // Get statistics for selected period
  const todayAttendance = filteredAttendance.filter(att => att.date === selectedDate);
  const monthlyAttendanceData = filteredAttendance;
  
  // Check if selected date is today
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const isCurrentMonth = selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear();
  
  // Calculate daily statistics (for selected date)
  const totalWorkingDays = [...new Set(filteredAttendance.map(att => att.date))].length;
  const presentCount = todayAttendance.filter(att => att.status === 'present' || att.status === 'late').length;
  const absentCount = todayAttendance.filter(att => att.status === 'absent').length;
  const lateCount = todayAttendance.filter(att => att.status === 'late').length;
  const halfDayCount = todayAttendance.filter(att => att.status === 'half-day').length;
  
  // Monthly summary statistics
  const monthlyPresentCount = monthlyAttendanceData.filter(att => att.status === 'present' || att.status === 'late').length;
  const monthlyAbsentCount = monthlyAttendanceData.filter(att => att.status === 'absent').length;
  const monthlyLateCount = monthlyAttendanceData.filter(att => att.status === 'late').length;
  const monthlyHalfDayCount = monthlyAttendanceData.filter(att => att.status === 'half-day').length;
  
  // Generate card labels based on context
  const getCardLabel = (baseLabel) => {
    if (isToday) return `Today's ${baseLabel}`;
    return `Selected Date ${baseLabel}`;
  };
  
  const getMonthlyLabel = () => {
    if (isCurrentMonth) return 'This Month';
    return `${new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'short' })} ${selectedYear}`;
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      const now = new Date();
      const checkInData = {
        employee_id: user.employee_id || user.id,
        date: selectedDate,
        check_in: now.toTimeString().split(' ')[0]
      };

      const response = await apiService.attendance.checkIn(checkInData);
      
      if (response.success) {
        setIsCheckedIn(true);
        setCheckInTime(now.toLocaleTimeString());
        
        // Refresh attendance data to show the new check-in
        const params = {
          month: selectedMonth,
          year: selectedYear,
          ...(selectedDepartment && { department_id: selectedDepartment }),
          ...(selectedEmployee && { employee_id: selectedEmployee })
        };
        
        const refreshResponse = await apiService.attendance.monthly(params);
        const responseData = refreshResponse.data || refreshResponse;
        
        // Update attendance state with new data
        const allRecords = [];
        if (responseData.employees && Array.isArray(responseData.employees)) {
          responseData.employees.forEach(employeeData => {
            if (employeeData.records && Array.isArray(employeeData.records)) {
              employeeData.records.forEach(record => {
                allRecords.push({
                  ...record,
                  employee: employeeData.employee || employeeData.employeeDetails || record.employee,
                  employee_id: record.employee_id || employeeData.employee?.id
                });
              });
            }
          });
        }
        setAttendance(allRecords.length > 0 ? allRecords : attendance);
      }
    } catch (error) {
      console.error('Check-in failed:', error);
      alert(error.message || 'Failed to check in. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      const now = new Date();
      const checkOutData = {
        employee_id: user.employee_id || user.id,
        date: selectedDate,
        check_out: now.toTimeString().split(' ')[0]
      };

      const response = await apiService.attendance.checkOut(checkOutData);
      
      if (response.success) {
        setIsCheckedIn(false);
        setCheckInTime(null);
        
        // Refresh attendance data to show the check-out
        const params = {
          month: selectedMonth,
          year: selectedYear,
          ...(selectedDepartment && { department_id: selectedDepartment }),
          ...(selectedEmployee && { employee_id: selectedEmployee })
        };
        
        const refreshResponse = await apiService.attendance.monthly(params);
        const responseData = refreshResponse.data || refreshResponse;
        
        // Update attendance state with new data
        const allRecords = [];
        if (responseData.employees && Array.isArray(responseData.employees)) {
          responseData.employees.forEach(employeeData => {
            if (employeeData.records && Array.isArray(employeeData.records)) {
              employeeData.records.forEach(record => {
                allRecords.push({
                  ...record,
                  employee: employeeData.employee || employeeData.employeeDetails || record.employee,
                  employee_id: record.employee_id || employeeData.employee?.id
                });
              });
            }
          });
        }
        setAttendance(allRecords.length > 0 ? allRecords : attendance);
      }
    } catch (error) {
      console.error('Check-out failed:', error);
      alert(error.message || 'Failed to check out. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      'half-day': 'bg-blue-100 text-blue-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'late':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'half-day':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  // Export handler
  const handleExport = async () => {
    try {
      const params = {
        start_date: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`,
        end_date: new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0],
        format: 'csv'
      };
      
      if (selectedDepartment) {
        params.department_id = selectedDepartment;
      }
      if (selectedEmployee) {
        params.employee_id = selectedEmployee;
      }

      const response = await apiService.attendance.export(params);
      
      // Create download link
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_${selectedYear}_${selectedMonth.toString().padStart(2, '0')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Attendance Management</h1>
          <p className="text-gray-400">Loading attendance data...</p>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-newrelic-green mx-auto mb-4" />
            <p className="text-gray-400">Fetching attendance records...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Attendance Management</h1>
        <p className="text-gray-400">Track and manage employee attendance</p>
        {error && (
          <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-yellow-400 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="nr-card mb-6">
        <div className="nr-card-body">
          {/* Main Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Departments</option>
                {departments.length > 0 ? (
                  departments.map(dept => (
                    <option key={dept.id || dept.name} value={dept.id || dept.name}>
                      {dept.name}
                    </option>
                  ))
                ) : (
                  [...new Set(mockEmployees.map(emp => emp.department))].sort().map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Employee Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Employees</option>
                {(employees.length > 0 ? employees : mockEmployees)
                  .filter(emp => {
                    if (!selectedDepartment) return true;
                    return emp.department === selectedDepartment || emp.department?.name === selectedDepartment;
                  })
                  .sort((a, b) => {
                    const nameA = a.name || `${a.first_name} ${a.last_name}`;
                    const nameB = b.name || `${b.first_name} ${b.last_name}`;
                    return nameA.localeCompare(nameB);
                  })
                  .map(emp => {
                    const empName = emp.name || `${emp.first_name} ${emp.last_name}`;
                    const empDept = emp.department?.name || emp.department;
                    return (
                      <option key={emp.id} value={emp.id}>
                        {empName} - {empDept}
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* Quick Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Specific Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col justify-end space-y-2">
              <button
                onClick={() => {
                  const now = new Date();
                  setSelectedMonth(now.getMonth() + 1);
                  setSelectedYear(now.getFullYear());
                  setSelectedDate(now.toISOString().split('T')[0]);
                  setSelectedDepartment('');
                  setSelectedEmployee('');
                }}
                className="nr-btn-secondary text-sm flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </button>
            </div>
          </div>

          {/* Quick Month Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
                  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
                  setSelectedMonth(prevMonth);
                  setSelectedYear(prevYear);
                }}
                className="nr-btn-secondary text-sm"
              >
                ← Previous Month
              </button>
              <button
                onClick={() => {
                  const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
                  const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
                  setSelectedMonth(nextMonth);
                  setSelectedYear(nextYear);
                }}
                className="nr-btn-secondary text-sm"
              >
                Next Month →
              </button>
            </div>

            {/* Period Info */}
            <div className="text-sm text-gray-300">
              <strong>Viewing:</strong> {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              {selectedDepartment && (
                <span className="ml-3">
                  <strong>•</strong> {selectedDepartment}
                </span>
              )}
              {selectedEmployee && (
                <span className="ml-3">
                  <strong>•</strong> {
                    (() => {
                      const emp = (employees.length > 0 ? employees : mockEmployees)
                        .find(emp => emp.id === selectedEmployee);
                      return emp?.name || `${emp?.first_name} ${emp?.last_name}`;
                    })()
                  }
                </span>
              )}
              {filteredAttendance.length > 0 && (
                <span className="ml-3 text-primary-400">
                  <strong>{filteredAttendance.length}</strong> records
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Employee Check-in/out Section (only for employees) */}
      {user?.role === 'employee' && (
        <div className="nr-card bg-gradient-to-r from-primary-600 to-primary-700 border-primary-500">
          <div className="nr-card-body">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-white">Welcome back, {user.name}!</h2>
                <p className="text-primary-100">Current time: {currentTime.toLocaleTimeString()}</p>
                {checkInTime && (
                  <p className="text-primary-100 mt-1">Checked in at: {checkInTime}</p>
                )}
              </div>
              <div className="mt-4 md:mt-0">
                {!isCheckedIn ? (
                  <button
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-newrelic disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {actionLoading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                        Checking In...
                      </>
                    ) : (
                      'Check In'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    className="bg-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-newrelic disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {actionLoading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                        Checking Out...
                      </>
                    ) : (
                      'Check Out'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="nr-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary-500">
          <div className="nr-card-body">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-primary-400" />
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {getCardLabel('Present')}
                  </p>
                </div>
                <p className="text-3xl font-bold text-primary-400 mb-1">{presentCount}</p>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-gray-400">{getMonthlyLabel()}: {monthlyPresentCount}</span>
                  {monthlyAttendanceData.length > 0 && (
                    <span className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full">
                      {Math.round((monthlyPresentCount / monthlyAttendanceData.length) * 100)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl">
                <CheckCircle className="h-8 w-8 text-primary-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="nr-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
          <div className="nr-card-body">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {getCardLabel('Absent')}
                  </p>
                </div>
                <p className="text-3xl font-bold text-red-400 mb-1">{absentCount}</p>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-gray-400">{getMonthlyLabel()}: {monthlyAbsentCount}</span>
                  {monthlyAttendanceData.length > 0 && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full">
                      {Math.round((monthlyAbsentCount / monthlyAttendanceData.length) * 100)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="nr-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500">
          <div className="nr-card-body">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {getCardLabel('Late')}
                  </p>
                </div>
                <p className="text-3xl font-bold text-yellow-400 mb-1">{lateCount}</p>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-gray-400">{getMonthlyLabel()}: {monthlyLateCount}</span>
                  {monthlyAttendanceData.length > 0 && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full">
                      {Math.round((monthlyLateCount / monthlyAttendanceData.length) * 100)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl">
                <AlertCircle className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="nr-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="nr-card-body">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {getCardLabel('Half Days')}
                  </p>
                </div>
                <p className="text-3xl font-bold text-blue-400 mb-1">{halfDayCount}</p>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-gray-400">{getMonthlyLabel()}: {monthlyHalfDayCount}</span>
                  {monthlyAttendanceData.length > 0 && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                      {Math.round((monthlyHalfDayCount / monthlyAttendanceData.length) * 100)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Summary */}
      <div className="nr-card mb-6">
        <div className="nr-card-header">
          <h3 className="text-lg font-semibold gradient-text">Department-wise Attendance Summary</h3>
        </div>
        <div className="nr-card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              // Calculate department-wise statistics
              const deptStats = {};
              
              filteredAttendance.forEach(record => {
                // Use the employee data from the record first, then fallback to lookup
                let employee = record.employee;
                if (!employee) {
                  employee = (employees.length > 0 ? employees : mockEmployees).find(emp => 
                    emp.id === (record.employee_id || record.employeeId)
                  );
                }
                
                if (employee) {
                  const dept = employee.department?.name || employee.department;
                  if (!deptStats[dept]) {
                    deptStats[dept] = { present: 0, absent: 0, late: 0, halfDay: 0, total: 0 };
                  }
                  deptStats[dept][record.status === 'half-day' ? 'halfDay' : record.status]++;
                  deptStats[dept].total++;
                }
              });

              return Object.entries(deptStats).map(([dept, stats]) => {
                const presentRate = Math.round(((stats.present + stats.late) / Math.max(stats.total, 1)) * 100);
                return (
                  <div key={dept} className="p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-100">{dept}</h4>
                      <span className="text-sm text-gray-400">{stats.total} records</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-primary-400" />
                        <span className="text-gray-300">{stats.present}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3 text-yellow-400" />
                        <span className="text-gray-300">{stats.late}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <XCircle className="w-3 h-3 text-red-400" />
                        <span className="text-gray-300">{stats.absent}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span className="text-gray-300">{stats.halfDay}</span>
                      </div>
                    </div>
                    <div className="bg-gray-600 rounded-full h-2 mb-1">
                      <div 
                        className="bg-primary-400 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${presentRate}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400">{presentRate}% attendance rate</p>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Attendance Chart */}
        <div className="nr-card">
          <div className="nr-card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold gradient-text">Monthly Attendance Analysis</h3>
              <span className="text-sm text-gray-400">
                {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="nr-card-body pt-0">
            {/* Monthly Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                <p className="text-2xl font-bold text-primary-400">{Math.round((monthlyPresentCount / Math.max(filteredAttendance.length, 1)) * 100)}%</p>
                <p className="text-xs text-gray-400 mt-1">Present Rate</p>
              </div>
              <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                <p className="text-2xl font-bold text-yellow-400">{Math.round((monthlyLateCount / Math.max(filteredAttendance.length, 1)) * 100)}%</p>
                <p className="text-xs text-gray-400 mt-1">Late Rate</p>
              </div>
              <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                <p className="text-2xl font-bold text-red-400">{Math.round((monthlyAbsentCount / Math.max(filteredAttendance.length, 1)) * 100)}%</p>
                <p className="text-xs text-gray-400 mt-1">Absent Rate</p>
              </div>
              <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                <p className="text-2xl font-bold text-blue-400">{Math.round((monthlyHalfDayCount / Math.max(filteredAttendance.length, 1)) * 100)}%</p>
                <p className="text-xs text-gray-400 mt-1">Half Day Rate</p>
              </div>
            </div>

            {/* Daily Breakdown Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={(() => {
                  // Generate daily attendance data for the selected month
                  const dailyData = [];
                  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
                  
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    const dayRecords = filteredAttendance.filter(record => record.date === dateStr);
                    
                    const present = dayRecords.filter(r => r.status === 'present' || r.status === 'late').length;
                    const absent = dayRecords.filter(r => r.status === 'absent').length;
                    const late = dayRecords.filter(r => r.status === 'late').length;
                    const halfDay = dayRecords.filter(r => r.status === 'half-day').length;
                    
                    // Skip weekends for cleaner chart
                    const date = new Date(selectedYear, selectedMonth - 1, day);
                    if (date.getDay() !== 0 && date.getDay() !== 6) {
                      dailyData.push({
                        day: day,
                        date: dateStr,
                        present,
                        absent,
                        late,
                        halfDay,
                        total: present + absent + late + halfDay
                      });
                    }
                  }
                  
                  return dailyData;
                })()}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="day" 
                  stroke="#9CA3AF"
                  label={{ value: 'Day of Month', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  label={{ value: 'Employees', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151', 
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  formatter={(value, name) => [value, name ? name.charAt(0).toUpperCase() + name.slice(1) : name]}
                  labelFormatter={(day) => `Day ${day}`}
                />
                <Bar dataKey="present" stackId="a" fill="#00ce7c" name="present" />
                <Bar dataKey="late" stackId="a" fill="#f59e0b" name="late" />
                <Bar dataKey="halfDay" stackId="a" fill="#3b82f6" name="half day" />
                <Bar dataKey="absent" stackId="a" fill="#ef4444" name="absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Selected Date Attendance List */}
        <div className="nr-card">
          <div className="nr-card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold gradient-text">
                {isToday ? "Today's Attendance" : "Daily Attendance"}
              </h3>
              <span className="text-sm text-gray-400">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
          <div className="nr-card-body pt-0">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {todayAttendance.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No attendance records for {isToday ? 'today' : 'selected date'}</p>
                  <p className="text-sm mt-1">{new Date(selectedDate).toLocaleDateString()}</p>
                </div>
              ) : (
                todayAttendance.map((record) => {
                  // Use the employee data from the record first, then fallback to lookup
                  let employee = record.employee;
                  if (!employee) {
                    employee = (employees.length > 0 ? employees : mockEmployees).find(emp => 
                      emp.id === (record.employee_id || record.employeeId)
                    );
                  }
                  if (!employee) return null;

                  const checkInTime = record.check_in;
                  const checkOutTime = record.check_out;
                  const empName = employee.name || `${employee.first_name} ${employee.last_name}`;
                  const empDept = employee.department?.name || employee.department;

                  return (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {empName?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-100">{empName}</p>
                          <p className="text-sm text-gray-400">{empDept}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {checkInTime && (
                          <span className="text-sm text-gray-300">
                            {checkInTime} - {checkOutTime || 'Active'}
                          </span>
                        )}
                        <span className={`nr-badge ${
                          record.status === 'present' ? 'nr-badge-success' :
                          record.status === 'absent' ? 'nr-badge-danger' :
                          record.status === 'late' ? 'nr-badge-warning' :
                          'nr-badge-info'
                        }`}>
                          {getStatusIcon(record.status)}
                          <span className="ml-1 capitalize">{record.status.replace('-', ' ')}</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Attendance Table */}
      <div className="nr-card">
        <div className="nr-card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold gradient-text">
              Monthly Attendance Records
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400">
                {filteredAttendance.length} records
              </span>
              <button 
                onClick={handleExport}
                className="nr-btn-secondary inline-flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
        
        <div className="nr-card-body pt-0">
          {filteredAttendance.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Records Found</h3>
              <p className="mb-4">
                No attendance records found for {' '}
                <span className="text-primary-400 font-medium">
                  {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                {selectedDepartment && (
                  <span> in <span className="text-primary-400 font-medium">{selectedDepartment}</span></span>
                )}
                {selectedEmployee && (
                  <span> for <span className="text-primary-400 font-medium">
                    {(() => {
                      const emp = (employees.length > 0 ? employees : mockEmployees)
                        .find(emp => emp.id === selectedEmployee);
                      return emp?.name || `${emp?.first_name} ${emp?.last_name}`;
                    })()}
                  </span></span>
                )}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => {
                    const now = new Date();
                    setSelectedMonth(now.getMonth() + 1);
                    setSelectedYear(now.getFullYear());
                  }}
                  className="nr-btn-secondary text-sm"
                >
                  View Current Month
                </button>
                <button
                  onClick={() => {
                    setSelectedDepartment('');
                    setSelectedEmployee('');
                  }}
                  className="nr-btn-secondary text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                  {filteredAttendance
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 100) // Limit to 100 records for performance
                    .map((record) => {
                      // Use the employee data from the record first, then fallback to lookup
                      let employee = record.employee;
                      if (!employee) {
                        employee = (employees.length > 0 ? employees : mockEmployees).find(emp => 
                          emp.id === (record.employee_id || record.employeeId)
                        );
                      }
                      if (!employee) return null;

                      const checkInTime = record.check_in;
                      const checkOutTime = record.check_out;
                      const totalHours = record.total_hours;
                      const empName = employee.name || `${employee.first_name} ${employee.last_name}`;
                      const empDept = employee.department?.name || employee.department;

                      return (
                        <tr key={record.id} className="hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {empName?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-100">{empName}</div>
                                <div className="text-sm text-gray-400">{empDept}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {checkInTime || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {checkOutTime || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {totalHours ? `${totalHours}h` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`nr-badge ${
                              record.status === 'present' ? 'nr-badge-success' :
                              record.status === 'absent' ? 'nr-badge-danger' :
                              record.status === 'late' ? 'nr-badge-warning' :
                              'nr-badge-info'
                            }`}>
                              {getStatusIcon(record.status)}
                              <span className="ml-1 capitalize">{record.status.replace('-', ' ')}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              
              {filteredAttendance.length > 100 && (
                <div className="mt-4 text-center text-sm text-gray-400">
                  Showing 100 of {filteredAttendance.length} records. Use filters to narrow down results.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;