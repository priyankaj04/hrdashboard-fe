import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock, 
  Calendar,
  Filter,
  ChevronDown,
  UserCheck,
  UserX,
  DollarSign,
  Timer,
  Building2
} from 'lucide-react';
import apiService from '../services/api';
import { mockEmployees, departmentStats } from '../data/mockData';

const Reports = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Time period state
  const [timePeriod, setTimePeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [availableYears, setAvailableYears] = useState([]);
  
  // Data states
  const [employeeOverview, setEmployeeOverview] = useState({});
  const [hiringData, setHiringData] = useState({});
  const [salaryData, setSalaryData] = useState({});
  const [workingHoursData, setWorkingHoursData] = useState({});
  const [departmentData, setDepartmentData] = useState([]);
  const [detailedReport, setDetailedReport] = useState({ data: [], pagination: {} });
  
  // Filter states for detailed table
  const [tableFilters, setTableFilters] = useState({
    department: 'all',
    sort_by: 'employee_name',
    sort_order: 'asc',
    page: 1,
    limit: 10
  });

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, [timePeriod, selectedYear, selectedMonth]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        period: timePeriod,
        year: selectedYear,
        ...(timePeriod === 'month' && { month: selectedMonth })
      };

      // Load all analytics data in parallel
      const [
        timePeriods,
        overview,
        hiring,
        salary,
        workingHours,
        departments,
        report
      ] = await Promise.all([
        apiService.analytics.getTimePeriods().catch(() => ({ data: { available_years: [2023, 2024, 2025] } })),
        apiService.analytics.getEmployeeOverview().catch(() => ({})),
        apiService.analytics.getHiringResignationData(filters).catch(() => ({})),
        apiService.analytics.getSalarySpending(filters).catch(() => ({})),
        apiService.analytics.getWorkingHoursByDepartment(filters).catch(() => ({})),
        apiService.analytics.getDepartmentStats().catch(() => []),
        apiService.reports.getDetailedEmployeeReport({ ...tableFilters, ...filters }).catch(() => ({ data: [], pagination: {} }))
      ]);

      setAvailableYears(timePeriods?.data?.available_years || timePeriods.available_years || [2023, 2024, 2025]);
      setEmployeeOverview(overview?.data || overview);
      setHiringData(hiring?.data || hiring);
      setSalaryData(salary?.data || salary);
      setWorkingHoursData(workingHours?.data || workingHours);
      setDepartmentData(departments?.data || departments);
      setDetailedReport(report?.data || report);

    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format = 'pdf') => {
    try {
      const filters = {
        period: timePeriod,
        year: selectedYear,
        ...(timePeriod === 'month' && { month: selectedMonth }),
        format
      };
      
      const blob = await apiService.reports.exportReport('employee-detailed', filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hr-report-${selectedYear}${timePeriod === 'month' ? `-${selectedMonth.toString().padStart(2, '0')}` : ''}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const updateTableFilters = (newFilters) => {
    setTableFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Get display values with fallbacks
  const getMetrics = () => {
    // Calculate average working hours from department summary
    const avgWorkingHours = workingHoursData?.department_summary?.length > 0
      ? Math.round(
          workingHoursData.department_summary.reduce((sum, dept) => sum + (dept.average_hours || 0), 0) / 
          workingHoursData.department_summary.length
        )
      : 0;

    return {
      totalEmployees: employeeOverview.total_employees || departmentData?.total_employees || mockEmployees.length,
      presentToday: employeeOverview.present_today || Math.floor(mockEmployees.length * 0.95),
      absentToday: employeeOverview.absent_today || Math.floor(mockEmployees.length * 0.05),
      totalDepartments: employeeOverview.total_departments || departmentData?.total_departments || departmentStats.length,
      totalHirings: hiringData.total_hirings || 0,
      totalResignations: hiringData.total_resignations || 0,
      totalSalarySpending: salaryData.total_spending || 0,
      averageWorkingHours: avgWorkingHours
    };
  };

  const metrics = getMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 gradient-text">Reports & Analytics</h1>
          <p className="text-gray-400 mt-2">Comprehensive insights into your organization</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button 
            onClick={() => handleExportReport('pdf')}
            className="nr-btn-primary inline-flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
          <button 
            onClick={() => handleExportReport('csv')}
            className="nr-btn-secondary inline-flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Time Period Selection */}
      <div className="nr-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-gray-300 font-medium">Report Period:</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Period Type */}
            <div className="relative">
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="appearance-none bg-gray-800 border border-gray-600 text-gray-100 px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
              <ChevronDown className="absolute right-2 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Year Selection */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="appearance-none bg-gray-800 border border-gray-600 text-gray-100 px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Month Selection (only for monthly view) */}
            {timePeriod === 'month' && (
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="appearance-none bg-gray-800 border border-gray-600 text-gray-100 px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">Total Employees</p>
              <p className="nr-metric-value text-blue-400">{metrics.totalEmployees}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">Present Today</p>
              <p className="nr-metric-value text-newrelic-green">{metrics.presentToday}</p>
            </div>
            <div className="p-3 bg-newrelic-green/20 rounded-lg">
              <UserCheck className="h-6 w-6 text-newrelic-green" />
            </div>
          </div>
        </div>

        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">Absent Today</p>
              <p className="nr-metric-value text-red-400">{metrics.absentToday}</p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg">
              <UserX className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">Departments</p>
              <p className="nr-metric-value text-purple-400">{metrics.totalDepartments}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Building2 className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* HR Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">Total Hirings</p>
              <p className="nr-metric-value text-green-400">+{metrics.totalHirings}</p>
              <p className="text-xs text-gray-500">{timePeriod === 'month' ? 'This Month' : 'This Year'}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">Resignations</p>
              <p className="nr-metric-value text-orange-400">-{metrics.totalResignations}</p>
              <p className="text-xs text-gray-500">{timePeriod === 'month' ? 'This Month' : 'This Year'}</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-400 transform rotate-180" />
            </div>
          </div>
        </div>

        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">Salary Spending</p>
              <p className="nr-metric-value text-newrelic-green">${metrics.totalSalarySpending.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{timePeriod === 'month' ? 'This Month' : 'This Year'}</p>
            </div>
            <div className="p-3 bg-newrelic-green/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-newrelic-green" />
            </div>
          </div>
        </div>

        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">Avg Working Hours</p>
              <p className="nr-metric-value text-blue-400">{metrics.averageWorkingHours}h</p>
              <p className="text-xs text-gray-500">{timePeriod === 'month' ? 'Per Month' : 'Per Year'}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Timer className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring vs Resignation Trend */}
        {/* <div className="nr-card">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Hiring vs Resignation Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={hiringData.hiring_trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" tick={{ fill: '#9ca3af' }} />
              <YAxis tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151', 
                  color: '#f9fafb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="hirings" fill="#00ce7c" name="Hirings" />
              <Bar dataKey="resignations" fill="#ef4444" name="Resignations" />
              <Line type="monotone" dataKey="net_change" stroke="#3b82f6" strokeWidth={3} name="Net Change" />
            </ComposedChart>
          </ResponsiveContainer>
        </div> */}

        {/* Salary Spending by Department */}
        <div className="nr-card">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Salary Spending by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryData.departments || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="department" tick={{ fill: '#9ca3af' }} />
              <YAxis tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Total Spending']}
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151', 
                  color: '#f9fafb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="total_spending" fill="#00ce7c" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Working Hours by Department */}
        <div className="nr-card">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Working Hours by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workingHoursData?.department_summary || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="department" tick={{ fill: '#9ca3af' }} />
              <YAxis tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'average_hours') return [`${value}h`, 'Average Hours'];
                  if (name === 'total_hours') return [`${value}h`, 'Total Hours'];
                  if (name === 'total_overtime') return [`${value}h`, 'Overtime Hours'];
                  return [value, name];
                }}
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151', 
                  color: '#f9fafb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="average_hours" fill="#3b82f6" name="Average Hours" />
              <Bar dataKey="total_overtime" fill="#f59e0b" name="Overtime Hours" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="nr-card">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Employee Distribution by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData?.departments?.length > 0 ? departmentData.departments : departmentStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ department_name, name, total_employees, count }) => `${department_name || name}: ${total_employees || count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total_employees"
                nameKey="department_name"
              >
                {(departmentData?.departments?.length > 0 ? departmentData.departments : departmentStats).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || departmentStats[index]?.color || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [value, 'Employees']}
                labelFormatter={(label) => `Department: ${label}`}
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151', 
                  color: '#f9fafb',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Employee Report Table */}
      <div className="nr-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-100">Detailed Employee Report</h3>
          
          {/* Table Filters */}
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filter by:</span>
            </div>
            
            <div className="relative">
              <select
                value={tableFilters.department}
                onChange={(e) => updateTableFilters({ department: e.target.value, page: 1 })}
                className="appearance-none bg-gray-800 border border-gray-600 text-gray-100 px-3 py-1 pr-8 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Departments</option>
                {(departmentData?.departments?.length > 0 ? departmentData.departments : departmentStats).map(dept => (
                  <option key={dept.department_id || dept.name} value={dept.department_name || dept.name}>
                    {dept.department_name || dept.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-2 h-3 w-3 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={tableFilters.sort_by}
                onChange={(e) => updateTableFilters({ sort_by: e.target.value, page: 1 })}
                className="appearance-none bg-gray-800 border border-gray-600 text-gray-100 px-3 py-1 pr-8 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="employee_name">Sort by Name</option>
                <option value="total_leaves_taken">Sort by Leaves</option>
                <option value="average_working_hours">Sort by Hours</option>
                <option value="monthly_salary">Sort by Salary</option>
              </select>
              <ChevronDown className="absolute right-2 top-2 h-3 w-3 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={() => updateTableFilters({ 
                sort_order: tableFilters.sort_order === 'asc' ? 'desc' : 'asc',
                page: 1
              })}
              className="p-1 text-gray-400 hover:text-gray-200"
            >
              <TrendingUp className={`h-4 w-4 transform transition-transform ${
                tableFilters.sort_order === 'desc' ? 'rotate-180' : ''
              }`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Leaves Taken
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Avg Working Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Monthly Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Attendance Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {detailedReport.data.length > 0 ? detailedReport.data.map((employee, index) => (
                <tr key={employee.employee_id || index} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {employee.employee_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-100">{employee.employee_name}</div>
                        <div className="text-sm text-gray-400">{employee.position}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                      {employee.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-orange-400 mr-2" />
                      <span className="text-sm text-gray-300">{employee.total_leaves_taken || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Timer className="h-4 w-4 text-blue-400 mr-2" />
                      <span className="text-sm text-gray-300">{employee.average_working_hours || 0}h</span>
                      {employee.overtime_hours > 0 && (
                        <span className="ml-2 text-xs text-yellow-400">+{employee.overtime_hours}h OT</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-newrelic-green mr-2" />
                      <span className="text-sm font-medium text-newrelic-green">
                        ${employee.monthly_salary?.toLocaleString() || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-2 w-16 rounded-full mr-2 ${
                        (employee.attendance_rate || 0) >= 95 ? 'bg-green-400' :
                        (employee.attendance_rate || 0) >= 85 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}>
                        <div 
                          className="h-2 bg-current rounded-full"
                          style={{ width: `${employee.attendance_rate || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-300">{employee.attendance_rate?.toFixed(1) || 0}%</span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No employee data available</p>
                      <p className="text-sm">Try adjusting your filters or check back later</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {detailedReport.pagination && detailedReport.pagination.total_pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((detailedReport.pagination.current_page - 1) * detailedReport.pagination.per_page) + 1} to{' '}
              {Math.min(detailedReport.pagination.current_page * detailedReport.pagination.per_page, detailedReport.pagination.total_records)} of{' '}
              {detailedReport.pagination.total_records} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateTableFilters({ page: Math.max(1, tableFilters.page - 1) })}
                disabled={detailedReport.pagination.current_page <= 1}
                className="px-3 py-1 text-sm bg-gray-800 border border-gray-600 rounded text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-400">
                Page {detailedReport.pagination.current_page} of {detailedReport.pagination.total_pages}
              </span>
              <button
                onClick={() => updateTableFilters({ page: Math.min(detailedReport.pagination.total_pages, tableFilters.page + 1) })}
                disabled={detailedReport.pagination.current_page >= detailedReport.pagination.total_pages}
                className="px-3 py-1 text-sm bg-gray-800 border border-gray-600 rounded text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Error Display */}
      {error && (
        <div className="nr-card border-red-500/20 bg-red-500/10">
          <div className="flex items-center space-x-3 text-red-400">
            <div className="h-8 w-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-medium">Error Loading Analytics</h4>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;