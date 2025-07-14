import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { user, error } = await authService.getCurrentUser();
        if (user && !error) {
          setUser(user);
          setSession(user);
        } else {
          // DEVELOPMENT OVERRIDE: Use dummy user from localStorage if present
          const devUser = localStorage.getItem('devUser');
          if (devUser) {
            const parsed = JSON.parse(devUser);
            setUser({
              id: 'dev-user',
              email: parsed.email || 'dev@local.test',
              user_metadata: { fullName: parsed.fullName || 'Developer' }
            });
            setSession({ user: { email: parsed.email || 'dev@local.test' } });
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        if (session?.user) {
          setUser(session.user);
          setSession(session);
        } else {
          // DEVELOPMENT OVERRIDE: Use dummy user from localStorage if present
          const devUser = localStorage.getItem('devUser');
          if (devUser) {
            const parsed = JSON.parse(devUser);
            setUser({
              id: 'dev-user',
              email: parsed.email || 'dev@local.test',
              user_metadata: { fullName: parsed.fullName || 'Developer' }
            });
            setSession({ user: { email: parsed.email || 'dev@local.test' } });
          } else {
            setUser(null);
            setSession(null);
          }
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, userData = {}) => {
    setLoading(true);
    try {
      const result = await authService.signUp(email, password, userData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const result = await authService.signOut();
      setUser(null);
      setSession(null);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await authService.signInWithGoogle();
      return result;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    return await authService.resetPassword(email);
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
