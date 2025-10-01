import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp,
  UserCheck,
  UserX,
  AlertCircle,
  Loader
} from 'lucide-react';
import apiService from '../services/api';
import { 
  mockEmployees, 
  mockAttendance, 
  mockLeaves, 
  departmentStats,
  salaryRanges,
  monthlyAttendance 
} from '../data/mockData';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    employees: [],
    attendance: [],
    departments: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null }));
        
        const [employeesResponse, attendanceResponse, departmentsResponse] = await Promise.all([
          apiService.employees.getAll().catch(() => ({ data: mockEmployees })),
          apiService.attendance.getAll({ 
            date: new Date().toISOString().split('T')[0] 
          }).catch(() => ({ data: mockAttendance })),
          apiService.departments.getAll().catch(() => ({ data: departmentStats }))
        ]);

        setDashboardData({
          employees: employeesResponse.data || employeesResponse || mockEmployees,
          attendance: attendanceResponse.data || attendanceResponse || mockAttendance,
          departments: departmentsResponse.data || departmentsResponse || departmentStats,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setDashboardData({
          employees: mockEmployees,
          attendance: mockAttendance,
          departments: departmentStats,
          loading: false,
          error: 'Failed to load dashboard data. Showing demo data.'
        });
      }
    };

    fetchDashboardData();
  }, []);

  const { employees, attendance, departments, loading, error } = dashboardData;

  // Calculate statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active' || emp.employment_status === 'active').length;
  const todayAttendance = attendance.filter(att => att.date === new Date().toISOString().split('T')[0]);
  const presentToday = todayAttendance.filter(att => att.status === 'present' || att.status === 'late').length;
  const pendingLeaves = mockLeaves.filter(leave => leave.status === 'pending').length;
  const averageSalary = employees.length > 0 ? Math.round(employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.length) : 0;

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="nr-metric">
      <div className="flex items-center justify-between">
        <div>
          <p className="nr-metric-label">{title}</p>
          <p className="nr-metric-value">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} shadow-newrelic`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const recentActivities = [
    {
      id: 1,
      type: 'leave_request',
      message: 'Mike Employee submitted a vacation leave request',
      time: '2 hours ago',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'new_employee',
      message: 'Alex Rodriguez joined the Sales team',
      time: '1 day ago',
      icon: Users,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'attendance',
      message: 'David Wilson marked late attendance',
      time: '2 days ago',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      id: 4,
      type: 'leave_approved',
      message: 'Emily Johnson\'s sick leave was approved',
      time: '3 days ago',
      icon: UserCheck,
      color: 'text-green-600'
    }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 gradient-text">Dashboard</h1>
          <p className="text-gray-400 mt-2">Loading your dashboard...</p>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-newrelic-green mx-auto mb-4" />
            <p className="text-gray-400">Fetching dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 gradient-text">Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome back! Here's what's happening at your company.</p>
        {error && (
          <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-yellow-400 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle={`${activeEmployees} active`}
        />
        <StatCard
          title="Present Today"
          value={`${presentToday}/${totalEmployees}`}
          icon={UserCheck}
          color="bg-gradient-to-br from-primary-500 to-primary-600"
          subtitle={`${Math.round((presentToday / totalEmployees) * 100)}% attendance`}
        />
        <StatCard
          title="Pending Leaves"
          value={pendingLeaves}
          icon={Calendar}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          subtitle="Require approval"
        />
        <StatCard
          title="Avg. Salary"
          value={`$${averageSalary.toLocaleString()}`}
          icon={TrendingUp}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          subtitle="Per employee"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="nr-card">
          <div className="nr-card-header">
            <h3 className="text-lg font-semibold text-gray-100">Department Distribution</h3>
          </div>
          <div className="nr-card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#00ce7c"
                  dataKey="count"
                >
                  {departmentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Attendance Trend */}
        <div className="nr-card">
          <div className="nr-card-header">
            <h3 className="text-lg font-semibold text-gray-100">Monthly Attendance Trend</h3>
          </div>
          <div className="nr-card-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="present" 
                  stroke="#00ce7c" 
                  strokeWidth={3}
                  name="Present %"
                />
                <Line 
                  type="monotone" 
                  dataKey="absent" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="Absent %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Salary Distribution */}
        <div className="nr-card">
          <div className="nr-card-header">
            <h3 className="text-lg font-semibold text-gray-100">Salary Distribution</h3>
          </div>
          <div className="nr-card-body">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salaryRanges}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="range" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
                <Bar dataKey="count" fill="#00ce7c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 nr-card">
          <div className="nr-card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-100">Recent Activities</h3>
              <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors">View All</button>
            </div>
          </div>
          <div className="nr-card-body">
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                    <div className={`p-2 rounded-lg bg-gray-700`}>
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-100">{activity.message}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="nr-card">
        <div className="nr-card-header">
          <h3 className="text-lg font-semibold text-gray-100">Quick Actions</h3>
        </div>
        <div className="nr-card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="nr-btn-secondary flex items-center space-x-3 p-4 justify-start group">
              <Users className="h-5 w-5 text-primary-400 group-hover:text-primary-300" />
              <span className="text-sm font-medium">Add New Employee</span>
            </button>
            <button className="nr-btn-secondary flex items-center space-x-3 p-4 justify-start group">
              <Calendar className="h-5 w-5 text-primary-400 group-hover:text-primary-300" />
              <span className="text-sm font-medium">Process Leave Requests</span>
            </button>
            <button className="nr-btn-secondary flex items-center space-x-3 p-4 justify-start group">
              <Clock className="h-5 w-5 text-primary-400 group-hover:text-primary-300" />
              <span className="text-sm font-medium">View Attendance Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;