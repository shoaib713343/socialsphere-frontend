// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type{ RootState, AppDispatch } from './store';
import { io, Socket } from 'socket.io-client';
import { addNotification } from './store/notificationsSlice';

// Import all pages and components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LoginSuccessPage from './pages/LoginSuccessPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import PhoneVerificationPage from './pages/PhoneVerificationPage';
import ChatPage from './pages/ChatPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PleaseVerifyPage from './pages/PleaseVerifyPage';

function App() {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && token && !socketRef.current) {
      // --- THIS IS THE FIX ---
      // The VITE_API_BASE_URL is 'https://.../api/v1'. The socket connects to the base domain.
      const socketUrl = import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '');
      const socket: Socket = io(socketUrl, { auth: { token } });
      // --- END OF FIX ---
      
      socketRef.current = socket;
      socket.on('newNotification', (notification) => {
        dispatch(addNotification(notification));
      });
    } else if (!isAuthenticated && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, token, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage socket={socketRef.current} /></ProtectedRoute>} />
          <Route path="/verify-phone" element={<ProtectedRoute><PhoneVerificationPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
          <Route path="/profile/:username?" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/please-verify" element={<ProtectedRoute><PleaseVerifyPage /></ProtectedRoute>} />

          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login-success" element={<LoginSuccessPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;