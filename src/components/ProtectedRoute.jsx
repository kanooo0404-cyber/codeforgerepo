import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#303BFA] flex items-center justify-center">
        <div className="bg-white/95 rounded-3xl px-8 py-6 shadow-panel flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#303BFA] border-t-transparent rounded-full animate-spin" />
          <span className="font-heading font-semibold text-[#11183B]">Loading FoundIt...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const fallback = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
