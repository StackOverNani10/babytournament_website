import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Set session in local storage
          localStorage.setItem('access_token', session.access_token);
          localStorage.setItem('refresh_token', session.refresh_token);
          
          // Get user data
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) throw error;

          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.role
          });
        }
      } catch (error) {
        console.error('Session check failed:', error);
        await supabase.auth.signOut();
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.session) throw new Error('No session returned');

      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) throw userError;

      // Store tokens
      localStorage.setItem('access_token', data.session.access_token);
      localStorage.setItem('refresh_token', data.session.refresh_token);

      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role
      });

      navigate('/admin');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const checkAuth = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        await logout();
        return false;
      }

      // Check if token is expired
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      if (expiresAt < Date.now()) {
        // Try to refresh token
        const { data: refreshedSession, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token: session.refresh_token
        });

        if (refreshError || !refreshedSession.session) {
          await logout();
          return false;
        }

        // Update tokens
        localStorage.setItem('access_token', refreshedSession.session.access_token);
        localStorage.setItem('refresh_token', refreshedSession.session.refresh_token);
      }

      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      await logout();
      return false;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Add JWT interceptor for API calls
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const authToken = localStorage.getItem('access_token');
  
  // Add authorization header if token exists
  if (authToken) {
    init = init || {};
    init.headers = {
      ...init.headers,
      'Authorization': `Bearer ${authToken}`,
    };
  }
  
  const response = await originalFetch(input, init);
  
  // Handle 401 Unauthorized
  if (response.status === 401) {
    const auth = useAuth();
    const isRefreshed = await auth.checkAuth();
    
    if (isRefreshed) {
      // Retry the original request with new token
      const newAuthToken = localStorage.getItem('access_token');
      if (newAuthToken && init) {
        init.headers = {
          ...init.headers,
          'Authorization': `Bearer ${newAuthToken}`,
        };
        return originalFetch(input, init);
      }
    }
  }
  
  return response;
};
