import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { 
  supabase, 
  signIn as supabaseSignIn, 
  signOut as supabaseSignOut,
  signUp as supabaseSignUp,
  mergeGuestCartToUser
} from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: any, currentSession: Session | null) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user: authUser } = await supabaseSignIn(email, password);
      
      // Merge guest cart if exists
      if (authUser) {
        try {
          await mergeGuestCartToUser(authUser.id);
        } catch (error) {
          console.error('Error merging guest cart:', error);
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabaseSignOut();
      // Auth state will be updated by the onAuthStateChange listener
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      const { user: newUser } = await supabaseSignUp(email, password, username);
      
      // Note: Supabase may require email confirmation depending on settings
      // If email confirmation is enabled, user will need to verify email first
      if (newUser) {
        // Optionally merge guest cart
        try {
          await mergeGuestCartToUser(newUser.id);
        } catch (error) {
          console.error('Error merging guest cart during registration:', error);
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Parse Supabase error messages
      if (error.message.includes('already registered')) {
        throw new Error('This email is already registered. Please sign in instead.');
      } else if (error.message.includes('password')) {
        throw new Error('Password must be at least 6 characters long.');
      } else if (error.message.includes('email')) {
        throw new Error('Please provide a valid email address.');
      }
      
      throw new Error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};