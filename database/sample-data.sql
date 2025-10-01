-- Sample Data for HR Dashboard Database
-- This file contains INSERT statements to populate the database with sample data
-- Run this after creating the main schema

-- =============================================================================
-- SAMPLE DATA INSERTION
-- =============================================================================

-- 1. INSERT SAMPLE USERS
INSERT INTO users (id, email, password_hash, role, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@company.com', '$2b$10$example_hash_admin', 'admin', true),
('22222222-2222-2222-2222-222222222222', 'hr@company.com', '$2b$10$example_hash_hr', 'hr', true),
('33333333-3333-3333-3333-333333333333', 'employee@company.com', '$2b$10$example_hash_emp', 'employee', true),
('44444444-4444-4444-4444-444444444444', 'emily.johnson@company.com', '$2b$10$example_hash_emily', 'employee', true),
('55555555-5555-5555-5555-555555555555', 'david.wilson@company.com', '$2b$10$example_hash_david', 'employee', true),
('66666666-6666-6666-6666-666666666666', 'lisa.chen@company.com', '$2b$10$example_hash_lisa', 'manager', true),
('77777777-7777-7777-7777-777777777777', 'alex.rodriguez@company.com', '$2b$10$example_hash_alex', 'employee', true),
('88888888-8888-8888-8888-888888888888', 'jennifer.brown@company.com', '$2b$10$example_hash_jennifer', 'employee', true);

-- 2. INSERT DEPARTMENTS
INSERT INTO departments (id, name, description, budget, color) VALUES
('d1111111-1111-1111-1111-111111111111', 'Administration', 'Administrative and system management', 500000.00, '#6b7280'),
('d2222222-2222-2222-2222-222222222222', 'Human Resources', 'People management and HR operations', 300000.00, '#10b981'),
('d3333333-3333-3333-3333-333333333333', 'Engineering', 'Software development and technical operations', 1200000.00, '#3b82f6'),
('d4444444-4444-4444-4444-444444444444', 'Marketing', 'Marketing and brand management', 400000.00, '#ef4444'),
('d5555555-5555-5555-5555-555555555555', 'Finance', 'Financial planning and accounting', 350000.00, '#f59e0b'),
('d6666666-6666-6666-6666-666666666666', 'Sales', 'Sales and customer relations', 600000.00, '#8b5cf6');

-- 3. INSERT POSITIONS
INSERT INTO positions (id, title, department_id, description, min_salary, max_salary) VALUES
('p1111111-1111-1111-1111-111111111111', 'System Administrator', 'd1111111-1111-1111-1111-111111111111', 'Manage IT infrastructure and systems', 70000.00, 85000.00),
('p2222222-2222-2222-2222-222222222222', 'HR Manager', 'd2222222-2222-2222-2222-222222222222', 'Lead HR operations and people management', 65000.00, 75000.00),
('p3333333-3333-3333-3333-333333333333', 'Software Developer', 'd3333333-3333-3333-3333-333333333333', 'Develop and maintain software applications', 80000.00, 100000.00),
('p4444444-4444-4444-4444-444444444444', 'Senior Developer', 'd3333333-3333-3333-3333-333333333333', 'Lead development projects and mentor junior developers', 90000.00, 110000.00),
('p5555555-5555-5555-5555-555555555555', 'Marketing Specialist', 'd4444444-4444-4444-4444-444444444444', 'Execute marketing campaigns and strategies', 55000.00, 65000.00),
('p6666666-6666-6666-6666-666666666666', 'Financial Analyst', 'd5555555-5555-5555-5555-555555555555', 'Analyze financial data and create reports', 70000.00, 80000.00),
('p7777777-7777-7777-7777-777777777777', 'Sales Representative', 'd6666666-6666-6666-6666-666666666666', 'Generate sales and maintain client relationships', 45000.00, 65000.00),
('p8888888-8888-8888-8888-888888888888', 'HR Assistant', 'd2222222-2222-2222-2222-222222222222', 'Support HR operations and employee services', 40000.00, 50000.00);

-- 4. INSERT EMPLOYEES
INSERT INTO employees (
    id, user_id, employee_id, first_name, last_name, date_of_birth, gender, phone, personal_email,
    address, city, state, postal_code, department_id, position_id, hire_date, salary,
    employment_status, employment_type
) VALUES
('e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'EMP001', 'John', 'Admin', '1985-03-15', 'male', '+1 (555) 123-4567', 'john.admin@personal.com', '123 Main St', 'New York', 'NY', '10001', 'd1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', '2022-01-15', 75000.00, 'active', 'full-time'),

('e2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'EMP002', 'Sarah', 'HR', '1988-07-22', 'female', '+1 (555) 234-5678', 'sarah.hr@personal.com', '456 Oak Ave', 'New York', 'NY', '10002', 'd2222222-2222-2222-2222-222222222222', 'p2222222-2222-2222-2222-222222222222', '2021-03-20', 68000.00, 'active', 'full-time'),

('e3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'EMP003', 'Mike', 'Employee', '1990-11-08', 'male', '+1 (555) 345-6789', 'mike.employee@personal.com', '789 Pine St', 'New York', 'NY', '10003', 'd3333333-3333-3333-3333-333333333333', 'p3333333-3333-3333-3333-333333333333', '2022-06-10', 85000.00, 'active', 'full-time'),

('e4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'EMP004', 'Emily', 'Johnson', '1992-02-14', 'female', '+1 (555) 456-7890', 'emily.johnson@personal.com', '321 Elm St', 'New York', 'NY', '10004', 'd4444444-4444-4444-4444-444444444444', 'p5555555-5555-5555-5555-555555555555', '2023-02-14', 58000.00, 'active', 'full-time'),

('e5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'EMP005', 'David', 'Wilson', '1987-09-08', 'male', '+1 (555) 567-8901', 'david.wilson@personal.com', '654 Maple Ave', 'New York', 'NY', '10005', 'd5555555-5555-5555-5555-555555555555', 'p6666666-6666-6666-6666-666666666666', '2021-09-08', 72000.00, 'active', 'full-time'),

('e6666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'EMP006', 'Lisa', 'Chen', '1986-11-25', 'female', '+1 (555) 678-9012', 'lisa.chen@personal.com', '987 Cedar St', 'New York', 'NY', '10006', 'd3333333-3333-3333-3333-333333333333', 'p4444444-4444-4444-4444-444444444444', '2020-11-25', 95000.00, 'active', 'full-time'),

('e7777777-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777', 'EMP007', 'Alex', 'Rodriguez', '1994-04-12', 'male', '+1 (555) 789-0123', 'alex.rodriguez@personal.com', '147 Birch St', 'New York', 'NY', '10007', 'd6666666-6666-6666-6666-666666666666', 'p7777777-7777-7777-7777-777777777777', '2023-04-12', 52000.00, 'active', 'full-time'),

('e8888888-8888-8888-8888-888888888888', '88888888-8888-8888-8888-888888888888', 'EMP008', 'Jennifer', 'Brown', '1991-08-30', 'female', '+1 (555) 890-1234', 'jennifer.brown@personal.com', '258 Spruce Ave', 'New York', 'NY', '10008', 'd2222222-2222-2222-2222-222222222222', 'p8888888-8888-8888-8888-888888888888', '2022-08-30', 45000.00, 'active', 'full-time');

-- Update manager relationships
UPDATE employees SET manager_id = 'e6666666-6666-6666-6666-666666666666' WHERE id = 'e3333333-3333-3333-3333-333333333333';
UPDATE employees SET manager_id = 'e2222222-2222-2222-2222-222222222222' WHERE id = 'e8888888-8888-8888-8888-888888888888';

-- Update department managers
UPDATE departments SET manager_id = '22222222-2222-2222-2222-222222222222' WHERE id = 'd2222222-2222-2222-2222-222222222222';
UPDATE departments SET manager_id = '66666666-6666-6666-6666-666666666666' WHERE id = 'd3333333-3333-3333-3333-333333333333';

-- 5. INSERT EMERGENCY CONTACTS
INSERT INTO emergency_contacts (employee_id, name, relationship, phone, email, is_primary) VALUES
('e1111111-1111-1111-1111-111111111111', 'Jane Admin', 'Spouse', '+1 (555) 987-6543', 'jane.admin@email.com', true),
('e2222222-2222-2222-2222-222222222222', 'Tom HR', 'Brother', '+1 (555) 876-5432', 'tom.hr@email.com', true),
('e3333333-3333-3333-3333-333333333333', 'Lisa Employee', 'Spouse', '+1 (555) 765-4321', 'lisa.employee@email.com', true),
('e4444444-4444-4444-4444-444444444444', 'Robert Johnson', 'Father', '+1 (555) 654-3210', 'robert.johnson@email.com', true),
('e5555555-5555-5555-5555-555555555555', 'Susan Wilson', 'Mother', '+1 (555) 543-2109', 'susan.wilson@email.com', true),
('e6666666-6666-6666-6666-666666666666', 'James Chen', 'Husband', '+1 (555) 432-1098', 'james.chen@email.com', true),
('e7777777-7777-7777-7777-777777777777', 'Maria Rodriguez', 'Sister', '+1 (555) 321-0987', 'maria.rodriguez@email.com', true),
('e8888888-8888-8888-8888-888888888888', 'Michael Brown', 'Spouse', '+1 (555) 210-9876', 'michael.brown@email.com', true);

-- 6. INSERT ATTENDANCE RECORDS (Last 5 days)
INSERT INTO attendance_records (employee_id, date, check_in, check_out, total_hours, status) VALUES
-- September 29, 2024 (Today)
('e1111111-1111-1111-1111-111111111111', '2024-09-29', '09:00', '17:30', 8.5, 'present'),
('e2222222-2222-2222-2222-222222222222', '2024-09-29', '08:45', '17:15', 8.5, 'present'),
('e3333333-3333-3333-3333-333333333333', '2024-09-29', '09:15', '18:00', 8.75, 'late'),
('e4444444-4444-4444-4444-444444444444', '2024-09-29', '09:00', '13:00', 4.0, 'half-day'),
('e5555555-5555-5555-5555-555555555555', '2024-09-29', NULL, NULL, 0, 'absent'),
('e6666666-6666-6666-6666-666666666666', '2024-09-29', '08:30', '17:45', 9.25, 'present'),
('e7777777-7777-7777-7777-777777777777', '2024-09-29', '09:00', '17:30', 8.5, 'present'),
('e8888888-8888-8888-8888-888888888888', '2024-09-29', '08:50', '17:20', 8.5, 'present'),

-- September 28, 2024
('e1111111-1111-1111-1111-111111111111', '2024-09-28', '09:00', '17:30', 8.5, 'present'),
('e2222222-2222-2222-2222-222222222222', '2024-09-28', '08:45', '17:15', 8.5, 'present'),
('e3333333-3333-3333-3333-333333333333', '2024-09-28', '09:00', '18:00', 9.0, 'present'),
('e4444444-4444-4444-4444-444444444444', '2024-09-28', '09:05', '17:35', 8.5, 'late'),
('e5555555-5555-5555-5555-555555555555', '2024-09-28', '09:00', '17:30', 8.5, 'present'),
('e6666666-6666-6666-6666-666666666666', '2024-09-28', '08:30', '17:45', 9.25, 'present'),
('e7777777-7777-7777-7777-777777777777', '2024-09-28', '09:00', '17:30', 8.5, 'present'),
('e8888888-8888-8888-8888-888888888888', '2024-09-28', '08:50', '17:20', 8.5, 'present');

-- 7. INSERT LEAVE TYPES
INSERT INTO leave_types (id, name, description, max_days_per_year, requires_approval, is_paid, color) VALUES
('lt111111-1111-1111-1111-111111111111', 'Vacation', 'Annual vacation leave', 20, true, true, '#10b981'),
('lt222222-2222-2222-2222-222222222222', 'Sick Leave', 'Medical and health-related leave', 10, false, true, '#ef4444'),
('lt333333-3333-3333-3333-333333333333', 'Personal Leave', 'Personal time off', 5, true, true, '#8b5cf6'),
('lt444444-4444-4444-4444-444444444444', 'Maternity Leave', 'Maternity leave for new mothers', 90, true, true, '#f59e0b'),
('lt555555-5555-5555-5555-555555555555', 'Paternity Leave', 'Paternity leave for new fathers', 14, true, true, '#3b82f6'),
('lt666666-6666-6666-6666-666666666666', 'Bereavement', 'Leave for family bereavement', 3, false, true, '#6b7280');

-- 8. INSERT EMPLOYEE LEAVE BALANCES (2024)
INSERT INTO employee_leave_balances (employee_id, leave_type_id, year, allocated_days, used_days, pending_days) VALUES
-- Vacation balances
('e1111111-1111-1111-1111-111111111111', 'lt111111-1111-1111-1111-111111111111', 2024, 20.0, 5.0, 0.0),
('e2222222-2222-2222-2222-222222222222', 'lt111111-1111-1111-1111-111111111111', 2024, 20.0, 8.0, 0.0),
('e3333333-3333-3333-3333-333333333333', 'lt111111-1111-1111-1111-111111111111', 2024, 20.0, 3.0, 5.0),
('e4444444-4444-4444-4444-444444444444', 'lt111111-1111-1111-1111-111111111111', 2024, 20.0, 2.0, 2.0),
('e5555555-5555-5555-5555-555555555555', 'lt111111-1111-1111-1111-111111111111', 2024, 20.0, 7.0, 0.0),
('e6666666-6666-6666-6666-666666666666', 'lt111111-1111-1111-1111-111111111111', 2024, 25.0, 10.0, 1.0),
('e7777777-7777-7777-7777-777777777777', 'lt111111-1111-1111-1111-111111111111', 2024, 15.0, 0.0, 10.0),
('e8888888-8888-8888-8888-888888888888', 'lt111111-1111-1111-1111-111111111111', 2024, 20.0, 4.0, 0.0),

-- Sick leave balances
('e1111111-1111-1111-1111-111111111111', 'lt222222-2222-2222-2222-222222222222', 2024, 10.0, 2.0, 0.0),
('e2222222-2222-2222-2222-222222222222', 'lt222222-2222-2222-2222-222222222222', 2024, 10.0, 1.0, 0.0),
('e3333333-3333-3333-3333-333333333333', 'lt222222-2222-2222-2222-222222222222', 2024, 10.0, 0.0, 0.0),
('e4444444-4444-4444-4444-444444444444', 'lt222222-2222-2222-2222-222222222222', 2024, 10.0, 2.0, 0.0),
('e5555555-5555-5555-5555-555555555555', 'lt222222-2222-2222-2222-222222222222', 2024, 10.0, 3.0, 0.0),
('e6666666-6666-6666-6666-666666666666', 'lt222222-2222-2222-2222-222222222222', 2024, 10.0, 1.0, 0.0),
('e7777777-7777-7777-7777-777777777777', 'lt222222-2222-2222-2222-222222222222', 2024, 10.0, 0.0, 0.0),
('e8888888-8888-8888-8888-888888888888', 'lt222222-2222-2222-2222-222222222222', 2024, 10.0, 1.0, 0.0);

-- 9. INSERT LEAVE REQUESTS
INSERT INTO leave_requests (
    id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, applied_date, approver_id
) VALUES
('lr111111-1111-1111-1111-111111111111', 'e3333333-3333-3333-3333-333333333333', 'lt111111-1111-1111-1111-111111111111', '2024-10-15', '2024-10-19', 5.0, 'Family vacation', 'pending', '2024-09-25 10:30:00', 'e6666666-6666-6666-6666-666666666666'),

('lr222222-2222-2222-2222-222222222222', 'e4444444-4444-4444-4444-444444444444', 'lt222222-2222-2222-2222-222222222222', '2024-09-30', '2024-10-01', 2.0, 'Flu symptoms', 'approved', '2024-09-28 14:15:00', 'e2222222-2222-2222-2222-222222222222'),

('lr333333-3333-3333-3333-333333333333', 'e6666666-6666-6666-6666-666666666666', 'lt333333-3333-3333-3333-333333333333', '2024-10-05', '2024-10-05', 1.0, 'Personal appointment', 'approved', '2024-09-20 09:00:00', 'e2222222-2222-2222-2222-222222222222'),

('lr444444-4444-4444-4444-444444444444', 'e7777777-7777-7777-7777-777777777777', 'lt111111-1111-1111-1111-111111111111', '2024-11-01', '2024-11-10', 10.0, 'Honeymoon', 'pending', '2024-09-15 16:45:00', 'e2222222-2222-2222-2222-222222222222');

-- 10. INSERT WORK SCHEDULES (Standard Monday-Friday 9-5)
INSERT INTO work_schedules (employee_id, day_of_week, start_time, end_time, effective_from) 
SELECT 
    e.id,
    generate_series(1, 5) as day_of_week, -- Monday to Friday
    '09:00:00'::time as start_time,
    '17:30:00'::time as end_time,
    e.hire_date as effective_from
FROM employees e;

-- 11. INSERT SYSTEM SETTINGS
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('company_name', 'HR Dashboard Company', 'string', 'Company name displayed in the application', true),
('company_address', '123 Business Ave, New York, NY 10001', 'string', 'Company address', true),
('company_phone', '+1 (555) 123-0000', 'string', 'Company main phone number', true),
('company_email', 'info@company.com', 'string', 'Company main email address', true),
('work_hours_per_day', '8', 'number', 'Standard work hours per day', true),
('work_days_per_week', '5', 'number', 'Standard work days per week', true),
('overtime_threshold', '40', 'number', 'Hours per week before overtime applies', false),
('default_vacation_days', '20', 'number', 'Default vacation days per year for new employees', false),
('default_sick_days', '10', 'number', 'Default sick days per year for new employees', false),
('password_min_length', '8', 'number', 'Minimum password length requirement', false),
('enable_notifications', 'true', 'boolean', 'Enable system notifications', true),
('timezone', 'America/New_York', 'string', 'System timezone', true);

-- 12. INSERT SAMPLE NOTIFICATIONS
INSERT INTO notifications (user_id, title, message, type, is_read, related_record_id, related_table) VALUES
('33333333-3333-3333-3333-333333333333', 'Leave Request Submitted', 'Your vacation leave request for Oct 15-19 has been submitted and is awaiting approval.', 'leave_request', false, 'lr111111-1111-1111-1111-111111111111', 'leave_requests'),

('66666666-6666-6666-6666-666666666666', 'New Leave Request', 'Mike Employee has submitted a vacation leave request for your approval.', 'leave_request', false, 'lr111111-1111-1111-1111-111111111111', 'leave_requests'),

('44444444-4444-4444-4444-444444444444', 'Leave Request Approved', 'Your sick leave request for Sep 30 - Oct 1 has been approved.', 'leave_request', true, 'lr222222-2222-2222-2222-222222222222', 'leave_requests'),

('22222222-2222-2222-2222-222222222222', 'Late Attendance Alert', 'Mike Employee marked late attendance today at 9:15 AM.', 'attendance', false, NULL, 'attendance_records');

-- 13. INSERT SAMPLE TRAINING PROGRAMS
INSERT INTO training_programs (id, title, description, provider, duration_hours, cost, category) VALUES
('tp111111-1111-1111-1111-111111111111', 'Workplace Safety', 'Annual workplace safety training', 'Internal', 2, 0.00, 'Safety'),
('tp222222-2222-2222-2222-222222222222', 'Leadership Development', 'Management and leadership skills training', 'External Provider', 16, 1200.00, 'Leadership'),
('tp333333-3333-3333-3333-333333333333', 'Technical Skills - React', 'Advanced React development training', 'Tech Academy', 40, 2500.00, 'Technical'),
('tp444444-4444-4444-4444-444444444444', 'HR Compliance', 'HR compliance and legal requirements', 'HR Institute', 8, 800.00, 'Compliance');

-- 14. INSERT SAMPLE SALARY HISTORY
INSERT INTO salary_history (employee_id, old_salary, new_salary, effective_date, reason, approved_by) VALUES
('e6666666-6666-6666-6666-666666666666', 90000.00, 95000.00, '2024-01-01', 'Annual salary increase', 'e1111111-1111-1111-1111-111111111111'),
('e3333333-3333-3333-3333-333333333333', 80000.00, 85000.00, '2024-01-01', 'Performance-based increase', 'e6666666-6666-6666-6666-666666666666'),
('e2222222-2222-2222-2222-222222222222', 65000.00, 68000.00, '2024-01-01', 'Cost of living adjustment', 'e1111111-1111-1111-1111-111111111111');

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- View for employee overview with department and position info
CREATE VIEW employee_overview AS
SELECT 
    e.id,
    e.employee_id,
    e.first_name || ' ' || e.last_name as full_name,
    u.email,
    e.phone,
    d.name as department_name,
    p.title as position_title,
    e.hire_date,
    e.salary,
    e.employment_status,
    m.first_name || ' ' || m.last_name as manager_name
FROM employees e
JOIN users u ON e.user_id = u.id
JOIN departments d ON e.department_id = d.id
JOIN positions p ON e.position_id = p.id
LEFT JOIN employees m ON e.manager_id = m.id
WHERE e.employment_status = 'active';

-- View for current attendance statistics
CREATE VIEW daily_attendance_stats AS
SELECT 
    date,
    COUNT(*) as total_employees,
    COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END) as present_count,
    COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
    COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count,
    COUNT(CASE WHEN status = 'half-day' THEN 1 END) as half_day_count,
    ROUND(
        (COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as attendance_percentage
FROM attendance_records
GROUP BY date
ORDER BY date DESC;

-- View for leave request dashboard
CREATE VIEW leave_request_summary AS
SELECT 
    lr.id,
    e.first_name || ' ' || e.last_name as employee_name,
    d.name as department_name,
    lt.name as leave_type,
    lr.start_date,
    lr.end_date,
    lr.total_days,
    lr.reason,
    lr.status,
    lr.applied_date,
    a.first_name || ' ' || a.last_name as approver_name
FROM leave_requests lr
JOIN employees e ON lr.employee_id = e.id
JOIN departments d ON e.department_id = d.id
JOIN leave_types lt ON lr.leave_type_id = lt.id
LEFT JOIN employees a ON lr.approver_id = a.id
ORDER BY lr.applied_date DESC;

-- View for department statistics
CREATE VIEW department_statistics AS
SELECT 
    d.id,
    d.name,
    COUNT(e.id) as employee_count,
    AVG(e.salary) as average_salary,
    MIN(e.salary) as min_salary,
    MAX(e.salary) as max_salary,
    SUM(e.salary) as total_salary_cost,
    m.first_name || ' ' || m.last_name as manager_name
FROM departments d
LEFT JOIN employees e ON d.id = e.department_id AND e.employment_status = 'active'
LEFT JOIN users mu ON d.manager_id = mu.id
LEFT JOIN employees m ON mu.id = m.user_id
GROUP BY d.id, d.name, m.first_name, m.last_name
ORDER BY employee_count DESC;

-- =============================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =============================================================================

-- Function to calculate employee age
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql;

-- Function to get employee leave balance
CREATE OR REPLACE FUNCTION get_leave_balance(emp_id UUID, leave_type_id UUID, year INTEGER)
RETURNS TABLE(allocated DECIMAL, used DECIMAL, pending DECIMAL, remaining DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        elb.allocated_days,
        elb.used_days,
        elb.pending_days,
        (elb.allocated_days - elb.used_days - elb.pending_days) as remaining_days
    FROM employee_leave_balances elb
    WHERE elb.employee_id = emp_id 
    AND elb.leave_type_id = get_leave_balance.leave_type_id 
    AND elb.year = get_leave_balance.year;
END;
$$ LANGUAGE plpgsql;

-- Function to check if employee can take leave
CREATE OR REPLACE FUNCTION can_take_leave(emp_id UUID, leave_type_id UUID, days_requested DECIMAL)
RETURNS BOOLEAN AS $$
DECLARE
    remaining_days DECIMAL;
BEGIN
    SELECT (allocated_days - used_days - pending_days) INTO remaining_days
    FROM employee_leave_balances
    WHERE employee_id = emp_id 
    AND leave_type_id = can_take_leave.leave_type_id 
    AND year = EXTRACT(YEAR FROM CURRENT_DATE);
    
    RETURN COALESCE(remaining_days, 0) >= days_requested;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- INITIAL DATA COMMENTS
-- =============================================================================

COMMENT ON VIEW employee_overview IS 'Comprehensive employee information with department and manager details';
COMMENT ON VIEW daily_attendance_stats IS 'Daily attendance statistics with percentages';
COMMENT ON VIEW leave_request_summary IS 'Leave requests with employee and approver information';
COMMENT ON VIEW department_statistics IS 'Department-wise employee and salary statistics';

-- Insert final confirmation message
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('database_initialized', 'true', 'boolean', 'Indicates that the database has been initialized with sample data'),
('sample_data_version', '1.0', 'string', 'Version of the sample data loaded'),
('initialization_date', CURRENT_TIMESTAMP::text, 'string', 'Date when the database was initialized');

-- Final success message
SELECT 'HR Dashboard database initialized successfully with sample data!' as status;