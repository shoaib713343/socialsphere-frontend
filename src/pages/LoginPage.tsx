// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import type { RootState } from '../store';
import api from '../api/axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      dispatch(
        setCredentials({
          user: response.data.data.user,
          token: response.data.data.accessToken,
        })
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Sign in to SocialSphere</h2>
        </div>
        <div className="space-y-4">
          <div>
            <a href="http://localhost:8000/api/v1/auth/google" className="relative flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm group hover:bg-gray-50">
              <img className="w-5 h-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
              Sign in with Google
            </a>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
            <div className="relative px-2 text-sm text-gray-600 bg-white">Or continue with</div>
          </div>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div><input id="email-address" name="email" type="email" required className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><input id="password" name="password" type="password" required className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          </div>
          {error && (<div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>)}
          <div className="flex items-center justify-end">
            <div className="text-sm"><Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">Forgot your password?</Link></div>
          </div>
          <div><button type="submit" className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700">Sign in</button></div>
        </form>
        <div className="text-sm text-center">
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Don't have an account? Sign up</Link>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;