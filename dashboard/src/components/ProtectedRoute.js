import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from 'src/context/AuthContext'
import { CSpinner } from '@coreui/react'

const ProtectedRoute = ({ children, requireSuperAdmin = false }) => {
  const { isAuthenticated, isSuperAdmin, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <CSpinner color="primary" />
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If super admin is required but user is not super admin
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  // If authenticated (and super admin if required), render children
  return children
}

export default ProtectedRoute
