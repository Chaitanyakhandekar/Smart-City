import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Protected Route Guard
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import Home from "./pages/public/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Citizen Pages
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import ReportComplaint from "./pages/citizen/ReportComplaint";
import CitizenComplaints from "./pages/citizen/CitizenComplaints";
import CitizenComplaintDetail from "./pages/citizen/CitizenComplaintDetail";
import CitizenNotifications from "./pages/citizen/CitizenNotifications";
import CitizenProfile from "./pages/citizen/CitizenProfile";

// Staff Pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffTasks from "./pages/staff/StaffTasks";
import StaffTaskDetail from "./pages/staff/StaffTaskDetail";
import StaffNotifications from "./pages/staff/StaffNotifications";
import StaffProfile from "./pages/staff/StaffProfile";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminComplaintDetail from "./pages/admin/AdminComplaintDetail";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminProfile from "./pages/admin/AdminProfile";

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Navigate to="/register" replace />} />

        {/* Citizen Routes */}
        <Route
          path="/citizen/dashboard"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/report"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <ReportComplaint />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/complaints"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <CitizenComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/complaints/:id"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <CitizenComplaintDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/notifications"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <CitizenNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/profile"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <CitizenProfile />
            </ProtectedRoute>
          }
        />

        {/* Staff Routes */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={["STAFF"]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/tasks"
          element={
            <ProtectedRoute allowedRoles={["STAFF"]}>
              <StaffTasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/complaints/:id"
          element={
            <ProtectedRoute allowedRoles={["STAFF"]}>
              <StaffTaskDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/tasks/:id"
          element={
            <ProtectedRoute allowedRoles={["STAFF"]}>
              <StaffTaskDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/notifications"
          element={
            <ProtectedRoute allowedRoles={["STAFF"]}>
              <StaffNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/profile"
          element={
            <ProtectedRoute allowedRoles={["STAFF"]}>
              <StaffProfile />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/complaints/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminComplaintDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminProfile />
            </ProtectedRoute>
          }
        />

        {/* Fallback redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;