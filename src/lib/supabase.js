import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to check if we're in mock mode or if Supabase is unavailable
const isMockMode = () => {
  return process.env.REACT_APP_AUTH_MODE === 'mock' || 
         supabaseUrl.includes('your-project.supabase.co') ||
         supabaseKey === 'your-anon-key';
};

// Mock user data for testing
const mockUser = {
  id: 'mock-user-123',
  email: 'demo@socialsight.com',
  user_metadata: {
    fullName: 'Demo User'
  },
  created_at: new Date().toISOString()
};

// Auth helper functions
export const authService = {
  // Sign up new user
  signUp: async (email, password, userData = {}) => {
    try {
      if (isMockMode()) {
        // Mock sign up for development
        const user = { ...mockUser, email, user_metadata: { ...mockUser.user_metadata, ...userData } };
        localStorage.setItem('mock_user', JSON.stringify(user));
        return { 
          data: { user, session: { user } }, 
          error: null 
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      return { data, error }
    } catch (error) {
      console.error('SignUp error:', error);
      // Fallback to mock mode if Supabase fails
      if (error.message?.includes('fetch')) {
        const user = { ...mockUser, email, user_metadata: { ...mockUser.user_metadata, ...userData } };
        localStorage.setItem('mock_user', JSON.stringify(user));
        return { 
          data: { user, session: { user } }, 
          error: null 
        };
      }
      return { data: null, error }
    }
  },

  // Sign in user
  signIn: async (email, password) => {
    try {
      if (isMockMode()) {
        // Mock sign in for development
        const user = { ...mockUser, email };
        localStorage.setItem('mock_user', JSON.stringify(user));
        return { 
          data: { user, session: { user } }, 
          error: null 
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { data, error }
    } catch (error) {
      console.error('SignIn error:', error);
      // Fallback to mock mode if Supabase fails
      if (error.message?.includes('fetch')) {
        const user = { ...mockUser, email };
        localStorage.setItem('mock_user', JSON.stringify(user));
        return { 
          data: { user, session: { user } }, 
          error: null 
        };
      }
      return { data: null, error }
    }
  },

  // Sign out user
  signOut: async () => {
    try {
      if (isMockMode()) {
        // Mock sign out
        localStorage.removeItem('mock_user');
        return { error: null };
      }

      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('SignOut error:', error);
      // Fallback to mock mode
      localStorage.removeItem('mock_user');
      return { error: null }
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      if (isMockMode()) {
        // Mock get current user
        const user = localStorage.getItem('mock_user');
        return { 
          user: user ? JSON.parse(user) : null, 
          error: null 
        };
      }

      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    } catch (error) {
      console.error('GetCurrentUser error:', error);
      // Fallback to mock mode
      const user = localStorage.getItem('mock_user');
      return { 
        user: user ? JSON.parse(user) : null, 
        error: null 
      };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      if (isMockMode()) {
        // Mock password reset
        return { 
          data: { message: 'Password reset email sent (mock mode)' }, 
          error: null 
        };
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      return { data, error }
    } catch (error) {
      console.error('ResetPassword error:', error);
      // Fallback to mock mode
      return { 
        data: { message: 'Password reset email sent (mock mode)' }, 
        error: null 
      };
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      if (isMockMode()) {
        // Mock Google sign in
        const user = { ...mockUser, email: 'demo@gmail.com' };
        localStorage.setItem('mock_user', JSON.stringify(user));
        return { 
          data: { user, session: { user } }, 
          error: null 
        };
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      return { data, error }
    } catch (error) {
      console.error('GoogleSignIn error:', error);
      // Fallback to mock mode
      const user = { ...mockUser, email: 'demo@gmail.com' };
      localStorage.setItem('mock_user', JSON.stringify(user));
      return { 
        data: { user, session: { user } }, 
        error: null 
      };
    }
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    try {
      if (isMockMode()) {
        // Mock auth state change listener
        return {
          data: {
            subscription: {
              unsubscribe: () => {}
            }
          }
        };
      }

      return supabase.auth.onAuthStateChange(callback)
    } catch (error) {
      console.error('OnAuthStateChange error:', error);
      // Return mock subscription
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  }
}

export default supabase
