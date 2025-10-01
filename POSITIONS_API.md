# Positions API Integration

This document describes the positions API endpoints that have been integrated into the HR Dashboard application.

## API Endpoints

### 1. Get All Positions
```
GET /api/positions
```
**Description**: Retrieve all available positions in the system.

**Response**: Array of position objects with the following structure:
```json
{
  "id": "string",
  "title": "string",
  "department_id": "string",
  "department_name": "string",
  "description": "string",
  "requirements": ["string"],
  "min_salary": number,
  "max_salary": number,
  "employment_type": "full-time|part-time|contract|internship",
  "level": "junior|mid|senior|lead",
  "is_active": boolean,
  "created_at": "ISO date string"
}
```

### 2. Get Positions by Department
```
GET /api/positions/department/:departmentId
```
**Description**: Retrieve all positions for a specific department.

**Parameters**:
- `departmentId`: The UUID of the department

**Example**:
```
GET /api/positions/department/f13e9674-2288-4a26-82ee-16b769f445d4
```

### 3. Search Positions
```
GET /api/positions/search?q=engineer
```
**Description**: Search for positions by title or description.

**Query Parameters**:
- `q`: Search query string

**Example**:
```
GET /api/positions/search?q=engineer
```

### 4. Filter by Salary Range
```
GET /api/positions/salary-range?min_salary=80000&max_salary=120000
```
**Description**: Filter positions by salary range.

**Query Parameters**:
- `min_salary`: Minimum salary (number)
- `max_salary`: Maximum salary (number)

**Example**:
```
GET /api/positions/salary-range?min_salary=80000&max_salary=120000
```

## Frontend Integration

### API Service Integration

The positions API endpoints have been integrated into the `apiService` object in `src/services/api.js`:

```javascript
positions: {
  getAll: () => apiRequest('/api/positions'),
  getByDepartment: (departmentId) => apiRequest(`/api/positions/department/${departmentId}`),
  search: (query) => apiRequest(`/api/positions/search?q=${encodeURIComponent(query)}`),
  getBySalaryRange: (minSalary, maxSalary) => apiRequest(`/api/positions/salary-range?min_salary=${minSalary}&max_salary=${maxSalary}`),
  // Standard CRUD operations also available
  getOne: (id) => apiRequest(`/api/positions/${id}`),
  create: (data) => apiRequest('/api/positions', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/api/positions/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiRequest(`/api/positions/${id}`, { method: 'DELETE' })
}
```

### Employee Management Integration

The positions API has been integrated into the employee management system:

1. **Data Loading**: The `Employees` component now loads positions data alongside employees and departments
2. **Form Integration**: The employee form filters positions based on selected department
3. **Utility Functions**: Helper functions for fetching positions by department, searching, and salary filtering

### Dedicated Positions Page

A new `Positions` page (`src/pages/Positions.js`) has been created that demonstrates all the positions API functionality:

#### Features:
- **Search Functionality**: Real-time search by position title or description
- **Department Filtering**: Filter positions by department
- **Salary Range Filtering**: Filter positions by minimum and maximum salary
- **Position Details**: View comprehensive position information
- **Responsive Design**: Grid layout that adapts to screen size
- **Error Handling**: Graceful fallbacks to mock data when API is unavailable

#### Navigation:
- Added to sidebar navigation with briefcase icon
- Available at `/positions` route
- Role-based access (HR and Admin only)

### Mock Data

Mock positions data has been added to `src/data/mockData.js` to provide fallback data when the API is unavailable. The mock data includes:

- 8 sample positions across different departments
- Realistic salary ranges and requirements
- Various employment types and experience levels
- Department associations

### Error Handling

The implementation includes comprehensive error handling:

1. **API Fallbacks**: If API calls fail, the system falls back to mock data
2. **Search Fallbacks**: If API search fails, client-side filtering is used
3. **User Feedback**: Loading states and error messages inform users of system status
4. **Graceful Degradation**: The system remains functional even when the backend is unavailable

## Usage Examples

### Basic Position Search
```javascript
// Search for engineering positions
const results = await apiService.positions.search('engineer');
```

### Department-Specific Positions
```javascript
// Get all positions for Engineering department
const engineeringPositions = await apiService.positions.getByDepartment('eng-dept-id');
```

### Salary Range Filtering
```javascript
// Find positions with salary between $80k-$120k
const midRangePositions = await apiService.positions.getBySalaryRange(80000, 120000);
```

### Integration in Employee Forms
```javascript
// Filter positions when department changes
const handleDepartmentChange = async (departmentId) => {
  const departmentPositions = await fetchPositionsByDepartment(departmentId);
  setFilteredPositions(departmentPositions);
};
```

## Benefits

1. **Enhanced Employee Management**: Better position selection in employee forms
2. **Dedicated Position Management**: Comprehensive position management interface
3. **Advanced Filtering**: Multiple ways to find and filter positions
4. **Improved User Experience**: Real-time search and filtering capabilities
5. **Scalable Architecture**: Clean API integration that can easily be extended
6. **Robust Error Handling**: System remains functional even with API issues

The positions API integration provides a solid foundation for managing job positions within the HR system and enhances the overall employee management workflow.