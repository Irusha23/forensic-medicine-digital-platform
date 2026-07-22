import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'If the email exists, a reset link has been sent.');
      if (res.data._test_token) {
        console.log("Mock Token for Testing:", res.data._test_token);
        // For testing purposes, auto-redirect to reset password if a mock token is provided
        setTimeout(() => navigate(`/reset-password?token=${res.data._test_token}`), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 border border-gray-300">
        <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 text-sm">{error}</div>}
        {message && <div className="bg-green-100 text-green-700 p-2 mb-4 text-sm">{message}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              className="w-full border border-gray-300 p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
