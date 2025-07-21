

// src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const token = search.get('token');
  const email = search.get('email');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    try {
      await axios.post('https://pawprox-6dd216fb1ef5.herokuapp.com/api/auth/reset-password', {
        token,
        email,
        newPassword
      });
      setSuccess('Password reset successful! Redirecting to login…');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-6">Set a New Password</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-emerald-600 mb-4">{success}</p>}
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="w-full mb-4 p-3 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-3 rounded hover:bg-emerald-700"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
