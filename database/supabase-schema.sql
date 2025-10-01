-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- 1. USERS TABLE (Authentication & Core User Data)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Use Supabase Auth instead in production
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_role CHECK (role IN ('admin', 'hr', 'manager', 'employee'))
);

-- 2. DEPARTMENTS TABLE
CREATE TABLE departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    budget DECIMAL(15, 2),
    color VARCHAR(7) DEFAULT '#3b82f6', -- For UI theming
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. POSITIONS TABLE
CREATE TABLE positions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    description TEXT,
    min_salary DECIMAL(10, 2),
    max_salary DECIMAL(10, 2),
    requirements TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(title, department_id)
);

-- 4. EMPLOYEES TABLE (Main Employee Information)
CREATE TABLE employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(20) UNIQUE NOT NULL, -- Company employee ID
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    phone VARCHAR(20),
    personal_email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    
    -- Employment Information
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    position_id UUID NOT NULL REFERENCES positions(id) ON DELETE RESTRICT,
    manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    hire_date DATE NOT NULL,
    termination_date DATE,
    employment_status VARCHAR(20) NOT NULL DEFAULT 'active',
    employment_type VARCHAR(20) NOT NULL DEFAULT 'full-time',
    
    -- Salary Information
    salary DECIMAL(10, 2) NOT NULL,
    salary_type VARCHAR(20) NOT NULL DEFAULT 'annual',
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Additional Information
    ssn VARCHAR(15), -- Social Security Number (encrypted in production)
    tax_id VARCHAR(20),
    bank_account_number VARCHAR(50), -- Encrypted in production
    routing_number VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_employment_status CHECK (employment_status IN ('active', 'inactive', 'terminated', 'on_leave')),
    CONSTRAINT valid_employment_type CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'intern')),
    CONSTRAINT valid_salary_type CHECK (salary_type IN ('annual', 'monthly', 'weekly', 'hourly')),
    CONSTRAINT valid_gender CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'))
);

-- 5. EMERGENCY CONTACTS TABLE
CREATE TABLE emergency_contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- ATTENDANCE TABLES
-- =============================================================================

-- 6. ATTENDANCE RECORDS TABLE
CREATE TABLE attendance_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    break_start TIME,
    break_end TIME,
    total_hours DECIMAL(4, 2),
    overtime_hours DECIMAL(4, 2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'present',
    notes TEXT,
    location VARCHAR(100), -- Work location/office
    ip_address INET, -- For tracking remote work
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_attendance_status CHECK (status IN ('present', 'absent', 'late', 'half-day', 'sick', 'vacation', 'holiday')),
    UNIQUE(employee_id, date)
);

-- 7. WORK SCHEDULES TABLE
CREATE TABLE work_schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration INTEGER DEFAULT 60, -- Break duration in minutes
    is_working_day BOOLEAN NOT NULL DEFAULT true,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_day_of_week CHECK (day_of_week >= 0 AND day_of_week <= 6)
);

-- =============================================================================
-- LEAVE MANAGEMENT TABLES
-- =============================================================================

-- 8. LEAVE TYPES TABLE
CREATE TABLE leave_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    max_days_per_year INTEGER,
    carry_forward_allowed BOOLEAN DEFAULT false,
    max_carry_forward_days INTEGER DEFAULT 0,
    requires_approval BOOLEAN DEFAULT true,
    advance_notice_days INTEGER DEFAULT 1,
    is_paid BOOLEAN DEFAULT true,
    color VARCHAR(7) DEFAULT '#10b981', -- For UI theming
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. EMPLOYEE LEAVE BALANCES TABLE
CREATE TABLE employee_leave_balances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    allocated_days DECIMAL(4, 1) NOT NULL DEFAULT 0,
    used_days DECIMAL(4, 1) NOT NULL DEFAULT 0,
    pending_days DECIMAL(4, 1) NOT NULL DEFAULT 0,
    carried_forward_days DECIMAL(4, 1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(employee_id, leave_type_id, year)
);

-- 10. LEAVE REQUESTS TABLE
CREATE TABLE leave_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(4, 1) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    applied_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Approval workflow
    approver_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    approved_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Additional fields
    is_half_day BOOLEAN DEFAULT false,
    half_day_period VARCHAR(10), -- 'morning' or 'afternoon'
    contact_info TEXT, -- Emergency contact during leave
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_leave_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    CONSTRAINT valid_half_day_period CHECK (half_day_period IN ('morning', 'afternoon') OR half_day_period IS NULL),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- =============================================================================
-- PAYROLL TABLES
-- =============================================================================

-- 11. SALARY HISTORY TABLE
CREATE TABLE salary_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    old_salary DECIMAL(10, 2),
    new_salary DECIMAL(10, 2) NOT NULL,
    effective_date DATE NOT NULL,
    reason VARCHAR(100),
    approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. PAYROLL RECORDS TABLE
CREATE TABLE payroll_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    
    -- Earnings
    base_salary DECIMAL(10, 2) NOT NULL,
    overtime_amount DECIMAL(10, 2) DEFAULT 0,
    bonus_amount DECIMAL(10, 2) DEFAULT 0,
    commission_amount DECIMAL(10, 2) DEFAULT 0,
    other_earnings DECIMAL(10, 2) DEFAULT 0,
    gross_pay DECIMAL(10, 2) NOT NULL,
    
    -- Deductions
    federal_tax DECIMAL(10, 2) DEFAULT 0,
    state_tax DECIMAL(10, 2) DEFAULT 0,
    social_security DECIMAL(10, 2) DEFAULT 0,
    medicare DECIMAL(10, 2) DEFAULT 0,
    insurance_deduction DECIMAL(10, 2) DEFAULT 0,
    retirement_deduction DECIMAL(10, 2) DEFAULT 0,
    other_deductions DECIMAL(10, 2) DEFAULT 0,
    total_deductions DECIMAL(10, 2) NOT NULL,
    
    net_pay DECIMAL(10, 2) NOT NULL,
    
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    processed_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_payroll_status CHECK (status IN ('draft', 'approved', 'paid', 'cancelled'))
);

-- =============================================================================
-- PERFORMANCE & TRAINING TABLES
-- =============================================================================

-- 13. PERFORMANCE REVIEWS TABLE
CREATE TABLE performance_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    review_type VARCHAR(50) NOT NULL,
    
    -- Ratings (1-5 scale)
    overall_rating DECIMAL(3, 2),
    technical_skills_rating DECIMAL(3, 2),
    communication_rating DECIMAL(3, 2),
    teamwork_rating DECIMAL(3, 2),
    leadership_rating DECIMAL(3, 2),
    
    -- Comments
    strengths TEXT,
    areas_for_improvement TEXT,
    goals TEXT,
    reviewer_comments TEXT,
    employee_comments TEXT,
    
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    due_date DATE,
    completed_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_review_type CHECK (review_type IN ('annual', 'quarterly', 'probationary', 'project-based')),
    CONSTRAINT valid_review_status CHECK (status IN ('draft', 'pending', 'completed', 'cancelled')),
    CONSTRAINT valid_ratings CHECK (
        (overall_rating IS NULL OR (overall_rating >= 1 AND overall_rating <= 5)) AND
        (technical_skills_rating IS NULL OR (technical_skills_rating >= 1 AND technical_skills_rating <= 5)) AND
        (communication_rating IS NULL OR (communication_rating >= 1 AND communication_rating <= 5)) AND
        (teamwork_rating IS NULL OR (teamwork_rating >= 1 AND teamwork_rating <= 5)) AND
        (leadership_rating IS NULL OR (leadership_rating >= 1 AND leadership_rating <= 5))
    )
);

-- 14. TRAINING PROGRAMS TABLE
CREATE TABLE training_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    provider VARCHAR(100),
    duration_hours INTEGER,
    cost DECIMAL(10, 2),
    certification_available BOOLEAN DEFAULT false,
    is_mandatory BOOLEAN DEFAULT false,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. EMPLOYEE TRAINING RECORDS TABLE
CREATE TABLE employee_training_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    training_program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    enrollment_date DATE NOT NULL,
    start_date DATE,
    completion_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'enrolled',
    score DECIMAL(5, 2), -- For assessments
    certification_earned BOOLEAN DEFAULT false,
    cost_covered_by_company DECIMAL(10, 2),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_training_status CHECK (status IN ('enrolled', 'in-progress', 'completed', 'cancelled', 'failed'))
);

-- =============================================================================
-- SYSTEM & AUDIT TABLES
-- =============================================================================

-- 16. SYSTEM SETTINGS TABLE
CREATE TABLE system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) NOT NULL DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Can be accessed by non-admin users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_setting_type CHECK (setting_type IN ('string', 'number', 'boolean', 'json'))
);

-- 17. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_action CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'))
);

-- 18. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT false,
    action_url VARCHAR(500), -- URL to navigate when notification is clicked
    related_record_id UUID, -- ID of related record (leave request, etc.)
    related_table VARCHAR(50), -- Table name of related record
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_notification_type CHECK (type IN ('info', 'success', 'warning', 'error', 'leave_request', 'attendance', 'payroll'))
);

-- 19. FILE ATTACHMENTS TABLE (for documents, photos, etc.)
CREATE TABLE file_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL, -- Path in storage (S3, etc.)
    file_size INTEGER NOT NULL, -- File size in bytes
    mime_type VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'profile_photo', 'resume', 'contract', etc.
    description TEXT,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_file_category CHECK (category IN ('profile_photo', 'resume', 'contract', 'id_document', 'certificate', 'other'))
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- User and Authentication Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Employee Indexes
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_employment_status ON employees(employment_status);
CREATE INDEX idx_employees_hire_date ON employees(hire_date);
CREATE INDEX idx_employees_name ON employees(first_name, last_name);

-- Attendance Indexes
CREATE INDEX idx_attendance_employee_date ON attendance_records(employee_id, date);
CREATE INDEX idx_attendance_date ON attendance_records(date);
CREATE INDEX idx_attendance_status ON attendance_records(status);

-- Leave Request Indexes
CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_requests_applied_date ON leave_requests(applied_date);

-- Department and Position Indexes
CREATE INDEX idx_departments_manager_id ON departments(manager_id);
CREATE INDEX idx_positions_department_id ON positions(department_id);

-- Payroll Indexes
CREATE INDEX idx_payroll_employee_period ON payroll_records(employee_id, pay_period_start, pay_period_end);
CREATE INDEX idx_payroll_pay_date ON payroll_records(pay_date);

-- Notification Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Audit Log Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_types_updated_at BEFORE UPDATE ON leave_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_leave_balances_updated_at BEFORE UPDATE ON employee_leave_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_records_updated_at BEFORE UPDATE ON payroll_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performance_reviews_updated_at BEFORE UPDATE ON performance_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_programs_updated_at BEFORE UPDATE ON training_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_training_records_updated_at BEFORE UPDATE ON employee_training_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Example RLS Policies (customize based on your needs)

-- Users can only see their own user record, admins can see all
CREATE POLICY "Users can view own record" ON users
    FOR SELECT USING (auth.uid() = id OR EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'hr')
    ));

-- Employees can see their own data, managers can see their team, admins/HR can see all
CREATE POLICY "Employee data access" ON employees
    FOR SELECT USING (
        user_id = auth.uid() OR 
        manager_id = (SELECT id FROM employees WHERE user_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'hr')
        )
    );

-- Attendance records: employees can see own, managers can see team, HR/admin can see all
CREATE POLICY "Attendance access" ON attendance_records
    FOR SELECT USING (
        employee_id = (SELECT id FROM employees WHERE user_id = auth.uid()) OR
        employee_id IN (
            SELECT id FROM employees WHERE manager_id = (
                SELECT id FROM employees WHERE user_id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'hr')
        )
    );

-- Comments for documentation
COMMENT ON TABLE users IS 'Core user authentication and role management';
COMMENT ON TABLE employees IS 'Complete employee information including personal and employment details';
COMMENT ON TABLE departments IS 'Organizational departments with manager assignments';
COMMENT ON TABLE attendance_records IS 'Daily attendance tracking with check-in/out times';
COMMENT ON TABLE leave_requests IS 'Employee leave requests with approval workflow';
COMMENT ON TABLE payroll_records IS 'Payroll processing and salary payment records';
COMMENT ON TABLE performance_reviews IS 'Employee performance evaluation and rating system';
COMMENT ON TABLE audit_logs IS 'System audit trail for all database changes';