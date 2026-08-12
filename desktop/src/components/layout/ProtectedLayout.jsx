import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedLayout = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to respective default dashboard based on user role
    const defaultRoute = 
      user?.role === 'reception' ? '/reception' :
      user?.role === 'admin' ? '/admin' : '/doctor';
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
};
