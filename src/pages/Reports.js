import React from 'react';
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
  Line
} from 'recharts';
import { Download, FileText, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import { mockEmployees, departmentStats, salaryRanges, monthlyAttendance } from '../data/mockData';

const Reports = () => {
  // Employee statistics
  const totalEmployees = mockEmployees.length;
  const presentToday = Math.floor(totalEmployees * 0.95); // 95% attendance
  const onLeave = Math.floor(totalEmployees * 0.08); // 8% on leave
  const avgSatisfaction = 87; // Mock satisfaction score
  const averageSalary = Math.round(mockEmployees.reduce((sum, emp) => sum + emp.salary, 0) / mockEmployees.length);
  const highestSalary = Math.max(...mockEmployees.map(emp => emp.salary));

  // Department salary comparison
  const departmentSalaries = departmentStats.map(dept => {
    const deptEmployees = mockEmployees.filter(emp => emp.department === dept.name);
    const avgSalary = deptEmployees.length > 0 
      ? Math.round(deptEmployees.reduce((sum, emp) => sum + emp.salary, 0) / deptEmployees.length)
      : 0;
    return {
      department: dept.name,
      avgSalary,
      count: dept.count
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 gradient-text">Reports & Analytics</h1>
          <p className="text-gray-400 mt-2">Comprehensive insights into your organization</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button className="nr-btn-primary inline-flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
          <button className="nr-btn-secondary inline-flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">Total Employees</p>
              <p className="nr-metric-value text-blue-400">{totalEmployees}</p>
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
              <p className="nr-metric-value text-newrelic-green">{presentToday}</p>
            </div>
            <div className="p-3 bg-newrelic-green/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-newrelic-green" />
            </div>
          </div>
        </div>

        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">On Leave</p>
              <p className="nr-metric-value text-orange-400">{onLeave}</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Clock className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">Avg Satisfaction</p>
              <p className="nr-metric-value text-purple-400">{avgSatisfaction}%</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">Average Salary</p>
              <p className="nr-metric-value text-newrelic-green">${averageSalary.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-newrelic-green/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-newrelic-green" />
            </div>
          </div>
        </div>

        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">Highest Salary</p>
              <p className="nr-metric-value text-purple-400">${highestSalary.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">Departments</p>
              <p className="nr-metric-value text-orange-400">{departmentStats.length}</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <FileText className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="nr-card">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Employee Distribution by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {departmentStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
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

        {/* Salary Distribution */}
        <div className="nr-card">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Salary Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryRanges}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" tick={{ fill: '#9ca3af' }} />
              <YAxis tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151', 
                  color: '#f9fafb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#00ce7c" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Average Salaries */}
        <div className="nr-card">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Average Salary by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentSalaries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="department" tick={{ fill: '#9ca3af' }} />
              <YAxis tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Average Salary']}
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151', 
                  color: '#f9fafb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="avgSalary" fill="#00ce7c" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Trend */}
        <div className="nr-card">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Monthly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyAttendance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
              <YAxis tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151', 
                  color: '#f9fafb',
                  borderRadius: '8px'
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

      {/* Summary Table */}
      <div className="nr-card">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Department Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Avg Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {departmentSalaries.map((dept, index) => {
                const totalCost = dept.avgSalary * dept.count;
                return (
                  <tr key={index} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="h-3 w-3 rounded-full mr-3"
                          style={{ backgroundColor: departmentStats.find(d => d.name === dept.department)?.color }}
                        ></div>
                        <div className="text-sm font-medium text-gray-100">{dept.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {dept.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-newrelic-green font-medium">
                      ${dept.avgSalary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      ${totalCost.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;