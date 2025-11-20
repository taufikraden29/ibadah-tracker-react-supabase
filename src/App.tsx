import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

import { useAuth } from './hooks/useAuth'
import { Navigation } from './components/Navigation'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import { AuthForms } from './components/auth/AuthForms'
import Dashboard from './pages/Dashboard'
import PrayerTracker from './pages/PrayerTracker'
import QuranLogger from './pages/QuranLogger'
import './index.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-600"
          >
            Loading Ibadah Tracker...
          </motion.p>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/auth" element={
          <PublicRoute>
            <AuthForms />
          </PublicRoute>
        } />

        <Route path="/" element={
          <ProtectedRoute>
            <Navigation />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="prayers" element={<PrayerTracker />} />
          <Route path="quran" element={<QuranLogger />} />
          <Route path="profile" element={
            <div className="container mx-auto py-8 px-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
              <p className="text-gray-600">Profile settings coming soon...</p>
            </div>
          } />
        </Route>

        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-8">Page not found</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go Back
              </motion.button>
            </motion.div>
          </div>
        } />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
        <Toaster
          position="top-right"
          richColors
          closeButton
          expand={false}
          duration={4000}
        />
      </Router>
    </QueryClientProvider>
  )
}

export default App