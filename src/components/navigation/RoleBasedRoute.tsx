import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../config/routes.config';
import type { UserRole, AuthState } from '../../types';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  auth: AuthState;
  allowedRoles: UserRole[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, auth, allowedRoles }) => {
  if (auth.isLoading) {
    return null; // Let ProtectedRoute handle loading if they are used together
  }

  if (!auth.user || !allowedRoles.includes(auth.user.role)) {
    // If not allowed, redirect to dashboard or home
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};
