import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword as apiResetPassword } from '../lib/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            toast.error('Reset token not found in URL.');
        }
    }, [searchParams]);

    const validateForm = () => {
        let isValid = true;

        if (!password.trim()) {
            setPasswordError('New password is required.');
            isValid = false;
        } else if (password.trim().length < 6) {
            setPasswordError('New password must be at least 6 characters long.');
            isValid = false;
        } else {
            setPasswordError(null);
        }

        if (!confirmPassword.trim()) {
            setConfirmPasswordError('Confirm password is required.');
            isValid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match.');
            isValid = false;
        } else {
            setConfirmPasswordError(null);
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!token) {
            toast.error('Invalid or missing reset token.');
            return;
        }
        
        const promise = apiResetPassword(token, password);

        toast.promise(promise, {
            loading: 'Resetting password...',
            success: 'Password has been reset successfully!',
            error: (err: any) => {
                return err.message || 'Failed to reset password. Please try again.';
            }
        });
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Reset Password</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="label">
                            <span className="text-base label-text">New Password</span>
                        </label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            className={`w-full input input-bordered ${passwordError ? 'border-red-500' : ''}`}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setPasswordError(null);
                            }}
                        />
                        {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                    </div>
                    <div>
                        <label className="label">
                            <span className="text-base label-text">Confirm New Password</span>
                        </label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            className={`w-full input input-bordered ${confirmPasswordError ? 'border-red-500' : ''}`}
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setConfirmPasswordError(null);
                            }}
                        />
                        {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
                    </div>
                    <div>
                        <button type="submit" className="w-full btn btn-primary">
                            Reset Password
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center">
                    Remembered your password?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
