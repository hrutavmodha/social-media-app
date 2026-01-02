import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login as apiLogin, getProfile } from '../lib/api';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Invalid email format.');
      isValid = false;
    } else {
      setEmailError(null);
    }

    if (!password.trim()) {
      setPasswordError('Password is required.');
      isValid = false;
    } else {
      setPasswordError(null);
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const promise = apiLogin(email, password);
    toast.promise(promise, {
      loading: 'Logging in...',
      success: () => {
        getProfile().then(profileData => {
            if (profileData && profileData.id) {
              login({ id: profileData.id, name: profileData.name, profile_url: profileData.profile_url });
            } else {
              console.error('Profile data or user ID missing after login. Authentication context will not be updated.');
            }
            navigate('/');
        }).catch(err => {
            console.error('Error fetching profile after login:', err);
            toast.error('Failed to fetch profile after login.');
        });
        return 'Logged in successfully!';
      },
      error: (err: any) => {
        // Display specific error message from server if available, otherwise a generic one
        return err.message || 'Login failed. Please check your credentials.';
      }
    });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Login to your account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">
              <span className="text-base label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="Email"
              className={`w-full input input-bordered ${emailError ? 'border-red-500' : ''}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null); // Clear error on change
              }}
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>
          <div>
            <label className="label">
              <span className="text-base label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              className={`w-full input input-bordered ${passwordError ? 'border-red-500' : ''}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null); // Clear error on change
              }}
            />
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>
          <p className="text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
          <p className="text-sm">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </p>
          <div>
            <button type="submit" className="w-full btn btn-primary">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
