import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword as apiForgotPassword } from '../lib/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const promise = apiForgotPassword(email);

    toast.promise(promise, {
      loading: 'Sending password reset email...',
      success: 'Password reset email sent! Please check your inbox.',
      error: (err: any) => {
        return err.message;
      }
    });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Forgot Password</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">
              <span className="text-base label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="Email"
              className="w-full input input-bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <button type="submit" className="w-full btn btn-primary">
              Send Password Reset Email
            </button>
          </div>
        </form>
        <p className="text-sm text-center">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
