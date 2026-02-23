import { Building2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    heading?: string;
    subheading?: string;
}

export function AuthLayout({ children, heading, subheading }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-white flex">
            {/* Left side */}
            <div className="hidden lg:flex w-1/2 bg-[#5438FF] flex-col overflow-hidden relative">
                <div className="p-12 lg:p-16 flex-1 flex flex-col pt-16 z-10">
                    <div className="max-w-[420px] lg:pt-8">
                        <h1 className="text-5xl leading-[1.25] font-semibold text-white mb-4">
                            {heading || "Run your travel operations with clarity and confidence"}
                        </h1>
                        <p className="text-[#B4AEFF] text-lg leading-relaxed font-medium">
                            {subheading || "From quotations to vouchers — manage every booking detail in one powerful platform."}
                        </p>
                    </div>
                </div>

                {/* UI Mockup Window - built carefully out of CSS to exactly match B2B styling */}
                <div className="absolute -right-8 bottom-0 w-[110%] h-[55%] pointer-events-none select-none">
                    <div className="absolute top-0 left-12 right-0 bottom-[-20px] bg-white rounded-tl-xl shadow-[-20px_0_40px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col">
                        <div className="h-10 border-b border-slate-100 flex items-center px-4 gap-2 shrink-0 bg-white">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
                            </div>
                            <div className="ml-4 flex items-center gap-2 opacity-50">
                                <div className="w-3.5 h-3.5 rounded-sm bg-[#5438FF]/20 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-sm bg-[#5438FF]"></div>
                                </div>
                            </div>
                            <div className="ml-2 w-24 h-2 bg-slate-100 rounded-full"></div>
                        </div>
                        <div className="flex-1 flex w-full bg-[#F8FAFC]">
                            <div className="w-16 bg-[#18181B] flex flex-col items-center py-5 gap-5 shrink-0 z-10">
                                <div className="w-8 h-8 rounded-lg bg-white/10 mb-2"></div>
                                <div className="w-8 h-8 rounded-lg bg-[#5438FF] shadow-lg shadow-[#5438FF]/30"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-white/30 relative">
                                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FF5F56] ring-2 ring-[#18181B]"></div>
                                </div>
                                <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                            </div>
                            <div className="flex-1 p-6 flex flex-col gap-6 relative">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#18181B] rounded-lg px-4 py-3 min-w-[140px] flex items-center gap-3 shadow-md">
                                        <div className="w-3 h-3 rounded-full border-2 border-white/20"></div>
                                        <div className="w-16 h-1.5 bg-white/30 rounded-full"></div>
                                    </div>
                                    <div className="bg-white rounded-lg px-4 py-3 min-w-[100px] border border-slate-200 flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full border-2 border-slate-200"></div>
                                        <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="bg-white flex-1 rounded-xl shadow-sm border border-slate-100 p-6 flex">
                                    <div className="w-1/3 border-r border-slate-50 pr-6 space-y-4">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="flex items-center gap-3 group">
                                                <div className="w-3.5 h-3.5 rounded-full bg-slate-100 shrink-0"></div>
                                                <div className="w-full h-2 bg-slate-100 rounded-full shrink-0 relative overflow-hidden">
                                                    {i === 1 && <div className="absolute inset-y-0 left-0 w-1/3 bg-slate-200"></div>}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-4 flex items-center gap-2">
                                            <div className="w-10 h-4 rounded-full bg-slate-100"></div>
                                            <div className="w-12 h-4 rounded-full border border-[#FF5F56] opacity-60"></div>
                                        </div>
                                    </div>
                                    <div className="w-2/3 pl-6 space-y-5">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={`col-${i}`} className="flex items-center gap-4 border-b border-slate-50 pb-5 last:border-0 last:pb-0">
                                                <div className="w-3.5 h-3.5 rounded-full bg-slate-100 shrink-0"></div>
                                                <div className="w-10 h-10 bg-slate-50 rounded-full shrink-0"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="w-1/2 max-w-[120px] h-2 bg-slate-200 rounded-full shrink-0"></div>
                                                    <div className="w-full max-w-[200px] h-1.5 bg-slate-100 rounded-full shrink-0"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Fade overlay to hide the bottom cut-off */}
                                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F8FAFC] to-transparent pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                </div>
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
