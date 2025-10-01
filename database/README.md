# HR Dashboard Database Documentation

## 📋 Overview

This documentation describes the complete database structure for the HR Dashboard application designed for Supabase. The database includes 19 core tables with relationships, indexes, triggers, and Row Level Security (RLS) policies.

## 🗄️ Database Architecture

### Core Entities
- **Users & Authentication**: User accounts with role-based access
- **Employee Management**: Complete employee profiles and organizational structure
- **Attendance Tracking**: Daily attendance records and work schedules
- **Leave Management**: Leave types, balances, and approval workflows
- **Payroll System**: Salary history and payroll processing
- **Performance**: Employee reviews and training records
- **System**: Configuration, notifications, and audit trails

---

## 📊 Table Structure

### 1. **users** - Authentication & Core User Data
Primary table for user authentication and role management.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (UUID) |
| email | VARCHAR(255) | Unique email address |
| password_hash | VARCHAR(255) | Encrypted password |
| role | VARCHAR(50) | User role (admin, hr, manager, employee) |
| is_active | BOOLEAN | Account status |
| created_at | TIMESTAMP | Account creation date |
| updated_at | TIMESTAMP | Last update timestamp |
| last_login | TIMESTAMP | Last login timestamp |

**Constraints:**
- `valid_role`: role IN ('admin', 'hr', 'manager', 'employee')

---

### 2. **departments** - Organizational Departments
Organizational structure and department management.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(100) | Department name (unique) |
| description | TEXT | Department description |
| manager_id | UUID | Foreign key to users (department manager) |
| budget | DECIMAL(15,2) | Department budget |
| color | VARCHAR(7) | UI theme color (hex) |
| is_active | BOOLEAN | Department status |

**Relationships:**
- `manager_id` → `users.id`

---

### 3. **positions** - Job Positions
Job titles and position definitions within departments.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR(100) | Position title |
| department_id | UUID | Foreign key to departments |
| description | TEXT | Position description |
| min_salary | DECIMAL(10,2) | Minimum salary for position |
| max_salary | DECIMAL(10,2) | Maximum salary for position |
| requirements | TEXT[] | Array of position requirements |
| is_active | BOOLEAN | Position status |

**Relationships:**
- `department_id` → `departments.id`

**Constraints:**
- Unique constraint on (`title`, `department_id`)

---

### 4. **employees** - Main Employee Information
Complete employee profiles with personal and employment details.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| employee_id | VARCHAR(20) | Company employee ID (unique) |
| first_name | VARCHAR(50) | Employee first name |
| last_name | VARCHAR(50) | Employee last name |
| date_of_birth | DATE | Date of birth |
| gender | VARCHAR(20) | Gender |
| phone | VARCHAR(20) | Phone number |
| personal_email | VARCHAR(255) | Personal email |
| address | TEXT | Home address |
| city | VARCHAR(100) | City |
| state | VARCHAR(100) | State/Province |
| postal_code | VARCHAR(20) | ZIP/Postal code |
| country | VARCHAR(100) | Country (default: 'United States') |
| department_id | UUID | Foreign key to departments |
| position_id | UUID | Foreign key to positions |
| manager_id | UUID | Foreign key to employees (self-reference) |
| hire_date | DATE | Date of hire |
| termination_date | DATE | Termination date (if applicable) |
| employment_status | VARCHAR(20) | Employment status |
| employment_type | VARCHAR(20) | Employment type |
| salary | DECIMAL(10,2) | Current salary |
| salary_type | VARCHAR(20) | Salary type (annual, monthly, etc.) |
| currency | VARCHAR(3) | Currency code (default: 'USD') |
| ssn | VARCHAR(15) | Social Security Number (encrypted) |
| tax_id | VARCHAR(20) | Tax ID |
| bank_account_number | VARCHAR(50) | Bank account (encrypted) |
| routing_number | VARCHAR(20) | Bank routing number |

**Relationships:**
- `user_id` → `users.id`
- `department_id` → `departments.id`
- `position_id` → `positions.id`
- `manager_id` → `employees.id` (self-reference)

**Constraints:**
- `valid_employment_status`: status IN ('active', 'inactive', 'terminated', 'on_leave')
- `valid_employment_type`: type IN ('full-time', 'part-time', 'contract', 'intern')
- `valid_salary_type`: type IN ('annual', 'monthly', 'weekly', 'hourly')
- `valid_gender`: gender IN ('male', 'female', 'other', 'prefer_not_to_say')

---

### 5. **emergency_contacts** - Employee Emergency Contacts
Emergency contact information for employees.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | Foreign key to employees |
| name | VARCHAR(100) | Contact name |
| relationship | VARCHAR(50) | Relationship to employee |
| phone | VARCHAR(20) | Contact phone number |
| email | VARCHAR(255) | Contact email |
| address | TEXT | Contact address |
| is_primary | BOOLEAN | Primary emergency contact flag |

**Relationships:**
- `employee_id` → `employees.id`

---

### 6. **attendance_records** - Daily Attendance Tracking
Daily attendance records with check-in/out times.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | Foreign key to employees |
| date | DATE | Attendance date |
| check_in | TIME | Check-in time |
| check_out | TIME | Check-out time |
| break_start | TIME | Break start time |
| break_end | TIME | Break end time |
| total_hours | DECIMAL(4,2) | Total hours worked |
| overtime_hours | DECIMAL(4,2) | Overtime hours |
| status | VARCHAR(20) | Attendance status |
| notes | TEXT | Additional notes |
| location | VARCHAR(100) | Work location |
| ip_address | INET | IP address for remote work tracking |

**Relationships:**
- `employee_id` → `employees.id`

**Constraints:**
- `valid_attendance_status`: status IN ('present', 'absent', 'late', 'half-day', 'sick', 'vacation', 'holiday')
- Unique constraint on (`employee_id`, `date`)

---

### 7. **work_schedules** - Employee Work Schedules
Flexible work schedule definitions for employees.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | Foreign key to employees |
| day_of_week | INTEGER | Day of week (0=Sunday, 6=Saturday) |
| start_time | TIME | Work start time |
| end_time | TIME | Work end time |
| break_duration | INTEGER | Break duration in minutes |
| is_working_day | BOOLEAN | Is this a working day |
| effective_from | DATE | Schedule effective start date |
| effective_to | DATE | Schedule effective end date |

**Relationships:**
- `employee_id` → `employees.id`

**Constraints:**
- `valid_day_of_week`: day_of_week >= 0 AND day_of_week <= 6

---

### 8. **leave_types** - Leave Type Definitions
Configurable leave types with policies.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(50) | Leave type name (unique) |
| description | TEXT | Leave type description |
| max_days_per_year | INTEGER | Maximum days allowed per year |
| carry_forward_allowed | BOOLEAN | Can unused days be carried forward |
| max_carry_forward_days | INTEGER | Maximum carry forward days |
| requires_approval | BOOLEAN | Requires manager approval |
| advance_notice_days | INTEGER | Required advance notice days |
| is_paid | BOOLEAN | Is this paid leave |
| color | VARCHAR(7) | UI theme color |
| is_active | BOOLEAN | Leave type status |

---

### 9. **employee_leave_balances** - Employee Leave Balances
Annual leave balance tracking per employee and leave type.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | Foreign key to employees |
| leave_type_id | UUID | Foreign key to leave_types |
| year | INTEGER | Calendar year |
| allocated_days | DECIMAL(4,1) | Days allocated for the year |
| used_days | DECIMAL(4,1) | Days already used |
| pending_days | DECIMAL(4,1) | Days in pending requests |
| carried_forward_days | DECIMAL(4,1) | Days carried from previous year |

**Relationships:**
- `employee_id` → `employees.id`
- `leave_type_id` → `leave_types.id`

**Constraints:**
- Unique constraint on (`employee_id`, `leave_type_id`, `year`)

---

### 10. **leave_requests** - Leave Request Management
Leave requests with approval workflow.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | Foreign key to employees |
| leave_type_id | UUID | Foreign key to leave_types |
| start_date | DATE | Leave start date |
| end_date | DATE | Leave end date |
| total_days | DECIMAL(4,1) | Total days requested |
| reason | TEXT | Reason for leave |
| status | VARCHAR(20) | Request status |
| applied_date | TIMESTAMP | Date request was submitted |
| approver_id | UUID | Foreign key to employees (approver) |
| approved_date | TIMESTAMP | Date request was approved |
| rejection_reason | TEXT | Reason for rejection |
| is_half_day | BOOLEAN | Is this a half-day request |
| half_day_period | VARCHAR(10) | Morning or afternoon |
| contact_info | TEXT | Emergency contact during leave |

**Relationships:**
- `employee_id` → `employees.id`
- `leave_type_id` → `leave_types.id`
- `approver_id` → `employees.id`

**Constraints:**
- `valid_leave_status`: status IN ('pending', 'approved', 'rejected', 'cancelled')
- `valid_half_day_period`: period IN ('morning', 'afternoon') OR NULL
- `valid_date_range`: end_date >= start_date

---

### 11. **salary_history** - Salary Change History
Track salary changes over time with approval workflow.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | Foreign key to employees |
| old_salary | DECIMAL(10,2) | Previous salary |
| new_salary | DECIMAL(10,2) | New salary |
| effective_date | DATE | Date change takes effect |
| reason | VARCHAR(100) | Reason for change |
| approved_by | UUID | Foreign key to employees (approver) |
| notes | TEXT | Additional notes |

**Relationships:**
- `employee_id` → `employees.id`
- `approved_by` → `employees.id`

---

### 12. **payroll_records** - Payroll Processing
Detailed payroll records with earnings and deductions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | Foreign key to employees |
| pay_period_start | DATE | Pay period start date |
| pay_period_end | DATE | Pay period end date |
| pay_date | DATE | Payment date |
| base_salary | DECIMAL(10,2) | Base salary amount |
| overtime_amount | DECIMAL(10,2) | Overtime pay |
| bonus_amount | DECIMAL(10,2) | Bonus amount |
| commission_amount | DECIMAL(10,2) | Commission amount |
| other_earnings | DECIMAL(10,2) | Other earnings |
| gross_pay | DECIMAL(10,2) | Total gross pay |
| federal_tax | DECIMAL(10,2) | Federal tax deduction |
| state_tax | DECIMAL(10,2) | State tax deduction |
| social_security | DECIMAL(10,2) | Social Security deduction |
| medicare | DECIMAL(10,2) | Medicare deduction |
| insurance_deduction | DECIMAL(10,2) | Insurance deduction |
| retirement_deduction | DECIMAL(10,2) | Retirement contribution |
| other_deductions | DECIMAL(10,2) | Other deductions |
| total_deductions | DECIMAL(10,2) | Total deductions |
| net_pay | DECIMAL(10,2) | Net pay amount |
| status | VARCHAR(20) | Payroll status |
| processed_by | UUID | Foreign key to employees (processor) |

**Relationships:**
- `employee_id` → `employees.id`
- `processed_by` → `employees.id`

**Constraints:**
- `valid_payroll_status`: status IN ('draft', 'approved', 'paid', 'cancelled')

---

### 13. **performance_reviews** - Performance Evaluations
Employee performance review system with ratings and comments.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | Foreign key to employees |
| reviewer_id | UUID | Foreign key to employees (reviewer) |
| review_period_start | DATE | Review period start |
| review_period_end | DATE | Review period end |
| review_type | VARCHAR(50) | Type of review |
| overall_rating | DECIMAL(3,2) | Overall rating (1-5) |
| technical_skills_rating | DECIMAL(3,2) | Technical skills rating |
| communication_rating | DECIMAL(3,2) | Communication rating |
| teamwork_rating | DECIMAL(3,2) | Teamwork rating |
| leadership_rating | DECIMAL(3,2) | Leadership rating |
| strengths | TEXT | Employee strengths |
| areas_for_improvement | TEXT | Areas for improvement |
| goals | TEXT | Future goals |
| reviewer_comments | TEXT | Reviewer comments |
| employee_comments | TEXT | Employee comments |
| status | VARCHAR(20) | Review status |
| due_date | DATE | Review due date |
| completed_date | DATE | Review completion date |

**Relationships:**
- `employee_id` → `employees.id`
- `reviewer_id` → `employees.id`

**Constraints:**
- `valid_review_type`: type IN ('annual', 'quarterly', 'probationary', 'project-based')
- `valid_review_status`: status IN ('draft', 'pending', 'completed', 'cancelled')
- `valid_ratings`: All ratings between 1 and 5

---

### 14. **training_programs** - Training Program Catalog
Available training programs and courses.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR(200) | Training program title |
| description | TEXT | Program description |
| provider | VARCHAR(100) | Training provider |
| duration_hours | INTEGER | Duration in hours |
| cost | DECIMAL(10,2) | Program cost |
| certification_available | BOOLEAN | Certification available |
| is_mandatory | BOOLEAN | Is mandatory training |
| category | VARCHAR(50) | Training category |

---

### 15. **employee_training_records** - Training Completion Records
Track employee training enrollment and completion.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | Foreign key to employees |
| training_program_id | UUID | Foreign key to training_programs |
| enrollment_date | DATE | Enrollment date |
| start_date | DATE | Training start date |
| completion_date | DATE | Training completion date |
| status | VARCHAR(20) | Training status |
| score | DECIMAL(5,2) | Assessment score |
| certification_earned | BOOLEAN | Certification earned |
| cost_covered_by_company | DECIMAL(10,2) | Company-covered cost |
| notes | TEXT | Additional notes |

**Relationships:**
- `employee_id` → `employees.id`
- `training_program_id` → `training_programs.id`

**Constraints:**
- `valid_training_status`: status IN ('enrolled', 'in-progress', 'completed', 'cancelled', 'failed')

---

### 16. **system_settings** - System Configuration
Application-wide configuration settings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| setting_key | VARCHAR(100) | Setting key (unique) |
| setting_value | TEXT | Setting value |
| setting_type | VARCHAR(20) | Value type |
| description | TEXT | Setting description |
| is_public | BOOLEAN | Can be accessed by non-admin users |

**Constraints:**
- `valid_setting_type`: type IN ('string', 'number', 'boolean', 'json')

---

### 17. **audit_logs** - System Audit Trail
Comprehensive audit logging for all database changes.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| action | VARCHAR(50) | Action performed |
| table_name | VARCHAR(50) | Affected table |
| record_id | UUID | Affected record ID |
| old_values | JSONB | Previous values |
| new_values | JSONB | New values |
| ip_address | INET | User IP address |
| user_agent | TEXT | User agent string |
| created_at | TIMESTAMP | Action timestamp |

**Relationships:**
- `user_id` → `users.id`

**Constraints:**
- `valid_action`: action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')

---

### 18. **notifications** - System Notifications
User notifications and alerts.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| title | VARCHAR(200) | Notification title |
| message | TEXT | Notification message |
| type | VARCHAR(50) | Notification type |
| is_read | BOOLEAN | Read status |
| action_url | VARCHAR(500) | Action URL |
| related_record_id | UUID | Related record ID |
| related_table | VARCHAR(50) | Related table name |
| expires_at | TIMESTAMP | Expiration date |

**Relationships:**
- `user_id` → `users.id`

**Constraints:**
- `valid_notification_type`: type IN ('info', 'success', 'warning', 'error', 'leave_request', 'attendance', 'payroll')

---

### 19. **file_attachments** - File Management
File attachments for employee documents and photos.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | Foreign key to employees |
| filename | VARCHAR(255) | Stored filename |
| original_filename | VARCHAR(255) | Original filename |
| file_path | VARCHAR(500) | File storage path |
| file_size | INTEGER | File size in bytes |
| mime_type | VARCHAR(100) | File MIME type |
| category | VARCHAR(50) | File category |
| description | TEXT | File description |
| uploaded_by | UUID | Foreign key to users (uploader) |
| is_public | BOOLEAN | Public access flag |

**Relationships:**
- `employee_id` → `employees.id`
- `uploaded_by` → `users.id`

**Constraints:**
- `valid_file_category`: category IN ('profile_photo', 'resume', 'contract', 'id_document', 'certificate', 'other')

---

## 🔗 Key Relationships

### Primary Relationships
1. **Users → Employees**: One-to-one relationship
2. **Departments → Employees**: One-to-many relationship
3. **Positions → Employees**: One-to-many relationship
4. **Employees → Employees**: Self-referencing manager relationship
5. **Employees → Attendance Records**: One-to-many relationship
6. **Employees → Leave Requests**: One-to-many relationship
7. **Leave Types → Leave Requests**: One-to-many relationship

### Workflow Relationships
- **Leave Approval**: Leave Request → Approver (Employee)
- **Performance Reviews**: Employee → Reviewer (Employee)
- **Salary Changes**: Employee → Approver (Employee)
- **Training**: Employee → Training Programs (many-to-many)

---

## 🔐 Security Features

### Row Level Security (RLS)
- **Enabled on all sensitive tables**
- **Role-based access control**:
  - **Employees**: Can only access their own data
  - **Managers**: Can access their team's data
  - **HR**: Can access all employee data
  - **Admin**: Full system access

### Example RLS Policies

```sql
-- Employees can view own record, managers can view team, HR/admin can view all
CREATE POLICY "Employee data access" ON employees
    FOR SELECT USING (
        user_id = auth.uid() OR 
        manager_id = (SELECT id FROM employees WHERE user_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'hr')
        )
    );
```

### Data Protection
- **Password hashing** for user authentication
- **Sensitive data encryption** for SSN, bank account numbers
- **Audit logging** for all database changes
- **IP address tracking** for attendance and security

---

## 📈 Performance Optimizations

### Indexes
- **Primary keys** and **foreign keys** automatically indexed
- **Composite indexes** for frequently queried combinations
- **Date-based indexes** for attendance and payroll queries
- **Status indexes** for filtering active records

### Key Indexes
```sql
-- Employee search and filtering
CREATE INDEX idx_employees_name ON employees(first_name, last_name);
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_employment_status ON employees(employment_status);

-- Attendance queries
CREATE INDEX idx_attendance_employee_date ON attendance_records(employee_id, date);
CREATE INDEX idx_attendance_date ON attendance_records(date);

-- Leave request filtering
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
```

---

## 🔧 Database Functions

### Business Logic Functions

1. **calculate_age(birth_date)**: Calculate employee age
2. **get_leave_balance(emp_id, leave_type_id, year)**: Get leave balance details
3. **can_take_leave(emp_id, leave_type_id, days)**: Check if employee can take leave

### Trigger Functions
- **update_updated_at_column()**: Automatically update timestamp on record changes

---

## 📊 Predefined Views

### Employee Overview
```sql
CREATE VIEW employee_overview AS
SELECT 
    e.id,
    e.employee_id,
    e.first_name || ' ' || e.last_name as full_name,
    u.email,
    d.name as department_name,
    p.title as position_title,
    e.salary,
    e.employment_status
FROM employees e
JOIN users u ON e.user_id = u.id
JOIN departments d ON e.department_id = d.id
JOIN positions p ON e.position_id = p.id;
```

### Daily Attendance Stats
```sql
CREATE VIEW daily_attendance_stats AS
SELECT 
    date,
    COUNT(*) as total_employees,
    COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END) as present_count,
    ROUND((COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
FROM attendance_records
GROUP BY date;
```

---

## 🚀 Setup Instructions

### 1. Create Database Schema
Run the main schema file in Supabase SQL Editor:
```bash
# Execute the main schema
psql -d your_database < supabase-schema.sql
```

### 2. Load Sample Data
Populate the database with sample data:
```bash
# Execute sample data
psql -d your_database < sample-data.sql
```

### 3. Configure Supabase Auth
Set up Supabase authentication:
- Enable email/password authentication
- Configure RLS policies
- Set up API keys

### 4. Environment Variables
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 📝 Usage Examples

### Query Employee Information
```sql
SELECT * FROM employee_overview 
WHERE department_name = 'Engineering' 
AND employment_status = 'active';
```

### Get Daily Attendance
```sql
SELECT * FROM daily_attendance_stats 
WHERE date = CURRENT_DATE;
```

### Check Leave Balance
```sql
SELECT * FROM get_leave_balance(
    'employee_id_here', 
    'leave_type_id_here', 
    2024
);
```

---

## 🔄 Data Flow

### Employee Lifecycle
1. **User Account Creation** → `users` table
2. **Employee Profile** → `employees` table
3. **Emergency Contacts** → `emergency_contacts` table
4. **Work Schedule** → `work_schedules` table
5. **Leave Balances** → `employee_leave_balances` table

### Daily Operations
1. **Attendance Tracking** → `attendance_records` table
2. **Leave Requests** → `leave_requests` table
3. **Notifications** → `notifications` table
4. **Audit Logging** → `audit_logs` table

### Periodic Processes
1. **Performance Reviews** → `performance_reviews` table
2. **Salary Changes** → `salary_history` table
3. **Payroll Processing** → `payroll_records` table
4. **Training Completion** → `employee_training_records` table

---

## 🛠️ Maintenance

### Regular Tasks
- **Update leave balances** at year-end
- **Archive old attendance records** (keep current year + 7 years)
- **Clean up old notifications** (older than 90 days)
- **Backup sensitive data** regularly

### Monitoring
- **Query performance** monitoring
- **Database size** monitoring
- **RLS policy** effectiveness
- **Audit log** review

---

## 📚 API Integration

This database structure is designed to work seamlessly with:
- **Supabase Auto-generated APIs**
- **Real-time subscriptions**
- **Row Level Security**
- **Database functions**

### Example API Calls
```javascript
// Get employee list
const { data } = await supabase
  .from('employee_overview')
  .select('*')
  .eq('employment_status', 'active');

// Submit leave request
const { data } = await supabase
  .from('leave_requests')
  .insert({
    employee_id: 'employee_id',
    leave_type_id: 'leave_type_id',
    start_date: '2024-12-01',
    end_date: '2024-12-05',
    total_days: 5,
    reason: 'Vacation'
  });
```

---

This database structure provides a comprehensive foundation for a full-featured HR management system with security, performance, and scalability built-in.