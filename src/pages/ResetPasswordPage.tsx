// src/pages/ResetPasswordPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!token) { setError('Invalid or missing token.'); return; }
    try {
      await api.post(`/auth/reset-password/${token}`, { newPassword, passwordConfirm });
      setMessage('Password has been reset successfully! Redirecting to login...');
      setTimeout(() => { navigate('/login'); }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Reset Your Password</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input name="newPassword" type="password" required className="w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <input name="passwordConfirm" type="password" required className="w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md" placeholder="Confirm New Password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
          </div>
          {message && (<div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">{message}</div>)}
          {error && (<div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>)}
          <div><button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Reset Password</button></div>
        </form>
      </div>
    </div>
  );
};
export default ResetPasswordPage;