// src/pages/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Forgot Your Password?</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your email and we'll send you a reset link.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <input name="email" type="email" required className="w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {message && (<div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">{message}</div>)}
          {error && (<div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>)}
          <div><button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Send Reset Link</button></div>
        </form>
        <div className="text-sm text-center">
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Back to login</Link>
        </div>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;