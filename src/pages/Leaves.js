import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Check, 
  X, 
  Clock, 
  Filter,
  User,
  FileText,
  AlertCircle
} from 'lucide-react';
import { mockLeaves, mockEmployees, LeaveRequest } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';

const Leaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState(mockLeaves);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  // New leave request form state
  const [newLeave, setNewLeave] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Filter leaves based on user role and filters
  const filteredLeaves = leaves.filter(leave => {
    // If employee, only show their leaves
    if (user?.role === 'employee' && leave.employeeId !== user.id) {
      return false;
    }
    
    const matchesStatus = filterStatus === '' || leave.status === filterStatus;
    const matchesType = filterType === '' || leave.type === filterType;
    
    return matchesStatus && matchesType;
  });

  const handleApproveLeave = (leaveId) => {
    setLeaves(leaves.map(leave => 
      leave.id === leaveId ? { ...leave, status: 'approved' } : leave
    ));
  };

  const handleRejectLeave = (leaveId) => {
    setLeaves(leaves.map(leave => 
      leave.id === leaveId ? { ...leave, status: 'rejected' } : leave
    ));
  };

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    const startDate = new Date(newLeave.startDate);
    const endDate = new Date(newLeave.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const leave = {
      id: (leaves.length + 1).toString(),
      employeeId: user?.id || '3',
      type: newLeave.type,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      days,
      reason: newLeave.reason,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    setLeaves([...leaves, leave]);
    setNewLeave({ type: '', startDate: '', endDate: '', reason: '' });
    setShowRequestModal(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'nr-badge-success';
      case 'rejected':
        return 'nr-badge-danger';
      case 'pending':
        return 'nr-badge-warning';
      default:
        return 'nr-badge-info';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <Check className="h-4 w-4 text-primary-400" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sick':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'vacation':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'personal':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'maternity':
      case 'paternity':
        return <FileText className="h-4 w-4 text-pink-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  // Calculate leave stats
  const pendingCount = leaves.filter(l => l.status === 'pending').length;
  const approvedCount = leaves.filter(l => l.status === 'approved').length;
  const totalDaysRequested = leaves.reduce((sum, l) => sum + l.days, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 gradient-text">Leave Management</h1>
          <p className="text-gray-400 mt-2">
            {user?.role === 'employee' ? 'Manage your leave requests' : 'Review and manage leave requests'}
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="nr-btn-primary mt-4 md:mt-0 inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Request Leave
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">Pending Requests</p>
              <p className="nr-metric-value text-orange-400">{pendingCount}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-newrelic">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">Approved Leaves</p>
              <p className="nr-metric-value text-primary-400">{approvedCount}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-newrelic">
              <Check className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">Total Days</p>
              <p className="nr-metric-value text-blue-400">{totalDaysRequested}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-newrelic">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="nr-metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="nr-metric-label">Available Days</p>
              <p className="nr-metric-value text-purple-400">25</p>
              <p className="text-xs text-gray-500 mt-1">Remaining</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-newrelic">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="nr-card">
        <div className="nr-card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
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
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="nr-select block w-full"
              >
                <option value="">All Types</option>
                <option value="sick">Sick Leave</option>
                <option value="vacation">Vacation</option>
                <option value="personal">Personal</option>
                <option value="maternity">Maternity</option>
                <option value="paternity">Paternity</option>
              </select>
            </div>

            <div className="flex items-end">
              <span className="text-sm text-gray-400">
                Showing {filteredLeaves.length} of {leaves.length} requests
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests */}
      <div className="nr-card">
        <div className="nr-card-header">
          <h3 className="text-lg font-semibold text-gray-100">Leave Requests</h3>
        </div>
        <div className="nr-card-body">
          <div className="space-y-4">
            {filteredLeaves.map((leave) => {
              const employee = mockEmployees.find(emp => emp.id === leave.employeeId);
              if (!employee) return null;

              return (
                <div key={leave.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800 hover:bg-gray-750 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-newrelic">
                        <span className="text-white font-medium text-sm">
                          {employee.name.charAt(0)}
                        </span>
                      </div>
                    
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-100">{employee.name}</h4>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-400">{employee.department}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(leave.type)}
                            <span className="capitalize">{leave.type.replace('-', ' ')} Leave</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{leave.days} day{leave.days > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-300 mb-2">{leave.reason}</p>
                        <p className="text-xs text-gray-500">Applied on {new Date(leave.appliedDate).toLocaleDateString()}</p>
                      </div>
                  </div>
                  
                    <div className="flex items-center space-x-3">
                      <span className={`nr-badge ${getStatusBadge(leave.status)}`}>
                        {getStatusIcon(leave.status)}
                        <span className="ml-1 capitalize">{leave.status}</span>
                      </span>
                      
                      {user?.role !== 'employee' && leave.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApproveLeave(leave.id)}
                            className="p-2 text-primary-400 hover:bg-primary-900 hover:text-primary-300 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectLeave(leave.id)}
                            className="p-2 text-red-400 hover:bg-red-900 hover:text-red-300 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leave Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="nr-card max-w-lg w-full shadow-dark-lg">
            <div className="nr-card-header">
              <h2 className="text-xl font-semibold text-gray-100">Request Leave</h2>
            </div>
            <div className="nr-card-body">
              <form onSubmit={handleSubmitLeave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Leave Type</label>
                  <select
                    value={newLeave.type}
                    onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
                    className="nr-select block w-full"
                    required
                  >
                    <option value="">Select leave type</option>
                    <option value="sick">Sick Leave</option>
                    <option value="vacation">Vacation</option>
                    <option value="personal">Personal Leave</option>
                    <option value="maternity">Maternity Leave</option>
                    <option value="paternity">Paternity Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={newLeave.startDate}
                      onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                      className="nr-input block w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                    <input
                      type="date"
                      value={newLeave.endDate}
                      onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                      className="nr-input block w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
                  <textarea
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                    rows={3}
                    className="nr-input block w-full"
                    placeholder="Please provide a reason for your leave request..."
                    required
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
    </div>
  );
};

export default Leaves;