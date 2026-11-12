import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

import { LandingPage } from './pages/public/LandingPage.jsx';
import { LoginPage } from './pages/public/LoginPage.jsx';
import { RegisterPage } from './pages/public/RegisterPage.jsx';
import { PublicExplorePage } from './pages/public/PublicExplorePage.jsx';

import { StudentDashboard } from './pages/student/StudentDashboard.jsx';
import { ReportItemPage } from './pages/student/ReportItemPage.jsx';
import { MyReportsPage } from './pages/student/MyReportsPage.jsx';
import { StudentExplorePage } from './pages/student/StudentExplorePage.jsx';
import { StudentMatchesPage } from './pages/student/StudentMatchesPage.jsx';
import { StudentRecoveryPage } from './pages/student/StudentRecoveryPage.jsx';
import { StudentNotificationsPage } from './pages/student/StudentNotificationsPage.jsx';
import { StudentProfilePage } from './pages/student/StudentProfilePage.jsx';
import { StudentSettingsPage } from './pages/student/StudentSettingsPage.jsx';

import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { AdminReportsPage } from './pages/admin/AdminReportsPage.jsx';
import { AdminMatchesPage } from './pages/admin/AdminMatchesPage.jsx';
import { AdminRecoveryPage } from './pages/admin/AdminRecoveryPage.jsx';
import { AdminVerificationPage } from './pages/admin/AdminVerificationPage.jsx';
import { AdminHeldItemsPage } from './pages/admin/AdminHeldItemsPage.jsx';
import { AdminReturnedItemsPage } from './pages/admin/AdminReturnedItemsPage.jsx';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.jsx';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage.jsx';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/explore" element={<PublicExplorePage />} />

            {/* Student Portal Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/report-lost"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ReportItemPage key="lost" mode="lost" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/report-found"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ReportItemPage key="found" mode="found" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/my-reports"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/explore"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentExplorePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/matches"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentMatchesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/recovery-requests"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentRecoveryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/notifications"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentNotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/settings"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentSettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin / Campus Security Portal Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/lost-reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReportsPage key="lost" reportType="lost" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/found-reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReportsPage key="found" reportType="found" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/matches"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminMatchesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/recovery-requests"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminRecoveryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/verification"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminVerificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/held-items"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminHeldItemsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/returned-items"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReturnedItemsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
