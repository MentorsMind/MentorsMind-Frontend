import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../config/routes.config';
import type { AuthState } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  auth: AuthState;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, auth }) => {
  const location = useLocation();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-stellar border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Loading secure session...</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
