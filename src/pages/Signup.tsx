import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';

export function Signup() {
    const [searchParams] = useSearchParams();
    const [name, setName] = useState('');
    const [agencyName, setAgencyName] = useState('');
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        agency_name: agencyName
                    }
                }
            });

            if (error) throw error;

            if (data.user) {
                const isInvited = searchParams.get('email');
                navigate(isInvited ? '/' : '/onboarding');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during account creation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#111827] mb-8">
                        Create your account
                    </h2>
                </div>

                <form className="space-y-4" onSubmit={handleSignup}>

                    {error && (
                        <div className="bg-red-50 font-medium text-red-600 p-3 rounded-lg flex items-center gap-2 text-[13px] border border-red-100">
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label htmlFor="name" className="block text-[13px] font-semibold text-[#111827]">
                            Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </div>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 bg-[#F9FAFB] border-0 rounded-xl text-[#111827] ring-1 ring-inset ring-[#F3F4F6] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-inset focus:ring-[#5438FF] sm:text-[14px] transition-all"
                                placeholder="Enter your name"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-[13px] font-semibold text-[#111827]">
                            Email<span className="text-rose-500">*</span>
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
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    {!searchParams.get('email') && (
                        <div className="space-y-1.5">
                            <label htmlFor="agency" className="block text-[13px] font-semibold text-[#111827]">
                                Agency Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                </div>
                                <input
                                    id="agency"
                                    name="agency"
                                    type="text"
                                    value={agencyName}
                                    onChange={(e) => setAgencyName(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-[#F9FAFB] border-0 rounded-xl text-[#111827] ring-1 ring-inset ring-[#F3F4F6] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-inset focus:ring-[#5438FF] sm:text-[14px] transition-all"
                                    placeholder="Enter agency name"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label htmlFor="password" className="block text-[13px] font-semibold text-[#111827]">
                            Password<span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 bg-[#F9FAFB] border-0 rounded-xl text-[#111827] ring-1 ring-inset ring-[#F3F4F6] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-inset focus:ring-[#5438FF] sm:text-[14px] transition-all"
                                placeholder="Create password"
                            />
                        </div>
                        <p className="text-[12px] text-[#6B7280] pt-1">Must be at least 8 characters.</p>
                    </div>

                    <div className="pt-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-xl bg-[#5438FF] px-3 py-3 text-[14px] font-medium text-white shadow-sm shadow-[#5438FF]/20 hover:bg-[#462EE5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5438FF] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Sign Up'}
                        </button>
                    </div>

                </form>


                <p className="mt-8 text-center text-[13px] text-[#4B5563] font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-[#5438FF] hover:text-[#462EE5] transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout >
    );
}
