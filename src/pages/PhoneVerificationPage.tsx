// src/pages/PhoneVerificationPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const PhoneVerificationPage = () => {
  const [step, setStep] = useState<'enter_phone' | 'enter_otp'>('enter_phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/users/me/phone', { phoneNumber });
      setMessage('OTP sent. Please check your backend console for the mocked OTP.');
      setStep('enter_otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/users/me/phone/verify', { otp });
      setMessage('Phone number verified successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify OTP.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        {step === 'enter_phone' ? (
          <div>
            <h2 className="text-2xl font-bold text-center">Verify Your Phone Number</h2>
            <form className="mt-6 space-y-6" onSubmit={handleSendOtp}>
              <input type="tel" placeholder="+919876543210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md" />
              <button type="submit" className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md">Send OTP</button>
            </form>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-center">Enter OTP</h2>
            <form className="mt-6 space-y-6" onSubmit={handleVerifyOtp}>
              <input type="text" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} required className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md" />
              <button type="submit" className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md">Verify</button>
            </form>
          </div>
        )}
        {message && <p className="mt-4 text-center text-green-600">{message}</p>}
        {error && <p className="mt-4 text-center text-red-600">{error}</p>}
        <div className="text-sm text-center">
          <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};
export default PhoneVerificationPage;