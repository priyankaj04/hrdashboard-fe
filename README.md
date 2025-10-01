# HR Dashboard - College Project

A comprehensive HR management system built with React and Tailwind CSS for efficient employee management, attendance tracking, and leave management.

## 🚀 Features

### 🔐 Authentication System
- **Multi-role login system** (Admin, HR, Employee)
- **Demo credentials** provided for testing
- **Role-based access control** - different views for different user types
- **Secure login/logout** functionality

### 📊 Dashboard Overview
- **Real-time statistics** - employee count, attendance, leave requests
- **Interactive charts** - department distribution, attendance trends
- **Recent activities** timeline
- **Quick action buttons** for common tasks

### 👥 Employee Management
- **Complete employee profiles** with contact information
- **Add/Edit/Delete employees** with form validation
- **Advanced search and filtering** by department, position
- **Employee details modal** with comprehensive information
- **Department-wise organization**

### ⏰ Attendance Tracking
- **Real-time clock in/out** system for employees
- **Daily attendance overview** with status indicators
- **Monthly attendance trends** with charts
- **Attendance status tracking** (Present, Absent, Late, Half-day)
- **Detailed attendance reports** with export functionality

### 🗓️ Leave Management
- **Leave request submission** with multiple leave types
- **Leave approval workflow** for HR and admin
- **Leave balance tracking**
- **Status-based filtering** (Pending, Approved, Rejected)
- **Leave calendar view** with date ranges

### 📈 Reports & Analytics
- **Comprehensive reporting** with charts and graphs
- **Department-wise analytics**
- **Salary distribution reports**
- **Employee demographics**
- **Export functionality** for reports

## 🛠️ Tech Stack

- **Frontend**: React.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React Context API
- **Development**: Create React App

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Start

1. **Navigate to the project directory:**
   ```bash
   cd hr-dashboard/hr-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 🎯 Demo Credentials

Use these credentials to test different user roles:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | admin123 |
| HR | hr@company.com | hr123 |
| Employee | employee@company.com | emp123 |

## 📱 Key Pages & Features

### Login Page
- Clean, professional design with form validation
- Demo credentials display for easy access
- Responsive layout that works on all devices

### Dashboard
- **Admin/HR View**: Complete overview with all statistics and analytics
- **Employee View**: Personal dashboard with attendance and leave information
- Interactive charts showing department distribution and attendance trends
- Recent activities timeline and quick action buttons

### Employee Management (Admin/HR only)
- Grid view of all employees with profile pictures
- Advanced search and filter by department, position, or name
- Employee details modal with complete information
- Add/Edit/Delete operations with form validation

### Attendance System
- **Employee**: Real-time clock in/out interface with current time display
- **Admin/HR**: Complete attendance overview with daily and monthly reports
- Status indicators (Present, Absent, Late, Half-day) with color coding
- Attendance trend analysis with interactive charts

### Leave Management
- **All Users**: Submit leave requests with multiple leave types
- **Admin/HR**: Approve/reject leave requests with one-click actions
- Leave balance tracking and calendar view
- Status-based filtering and comprehensive leave history

### Reports & Analytics
- Department-wise employee distribution charts
- Salary analysis and distribution graphs
- Monthly attendance trends and statistics
- Export functionality for all reports

## 🏗️ Project Structure

```
hr-dashboard/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.js       # Main layout with sidebar/header
│   │   ├── Sidebar.js      # Navigation sidebar
│   │   └── Header.js       # Top header with user info
│   ├── pages/              # Main page components
│   │   ├── Login.js        # Authentication page
│   │   ├── Dashboard.js    # Main dashboard
│   │   ├── Employees.js    # Employee management
│   │   ├── Attendance.js   # Attendance tracking
│   │   ├── Leaves.js       # Leave management
│   │   ├── Reports.js      # Analytics & reports
│   │   └── Settings.js     # Configuration
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.js      # Authentication logic
│   ├── data/               # Mock data
│   │   └── mockData.js     # Sample data for demo
│   └── App.js              # Main app component
└── README.md
```

## 🎨 Design Features

- **Professional UI/UX** with clean, modern design
- **Responsive layout** that works on desktop, tablet, and mobile
- **Consistent color scheme** with blue primary colors
- **Interactive elements** with smooth hover effects and transitions
- **Accessible design** with proper contrast and typography
- **Chart integration** for beautiful data visualization

## 📊 Mock Data Included

The application includes comprehensive mock data for demonstration:

- **8 sample employees** across 5 different departments
- **Daily attendance records** with various statuses
- **Leave requests** in different approval states
- **Department statistics** and salary information
- **Monthly attendance trends** for the past 9 months

## 🚀 Perfect for College Projects

### ✅ Complete Full-Stack Structure
- Frontend with modern React components
- State management with Context API
- Mock backend data simulation
- Complete authentication system

### ✅ Professional Features
- Role-based access control system
- Data visualization with interactive charts
- Full CRUD operations for employee management
- Real-time attendance tracking system
- Complete leave management workflow

### ✅ Modern Development Practices
- Component-based architecture
- Reusable UI components
- Clean, maintainable code structure
- Responsive design principles
- Professional styling with Tailwind CSS

## 📈 Future Enhancements

- **Backend Integration**: Connect to real database (MySQL/PostgreSQL)
- **API Development**: REST API for all data operations
- **Email Notifications**: Automated email alerts for leave requests
- **Advanced Reports**: More detailed analytics and insights
- **File Uploads**: Employee documents and profile photos
- **Mobile App**: React Native version for mobile access

## 🎓 Educational Value

This project demonstrates:

- **Full-stack development concepts**
- **Modern React development patterns**
- **Professional UI/UX design principles**
- **Business application logic**
- **Project planning and execution**
- **Real-world HR management workflows**

## 🛟 Getting Started

1. **Clone or download** the project
2. **Navigate** to `hr-dashboard/hr-dashboard` directory
3. **Install dependencies** with `npm install`
4. **Start the server** with `npm start`
5. **Login** using the demo credentials above
6. **Explore** all the features!

## 📄 License

This project is created for educational purposes as a college project.

---

**Created with ❤️ for learning and demonstration purposes**

This HR Dashboard showcases a complete business application that demonstrates modern web development skills and could serve as a foundation for real-world HR management systems.

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
