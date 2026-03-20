import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';

export function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;
            setMessage('Password updated successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#111827] mb-2">
                        Set new password
                    </h2>
                    <p className="text-[#4B5563] text-[14px] mb-8">
                        Please enter your new password below.
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleUpdate}>
                    {error && (
                        <div className="bg-red-50 font-medium text-red-600 p-3 rounded-lg flex items-center gap-2 text-[13px] border border-red-100">
                            <p>{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="bg-emerald-50 font-medium text-emerald-600 p-3 rounded-lg flex items-center gap-2 text-[13px] border border-emerald-100">
                            <p>{message}</p>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label htmlFor="password" className="block text-[13px] font-semibold text-[#111827]">
                            New Password<span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 bg-[#F9FAFB] border-0 rounded-xl text-[#111827] ring-1 ring-inset ring-[#F3F4F6] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-inset focus:ring-[#5438FF] sm:text-[14px] transition-all"
                                placeholder="New password"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="confirmPassword" className="block text-[13px] font-semibold text-[#111827]">
                            Confirm New Password<span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </div>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 bg-[#F9FAFB] border-0 rounded-xl text-[#111827] ring-1 ring-inset ring-[#F3F4F6] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-inset focus:ring-[#5438FF] sm:text-[14px] transition-all"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-xl bg-[#5438FF] px-3 py-3 text-[14px] font-medium text-white shadow-sm shadow-[#5438FF]/20 hover:bg-[#462EE5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5438FF] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-[13px] text-[#4B5563] font-medium">
                    Back to{' '}
                    <Link to="/login" className="font-semibold text-[#5438FF] hover:text-[#462EE5] transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
