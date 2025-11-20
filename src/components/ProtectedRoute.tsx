import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  redirectTo = '/auth'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Save the attempted location for redirect after login
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    )
  }

  return <>{children}</>
}

// Component for public routes that should redirect to dashboard if user is already authenticated
export function PublicRoute({
  children,
  redirectTo = '/dashboard'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    // If user is already authenticated, redirect to dashboard
    // but allow access to the originally requested page if it was a specific public route
    const from = location.state?.from
    if (from && from.pathname !== '/auth') {
      return <Navigate to={from} replace />
    }
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}