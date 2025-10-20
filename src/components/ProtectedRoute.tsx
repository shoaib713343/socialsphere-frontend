// src/components/ProtectedRoute.tsx
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import type { RootState } from '../store';
import React from 'react'; // 1. React ko import karna zaroori hai

// --- THIS IS THE FIX ---
// Hum JSX.Element ke bajaye React.ReactNode use karenge. Yeh zyaada standard hai.
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // 1. Agar logged in nahi hai, toh login page par bhejo
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Agar logged in hai lekin verified nahi, toh verify page par bhejo
  if (user && !user.isEmailVerified && location.pathname !== '/verify-phone') {
    return <Navigate to="/please-verify" replace />;
  }
  
  // 3. Agar sab theek hai, toh page dikhao
  return <>{children}</>; // Children ko Fragment ke andar wrap karna aachi practice hai
};

export default ProtectedRoute;