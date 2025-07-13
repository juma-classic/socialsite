import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Auth helper functions
export const authService = {
  // Sign up new user
  signUp: async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Sign in user
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Sign out user
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error }
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    } catch (error) {
      return { user: null, error }
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default supabase
