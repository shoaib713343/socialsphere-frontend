// src/pages/EmailVerificationPage.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Verification token not found.');
      return;
    }

    const verifyEmail = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        // The backend now handles the redirect, but we have this page as a fallback.
        // In a perfect flow, you might not even see this page.
        setStatus('success');
        setMessage('Email verified successfully! You will be redirected.');
        setTimeout(() => navigate('/'), 2000); // Redirect to home after 2 seconds
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md">
        {status === 'verifying' && <p className="text-gray-600">{message}</p>}
        {status === 'success' && (
          <div>
            <h2 className="text-2xl font-bold text-green-600">Success!</h2>
            <p className="mt-2 text-gray-600">{message}</p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <h2 className="text-2xl font-bold text-red-600">Error</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <Link to="/register" className="mt-4 inline-block px-4 py-2 text-white bg-gray-600 rounded-md">
              Try registering again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
export default EmailVerificationPage;