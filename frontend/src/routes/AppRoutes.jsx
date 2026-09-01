import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Login from '../pages/Login';

import Layout from '../components/layout/Layout';

import {
  ProtectedRoute,
  RoleRoute,
} from './ProtectedRoute';

// Employee
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import MyAttendance from '../pages/employee/MyAttendance';
import ApplyLeave from '../pages/employee/ApplyLeave';
import MyLeaves from '../pages/employee/MyLeaves';
import EmployeeProfile from '../pages/employee/Profile';

// HR
import HRDashboard from '../pages/hr/HRDashboard';
import Employees from '../pages/hr/Employees';
import EmployeeDetails from '../pages/hr/EmployeeDetails';
import AttendanceManagement from '../pages/hr/AttendanceManagement';
import LeaveRequests from '../pages/hr/LeaveRequests';
import Reports from '../pages/hr/Reports';

const AppRoutes = () => {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC
      ===================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* =====================================================
          PROTECTED
      ===================================================== */}

      <Route element={<ProtectedRoute />}>

        {/* ===================================================
            EMPLOYEE
        =================================================== */}

        <Route element={<RoleRoute allowedRoles={['EMPLOYEE']} />}>

          <Route element={<Layout />}>

            <Route
              path="/employee/dashboard"
              element={<EmployeeDashboard />}
            />

            <Route
              path="/employee/attendance"
              element={<MyAttendance />}
            />

            <Route
              path="/employee/apply-leave"
              element={<ApplyLeave />}
            />

            <Route
              path="/employee/leaves"
              element={<MyLeaves />}
            />

            <Route
              path="/employee/profile"
              element={<EmployeeProfile />}
            />

          </Route>

        </Route>


        {/* ===================================================
            HR
        =================================================== */}

        <Route element={<RoleRoute allowedRoles={['HR']} />}>

          <Route element={<Layout />}>

            <Route
              path="/hr/dashboard"
              element={<HRDashboard />}
            />

            <Route
              path="/hr/employees"
              element={<Employees />}
            />

            <Route
              path="/hr/employees/:id"
              element={<EmployeeDetails />}
            />

            <Route
              path="/hr/attendance"
              element={<AttendanceManagement />}
            />

            <Route
              path="/hr/leave-requests"
              element={<LeaveRequests />}
            />

            <Route
              path="/hr/reports"
              element={<Reports />}
            />

            <Route
              path="/hr/profile"
              element={<EmployeeProfile />}
            />

          </Route>

        </Route>

      </Route>


      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
};

export default AppRoutes;