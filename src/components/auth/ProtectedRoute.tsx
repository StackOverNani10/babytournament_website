import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type User } from '@/context/auth/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole = 'user',
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading, checkAuth } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuth();
      if (isAuth && user) {
        setIsAuthorized(user.role === 'admin' || requiredRole === 'user');
      } else {
        setIsAuthorized(false);
      }
    };

    verifyAuth();
  }, [checkAuth, user, requiredRole]);

  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Add a hook for easier usage in components
export const useProtectedRoute = (requiredRole: 'admin' | 'user' = 'user') => {
  const { isAuthenticated, user, isLoading, checkAuth } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuth();
      if (isAuth && user) {
        setIsAuthorized(user.role === 'admin' || requiredRole === 'user');
      } else {
        setIsAuthorized(false);
      }
    };

    verifyAuth();
  }, [checkAuth, user, requiredRole]);

  return {
    isAuthenticated,
    isAuthorized,
    isLoading,
    user,
  };
};
