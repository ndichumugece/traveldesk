import { Building2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-white flex">
            {/* Left side */}
            <div className="hidden lg:flex w-1/2 bg-slate-50 flex-col overflow-hidden relative border-r border-slate-100">
                {/* Background Image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url("/login-bg.jpg")' }}
                />

                <div className="p-12 lg:p-16 flex-1 flex flex-col pt-12 z-10" />
            </div>


            {/* Right side - Form container centrally aligned and constrained */}
            <div className="w-full lg:w-1/2 flex justify-center bg-white border-l border-slate-100">
                <div className="w-full max-w-[440px] px-8 sm:px-12 flex flex-col justify-center min-h-screen relative py-12">
                    {/* Mobile only logo header */}
                    <div className="lg:hidden flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 mb-8 w-full justify-start">
                        <div className="bg-[#5438FF] p-1.5 rounded-lg shadow-sm">
                            <Building2 size={20} className="text-white" />
                        </div>
                        TravelDesk
                    </div>

                    <div className="w-full flex-1 flex flex-col justify-center max-h-[800px]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
