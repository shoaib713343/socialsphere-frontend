// src/components/ProtectedRoute.tsx
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import type { RootState } from '../store';
import React from 'react'; // Import React

// --- THIS IS THE FIX ---
// We will use React.ReactNode, which is a more flexible and standard type for the 'children' prop.
// This avoids the specific 'JSX' namespace issue.
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // 1. If not logged in, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If logged in but NOT verified, redirect to the verify page
  if (!user?.isEmailVerified && location.pathname !== '/verify-phone') {
    return <Navigate to="/please-verify" replace />;
  }
  
  // 3. If logged in AND verified, allow access
  return <>{children}</>; // Wrap children in a fragment
};

export default ProtectedRoute;