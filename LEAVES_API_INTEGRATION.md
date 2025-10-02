# Leaves API Integration Documentation

## Overview
This document outlines the complete API integration for the Leave Management system. The frontend `Leaves.js` component now uses real API calls instead of mock data.

## API Endpoints Implemented

### 1. Get Leave Requests
**Endpoint:** `GET /api/leaves`
**Purpose:** Retrieve leave requests with filtering and pagination

**Query Parameters:**
- `employee_id` (string, optional): Filter by specific employee
- `status` (string, optional): Filter by status (pending, approved, rejected, all)
- `type` (string, optional): Filter by leave type
- `start_date` (string, optional): Filter from date (YYYY-MM-DD)
- `end_date` (string, optional): Filter to date (YYYY-MM-DD)
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "leaves": [
      {
        "id": "1",
        "employee_id": "emp123",
        "type": "vacation",
        "start_date": "2024-01-15",
        "end_date": "2024-01-17",
        "total_days": 3,
        "reason": "Family vacation",
        "status": "pending",
        "applied_date": "2024-01-10",
        "approved_by": null,
        "approved_date": null,
        "rejection_reason": null,
        "emergency_contact": "John Doe - 555-1234",
        "handover_notes": "Tasks assigned to Jane",
        "created_at": "2024-01-10T09:00:00Z",
        "updated_at": "2024-01-10T09:00:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "pages": 3
  }
}
```

### 2. Create Leave Request
**Endpoint:** `POST /api/leaves`
**Purpose:** Submit a new leave request

**Request Body:**
```json
{
  "employee_id": "emp123",
  "type": "vacation",
  "start_date": "2024-01-15",
  "end_date": "2024-01-17",
  "reason": "Family vacation",
  "emergency_contact": "John Doe - 555-1234",
  "handover_notes": "Tasks assigned to Jane"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "id": "123",
    "employee_id": "emp123",
    "type": "vacation",
    "start_date": "2024-01-15",
    "end_date": "2024-01-17",
    "days": 3,
    "reason": "Family vacation",
    "status": "pending",
    "applied_date": "2024-01-10",
    "created_at": "2024-01-10T09:00:00Z"
  }
}
```

### 3. Update Leave Status (Approve/Reject)
**Endpoint:** `PUT /api/leaves/:id/status`
**Purpose:** Approve or reject leave requests (Admin/HR/Manager only)

**Request Body:**
```json
{
  "status": "approved", // or "rejected"
  "comments": "Approved for the requested dates"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave request approved successfully",
  "data": {
    "id": "123",
    "status": "approved",
    "approved_by": "John Manager",
    "approved_date": "2024-01-12T10:30:00Z",
    "comments": "Approved for the requested dates"
  }
}
```

### 4. Get Leave Statistics
**Endpoint:** `GET /api/leaves/statistics`
**Purpose:** Get leave statistics for dashboard

**Query Parameters:**
- `employee_id` (string, optional): Filter by employee
- `department_id` (string, optional): Filter by department
- `year` (number, optional): Filter by year
- `month` (number, optional): Filter by month (1-12)

**Response:**
```json
{
  "success": true,
  "data": {
    "pending_count": 5,
    "approved_count": 12,
    "rejected_count": 2,
    "total_days_used": 45,
    "total_requests": 19,
    "average_days_per_request": 2.4,
    "by_type": {
      "vacation": { "count": 8, "days": 24 },
      "sick": { "count": 6, "days": 12 },
      "personal": { "count": 5, "days": 9 }
    }
  }
}
```

### 5. Get Employee Leave Balance
**Endpoint:** `GET /api/leaves/balance/:employee_id`
**Purpose:** Get leave balance for an employee

**Query Parameters:**
- `year` (number, optional): Year for balance calculation

**Response:**
```json
{
  "success": true,
  "data": {
    "employee_id": "emp123",
    "leave_types": {
      "vacation": {
        "allocated": 25,
        "used": 15,
        "pending": 3,
        "remaining": 7
      },
      "sick": {
        "allocated": 12,
        "used": 4,
        "pending": 0,
        "remaining": 8
      }
    },
    "total_days": {
      "allocated": 37,
      "used": 19,
      "pending": 3,
      "remaining": 15
    }
  }
}
```

### 6. Update Leave Request
**Endpoint:** `PUT /api/leaves/:id`
**Purpose:** Update pending leave request details

**Request Body:**
```json
{
  "type": "vacation",
  "start_date": "2024-01-16",
  "end_date": "2024-01-18",
  "reason": "Updated family vacation",
  "emergency_contact": "Jane Doe - 555-5678",
  "handover_notes": "Updated handover notes"
}
```

### 7. Cancel Leave Request
**Endpoint:** `DELETE /api/leaves/:id`
**Purpose:** Cancel pending leave request

**Response:**
```json
{
  "success": true,
  "message": "Leave request cancelled successfully"
}
```

### 8. Get Leave Calendar
**Endpoint:** `GET /api/leaves/calendar`
**Purpose:** Get calendar view of leaves

**Query Parameters:**
- `start_date` (string, required): Calendar start date (YYYY-MM-DD)
- `end_date` (string, required): Calendar end date (YYYY-MM-DD)
- `department_id` (string, optional): Filter by department
- `employee_id` (string, optional): Filter by employee

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "leaves": [
        {
          "employee_id": "emp123",
          "employee_name": "John Doe",
          "type": "vacation",
          "status": "approved"
        }
      ]
    }
  ]
}
```

### 9. Get Leave Types
**Endpoint:** `GET /api/leaves/types`
**Purpose:** Get all available leave types

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "vacation",
      "name": "Vacation Leave",
      "max_days": 25,
      "color": "#4F46E5",
      "requires_approval": true,
      "description": "Annual vacation days"
    },
    {
      "id": "sick",
      "name": "Sick Leave",
      "max_days": 12,
      "color": "#EF4444",
      "requires_approval": false,
      "description": "Medical leave"
    }
  ]
}
```

### 10. Bulk Action Leave Requests
**Endpoint:** `POST /api/leaves/bulk-action`
**Purpose:** Bulk approve or reject multiple leave requests (Admin/HR/Manager only)

**Request Body:**
```json
{
  "action": "approve", // or "reject"
  "leave_ids": ["123", "124", "125"],
  "comments": "Bulk approval for Q1 leaves"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk action completed",
  "data": {
    "processed": 3,
    "successful": 3,
    "failed": 0,
    "results": [
      { "id": "123", "status": "success" },
      { "id": "124", "status": "success" },
      { "id": "125", "status": "success" }
    ]
  }
}
```

## Frontend Integration Features

### 1. Real-time Data Loading
- Loads leave requests, statistics, types, and balance on component mount
- Refreshes data when filters change
- Loading states with spinner indicators

### 2. Form Enhancement
- Dynamic leave types from API
- Additional fields: emergency contact, handover notes
- Real-time validation and error handling

### 3. Role-based Access Control
- Employees see only their leaves
- Admin/HR/Manager can see and manage all leaves
- Conditional UI elements based on permissions

### 4. Enhanced UX Features
- Pagination with API support
- Real-time statistics updates
- Contextual success/error messages
- Confirmation dialogs for actions

### 5. Error Handling
- Graceful fallback to mock data during development
- User-friendly error messages
- Network error recovery

## API Service Integration

The `apiService.leaves` object provides all the necessary methods:

```javascript
// Get leaves with filters
const leaves = await apiService.leaves.getAll({
  status: 'pending',
  type: 'vacation',
  page: 1,
  limit: 10
});

// Create leave request
const newLeave = await apiService.leaves.create({
  employee_id: user.id,
  type: 'vacation',
  start_date: '2024-01-15',
  end_date: '2024-01-17',
  reason: 'Family vacation'
});

// Approve/Reject leave
const result = await apiService.leaves.updateStatus(leaveId, 'approved', 'Looks good!');

// Get statistics
const stats = await apiService.leaves.getStatistics();

// Get leave balance
const balance = await apiService.leaves.getBalance(employeeId);
```

## Authentication & Authorization

All endpoints require authentication via Bearer token. Role-based access control is implemented:

- **Employee**: Can view/create/update their own leaves
- **Admin/HR/Manager**: Can view/manage all leaves, approve/reject requests
- **System**: Automatic role validation on backend

## Error Responses

Standard error format:
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid input data
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Data conflict (e.g., overlapping leaves)
- `SERVER_ERROR`: Internal server error

This comprehensive integration provides a robust, scalable leave management system with full API connectivity and enhanced user experience.