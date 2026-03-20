import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Mail } from 'lucide-react';

export function SignupSuccess() {
    return (
        <AuthLayout>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        < Mail className="w-10 h-10 text-emerald-600" />
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold tracking-tight text-[#111827] mb-2">
                    Verify your email
                </h2>
                <p className="text-[#4B5563] text-[14px] mb-8 max-w-sm mx-auto">
                    We've sent a verification link to your email address. Please click the link to activate your account.
                </p>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left mb-8">
                    <h3 className="text-[13px] font-bold text-[#111827] mb-3 flex items-center gap-2">
                        Next steps:
                    </h3>
                    <ul className="space-y-3 text-[13px] text-[#4B5563]">
                        <li className="flex gap-2">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[11px] font-bold">1</span>
                            Check your inbox (and spam folder)
                        </li>
                        <li className="flex gap-2">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[11px] font-bold">2</span>
                            Click the activation link in the email
                        </li>
                        <li className="flex gap-2">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[11px] font-bold">3</span>
                            Login to your new dashboard
                        </li>
                    </ul>
                </div>

                <Link
                    to="/login"
                    className="flex w-full justify-center rounded-xl bg-[#5438FF] px-3 py-3 text-[14px] font-medium text-white shadow-sm shadow-[#5438FF]/20 hover:bg-[#462EE5] transition-all active:scale-[0.98]"
                >
                    Back to Sign In
                </Link>

                <p className="mt-8 text-[13px] text-[#9CA3AF]">
                    Didn't receive the email? Check your junk folder or contact support if the issue persists.
                </p>
            </div>
        </AuthLayout>
    );
}
