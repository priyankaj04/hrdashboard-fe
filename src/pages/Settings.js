import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Palette } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-100 gradient-text">Settings</h1>
        <p className="text-gray-400 mt-2">Manage your application preferences and configurations</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="nr-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-newrelic-green/20 rounded-lg">
              <User className="h-5 w-5 text-newrelic-green" />
            </div>
            <h3 className="text-lg font-semibold text-gray-100">Profile Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                className="nr-input"
                defaultValue="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                className="nr-input"
                defaultValue="john@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                className="nr-input"
                defaultValue="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="nr-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Bell className="h-5 w-5 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-100">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-100">Email Notifications</p>
                <p className="text-sm text-gray-400">Receive notifications via email</p>
              </div>
              <input type="checkbox" className="w-12 h-6 bg-gray-700 rounded-full relative appearance-none cursor-pointer checked:bg-newrelic-green transition-colors" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-100">Leave Requests</p>
                <p className="text-sm text-gray-400">Notify about new leave requests</p>
              </div>
              <input type="checkbox" className="w-12 h-6 bg-gray-700 rounded-full relative appearance-none cursor-pointer checked:bg-newrelic-green transition-colors" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-100">Attendance Alerts</p>
                <p className="text-sm text-gray-400">Alert for attendance issues</p>
              </div>
              <input type="checkbox" className="w-12 h-6 bg-gray-700 rounded-full relative appearance-none cursor-pointer checked:bg-newrelic-green transition-colors" />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="nr-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-100">Security</h3>
          </div>
          
          <div className="space-y-4">
            <button className="w-full text-left p-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
              <p className="font-medium text-gray-100">Change Password</p>
              <p className="text-sm text-gray-400">Update your account password</p>
            </button>
            <button className="w-full text-left p-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
              <p className="font-medium text-gray-100">Two-Factor Authentication</p>
              <p className="text-sm text-gray-400">Add an extra layer of security</p>
            </button>
            <button className="w-full text-left p-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
              <p className="font-medium text-gray-100">Login History</p>
              <p className="text-sm text-gray-400">View recent login activity</p>
            </button>
          </div>
        </div>

        {/* System Settings */}
        <div className="nr-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Database className="h-5 w-5 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-100">System</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
              <select className="nr-input">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
              <select className="nr-input">
                <option value="EST">Eastern Time (EST)</option>
                <option value="PST">Pacific Time (PST)</option>
                <option value="CST">Central Time (CST)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date Format</label>
              <select className="nr-input">
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="nr-btn-primary">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;