import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1b2827] flex items-center justify-center text-[#a4b8b5]">
        <LoadingSpinner text="Authenticating KSBC credentials..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // All authenticated personnel have full navigation access for smooth operations
  return children;
};
export default ProtectedRoute;
