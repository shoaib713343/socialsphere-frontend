// src/pages/PleaseVerifyPage.tsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logOut } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Use the smart instance

const PleaseVerifyPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleResend = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await api.post('/auth/resend-verification', {});
      setMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend email.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 text-center bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-extrabold text-gray-900">Please Verify Your Email</h2>
        <p className="mt-4 text-gray-600">We've sent a verification link to <strong>{user?.email}</strong>. Please check your inbox (and spam folder) to continue.</p>
        <div className="mt-8 space-y-4">
          <button onClick={handleResend} disabled={loading} className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>
          <button onClick={handleLogout} className="w-full px-4 py-2 text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50">Logout</button>
        </div>
        {message && <p className="mt-4 text-green-600">{message}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
    </div>
  );
};
export default PleaseVerifyPage;