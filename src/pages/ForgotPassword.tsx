import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            setMessage('Check your email for the password reset link.');
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
                        Reset your password
                    </h2>
                    <p className="text-[#4B5563] text-[14px] mb-8">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleReset}>
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
                        <label htmlFor="email" className="block text-[13px] font-semibold text-[#111827]">
                            Email Address<span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 bg-[#F9FAFB] border-0 rounded-xl text-[#111827] ring-1 ring-inset ring-[#F3F4F6] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-inset focus:ring-[#5438FF] sm:text-[14px] transition-all"
                                placeholder="you@agency.com"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-xl bg-[#5438FF] px-3 py-3 text-[14px] font-medium text-white shadow-sm shadow-[#5438FF]/20 hover:bg-[#462EE5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5438FF] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-[13px] text-[#4B5563] font-medium">
                    Remember your password?{' '}
                    <Link to="/login" className="font-semibold text-[#5438FF] hover:text-[#462EE5] transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
