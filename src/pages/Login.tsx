import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'An error occurred during sign in.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#111827] mb-8">
                        Sign in to your Agency account
                    </h2>
                </div>

                <form className="space-y-4" onSubmit={handleLogin}>

                    {error && (
                        <div className="bg-red-50 font-medium text-red-600 p-3 rounded-lg flex items-center gap-2 text-[13px] border border-red-100">
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-[13px] font-semibold text-[#111827]">
                            Work Email<span className="text-rose-500">*</span>
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

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-[13px] font-semibold text-[#111827]">
                                Password<span className="text-rose-500">*</span>
                            </label>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 bg-[#F9FAFB] border-0 rounded-xl text-[#111827] ring-1 ring-inset ring-[#F3F4F6] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-inset focus:ring-[#5438FF] sm:text-[14px] transition-all"
                                placeholder="Enter password"
                            />
                        </div>
                        <div className="text-right pt-1">
                            <a href="#" className="font-medium text-[12px] text-[#5438FF] hover:text-[#462EE5] transition-colors">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-xl bg-[#5438FF] px-3 py-3 text-[14px] font-medium text-white shadow-sm shadow-[#5438FF]/20 hover:bg-[#462EE5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5438FF] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>

                </form>

                <div className="relative mt-8">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-[#E5E7EB]" />
                    </div>
                    <div className="relative flex justify-center text-sm font-medium leading-6">
                        <span className="bg-white px-4 text-[#9CA3AF] text-[12px]">or continue with</span>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-[14px] font-semibold text-[#111827] shadow-sm ring-1 ring-inset ring-[#E5E7EB] hover:bg-[#F9FAFB] focus-visible:ring-transparent transition-colors">
                        <svg className="h-[18px] w-[18px]" aria-hidden="true" viewBox="0 0 24 24">
                            <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                            <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                            <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                            <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                        </svg>
                        <span className="leading-6">Google</span>
                    </button>
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-[14px] font-semibold text-[#111827] shadow-sm ring-1 ring-inset ring-[#E5E7EB] hover:bg-[#F9FAFB] focus-visible:ring-transparent transition-colors">
                        <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.492-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.701z" />
                        </svg>
                        <span className="leading-6">Apple</span>
                    </button>
                </div>

                <p className="mt-8 text-center text-[13px] text-[#4B5563] font-medium">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-semibold text-[#5438FF] hover:text-[#462EE5] transition-colors">
                        Create Account
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
