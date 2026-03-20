import { Link, useLocation } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';

export function SignupSuccess() {
    const location = useLocation();
    const email = location.state?.email || 'your email';

    return (
        <AuthLayout>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full text-center flex flex-col items-center">
                {/* 3D Envelope Icon */}
                <div className="relative mb-10 group">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-[#5438FF]/20 to-pink-500/20 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                    <img 
                        src="/envelope_check_icon.png" 
                        alt="Success" 
                        className="relative w-48 h-48 object-contain drop-shadow-2xl animate-float"
                    />
                </div>
                
                <h2 className="text-[32px] font-bold tracking-tight text-[#111827] mb-1">
                    You're ready to go!
                </h2>
                <h3 className="text-[28px] font-bold tracking-tight text-[#111827] mb-6">
                    Check your email to begin.
                </h3>
                
                <p className="text-[#6B7280] text-[15px] leading-relaxed mb-10 max-w-sm">
                    Please check your email <span className="font-semibold text-[#111827]">'{email}'</span> and click <span className="font-semibold text-[#111827]">'confirm your mail'</span> button to complete your sign up.
                </p>

                <div className="w-full max-w-xs space-y-4">
                    <a
                        href="https://mail.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full rounded-2xl bg-white px-6 py-4 text-[15px] font-bold text-[#374151] border border-[#E5E7EB] hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Open Gmail
                    </a>
                </div>

                <p className="mt-10 text-[14px] text-[#6B7280]">
                    Didn't receive the code?{' '}
                    <button className="font-bold text-[#5438FF] hover:text-[#462EE5] transition-colors">
                        Resend code
                    </button>
                </p>
                
                <Link to="/login" className="mt-6 text-[13px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors underline underline-offset-4">
                    Back to login
                </Link>
            </div>

            {/* Float Animation Keyframes */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
                .animate-float {
                    animation: float 5s ease-in-out infinite;
                }
            `}</style>
        </AuthLayout>
    );
}
