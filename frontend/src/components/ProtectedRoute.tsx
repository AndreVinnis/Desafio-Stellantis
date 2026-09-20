import { Navigate, Outlet } from 'react-router'
import { tokenStorage } from '../api/client'

export default function ProtectedRoute() {
  if (!tokenStorage.get()) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
