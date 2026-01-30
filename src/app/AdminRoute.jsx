import { Navigate } from 'react-router-dom'
import { getRole, isLoggedIn } from '../store/authStore'

export default function AdminRoute({ children }) {
  const role = getRole()
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  if (role !== 'admin' && role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return children
}
