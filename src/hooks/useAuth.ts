import { useState, useEffect } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          setAuthState(prev => ({ ...prev, error, loading: false }))
          return
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
        })
      } catch (error) {
        console.error('Error getting initial session:', error)
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)

        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
        })
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      if (error) {
        setAuthState(prev => ({ ...prev, error, loading: false }))
        return { success: false, error }
      }

      setAuthState(prev => ({
        ...prev,
        user: data.user,
        session: data.session,
        loading: false,
      }))

      return { success: true, data }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, error: authError, loading: false }))
      return { success: false, error: authError }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setAuthState(prev => ({ ...prev, error, loading: false }))
        return { success: false, error }
      }

      setAuthState(prev => ({
        ...prev,
        user: data.user,
        session: data.session,
        loading: false,
      }))

      return { success: true, data }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, error: authError, loading: false }))
      return { success: false, error: authError }
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })

      if (error) {
        setAuthState(prev => ({ ...prev, error, loading: false }))
        return { success: false, error }
      }

      // OAuth redirect will handle the rest
      return { success: true, data }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, error: authError, loading: false }))
      return { success: false, error: authError }
    }
  }

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))

      const { error } = await supabase.auth.signOut()

      if (error) {
        setAuthState(prev => ({ ...prev, error, loading: false }))
        return { success: false, error }
      }

      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      })

      return { success: true }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, error: authError, loading: false }))
      return { success: false, error: authError }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        return { success: false, error }
      }

      return { success: true }
    } catch (error) {
      const authError = error as AuthError
      return { success: false, error: authError }
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        setAuthState(prev => ({ ...prev, error, loading: false }))
        return { success: false, error }
      }

      setAuthState(prev => ({
        ...prev,
        user: data.user,
        loading: false,
      }))

      return { success: true, data }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, error: authError, loading: false }))
      return { success: false, error: authError }
    }
  }

  return {
    ...authState,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
  }
}

export type { AuthState }