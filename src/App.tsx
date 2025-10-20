// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react'; // Import useState, remove useRef
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
  
  // --- THIS IS THE FIX ---
  // We use useState instead of useRef.
  // This ensures that when the socket is created, the component re-renders
  // and passes the new socket prop to ChatPage.
  const [socket, setSocket] = useState<Socket | null>(null);
  // --- END OF FIX ---

  useEffect(() => {
    if (isAuthenticated && token && !socket) {
      const socketUrl = (import.meta.env.VITE_API_BASE_URL || '').replace('/api/v1', '');
      const newSocket: Socket = io(socketUrl, { auth: { token } });
      
      setSocket(newSocket); // Save the socket to state, triggering a re-render

      newSocket.on('newNotification', (notification) => {
        dispatch(addNotification(notification));
      });
    } else if (!isAuthenticated && socket) {
      socket.disconnect();
      setSocket(null);
    }

    // Cleanup function
    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [isAuthenticated, token, dispatch, socket]); // Add 'socket' to dependency array

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage socket={socket} /></ProtectedRoute>} />
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