import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Verifying access...</span>
        </div>
      </div>
    );
  }

  // Content requires sign-in
  if (!isAuthenticated) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return (
      <Navigate
        to={`/login?redirect=${redirectUrl}&msg=auth_required`}
        replace
      />
    );
  }

  // Admin section requires admin privileges
  if (adminOnly && !isAdmin) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return (
      <Navigate
        to={`/login?role=admin&redirect=${redirectUrl}&msg=admin_required`}
        replace
      />
    );
  }

  return <>{children}</>;
};
