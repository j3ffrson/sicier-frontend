import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'

import Login from '../pages/auth/Login'
import Dashboard from '../pages/dashboard/Dashboard'
import NewRequest from '../pages/requests/NewRequest'
import NewReport from '../pages/reports/NewReport'
import RequestInbox from '../pages/requests/Inbox'
import ReportInbox from '../pages/reports/Inbox'
import Sent from '../pages/requests/Sent'
import RequestHistory from '../pages/requests/History'
import ReportHistory from '../pages/reports/History'
import Charts from '../pages/analytics/Charts'
import Users from '../pages/admin/Users'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests/new"
        element={
          <ProtectedRoute>
            <NewRequest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/new"
        element={
          <ProtectedRoute>
            <NewReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests/inbox"
        element={
          <ProtectedRoute>
            <RequestInbox />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/inbox"
        element={
          <ProtectedRoute>
            <ReportInbox />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests/sent"
        element={
          <ProtectedRoute>
            <Sent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests/history"
        element={
          <ProtectedRoute>
            <RequestHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/history"
        element={
          <ProtectedRoute>
            <ReportHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics/charts"
        element={
          <ProtectedRoute>
            <Charts />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <Users />
          </AdminRoute>
        }
      />

      <Route path="*" element={<div className="p-6">404</div>} />
    </Routes>
  )
}
