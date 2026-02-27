import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';

interface OnboardingData {
    agencyName: string;
    country: string;
    currency: string;
    products: string[];
    documentTypes: string[];
}

const TOTAL_STEPS = 5;

const PRODUCT_OPTIONS = [
    'Hotels / Lodges',
    'Tours & Excursions',
    'Transport',
    'Complete Travel Packages'
];

const DOCUMENT_OPTIONS = [
    'Quotations',
    'Invoices',
    'Booking Vouchers',
    'Confirmation Vouchers'
];

export function Onboarding() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState<OnboardingData>({
        agencyName: '',
        country: '',
        currency: 'KSH',
        products: [],
        documentTypes: []
    });

    // Redirect if no user
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleNext = () => {
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            // Here you would typically save the data to your agency_settings or user profile table
            // For now, we'll just simulate a profile update and navigate
            if (user) {
                await supabase.from('profiles').update({
                    full_name: data.agencyName // Assuming they might use agency name
                }).eq('id', user.id);
            }

            navigate('/');
        } catch (error) {
            console.error('Error saving onboarding data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (field: 'products' | 'documentTypes', option: string) => {
        setData(prev => ({
            ...prev,
            [field]: prev[field].includes(option)
                ? prev[field].filter(item => item !== option)
                : [...prev[field], option]
        }));
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1: return data.agencyName.trim().length > 0;
            case 2: return data.country.trim().length > 0;
            case 3: return data.currency.trim().length > 0;
            case 4: return data.products.length > 0;
            case 5: return data.documentTypes.length > 0;
            default: return true;
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center pt-16 px-4">
            {/* Logo Header */}
            <div className="flex items-center gap-2 mb-16">
                <div className="bg-[#5438FF] p-1.5 rounded-lg shadow-sm">
                    <Building2 size={24} className="text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-900">TravelDesk</span>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-4 mb-16 relative">
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-slate-200 -z-10 -translate-y-1/2"></div>
                {[1, 2, 3, 4, 5].map((step) => (
                    <div
                        key={step}
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 relative z-10",
                            step === currentStep
                                ? "bg-[#5438FF] text-white shadow-lg shadow-[#5438FF]/30 ring-4 ring-white"
                                : step < currentStep
                                    ? "bg-[#5438FF] text-white ring-4 ring-white"
                                    : "bg-white text-slate-400 border-2 border-slate-200"
                        )}
                    >
                        {step < currentStep ? <Check size={18} /> : step}
                    </div>
                ))}
            </div>

            {/* Content Container */}
            <div className="w-full max-w-xl text-center">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Onboarding Getting Started!</h1>
                <p className="text-slate-500 mb-12">You can always change them later.</p>

                <div className="space-y-4 mb-12 text-left">
                    {/* Step 1: Agency Name */}
                    {currentStep === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <label className="block text-sm font-semibold text-slate-900 mb-3">1. What is your agency name?</label>
                            <input
                                type="text"
                                value={data.agencyName}
                                onChange={(e) => setData({ ...data, agencyName: e.target.value })}
                                placeholder="Agency Name"
                                className="w-full p-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:border-[#5438FF] focus:ring-2 focus:ring-[#5438FF]/20 transition-all text-lg font-medium outline-none"
                                autoFocus
                            />
                            <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                                <p className="text-sm font-medium text-slate-800 mb-1">Why this matters</p>
                                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                                    <li>Used across invoices, quotations, and vouchers</li>
                                    <li>Becomes the account's primary identity</li>
                                </ul>
                                <p className="text-xs text-slate-500 mt-3 font-medium bg-white px-2 py-1 rounded inline-block border border-slate-100">Hint: This will appear on all your documents</p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Country */}
                    {currentStep === 2 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <label className="block text-sm font-semibold text-slate-900 mb-3">2. What country does your agency operate in?</label>
                            <input
                                type="text"
                                value={data.country}
                                onChange={(e) => setData({ ...data, country: e.target.value })}
                                placeholder="Country Name"
                                className="w-full p-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:border-[#5438FF] focus:ring-2 focus:ring-[#5438FF]/20 transition-all text-lg font-medium outline-none"
                                autoFocus
                            />
                            <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                                <p className="text-sm font-medium text-slate-800 mb-1">Why this matters</p>
                                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                                    <li>Sets default currency, date format, and tax logic</li>
                                    <li>Helps localize documents automatically</li>
                                </ul>
                                <p className="text-xs text-slate-500 mt-3 font-medium bg-white px-2 py-1 rounded inline-block border border-slate-100">Hint: We'll tailor documents and settings for your region</p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Currency */}
                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <label className="block text-sm font-semibold text-slate-900 mb-3">3. What is your default currency?</label>
                            <select
                                value={data.currency}
                                onChange={(e) => setData({ ...data, currency: e.target.value })}
                                className="w-full p-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:border-[#5438FF] focus:ring-2 focus:ring-[#5438FF]/20 transition-all text-lg font-medium outline-none appearance-none cursor-pointer"
                                autoFocus
                            >
                                <option value="KSH">KSH</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="ZAR">ZAR</option>
                            </select>
                            <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                                <p className="text-sm font-medium text-slate-800 mb-1">Why this matters</p>
                                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                                    <li>Prevents pricing and invoicing errors</li>
                                    <li>Drives totals across bookings and reports</li>
                                </ul>
                                <p className="text-xs text-slate-500 mt-3 font-medium bg-white px-2 py-1 rounded inline-block border border-slate-100">Hint: You can change this later per booking</p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Products */}
                    {currentStep === 4 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <label className="block text-sm font-semibold text-slate-900 mb-3">4. What do you mainly sell? (Multi-select)</label>
                            <div className="space-y-3">
                                {PRODUCT_OPTIONS.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => toggleSelection('products', option)}
                                        className={cn(
                                            "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group",
                                            data.products.includes(option)
                                                ? "border-[#5438FF] bg-[#5438FF]/5"
                                                : "border-slate-200 bg-white hover:border-slate-300"
                                        )}
                                    >
                                        <span className={cn(
                                            "font-medium",
                                            data.products.includes(option) ? "text-[#5438FF]" : "text-slate-700"
                                        )}>
                                            {option}
                                        </span>
                                        <div className={cn(
                                            "w-5 h-5 rounded-md flex items-center justify-center transition-colors",
                                            data.products.includes(option) ? "bg-[#5438FF] text-white" : "border-2 border-slate-200 group-hover:border-slate-300"
                                        )}>
                                            {data.products.includes(option) && <Check size={14} strokeWidth={3} />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                                <p className="text-sm font-medium text-slate-800 mb-1">Why this matters</p>
                                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                                    <li>Personalizes dashboards</li>
                                    <li>Simplifies document templates</li>
                                </ul>
                                <p className="text-xs text-slate-500 mt-3 font-medium bg-white px-2 py-1 rounded inline-block border border-slate-100">Hint: This helps us customize your workspace</p>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Documents */}
                    {currentStep === 5 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <label className="block text-sm font-semibold text-slate-900 mb-3">5. What documents do you create most often? (Multi-select)</label>
                            <div className="space-y-3">
                                {DOCUMENT_OPTIONS.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => toggleSelection('documentTypes', option)}
                                        className={cn(
                                            "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group",
                                            data.documentTypes.includes(option)
                                                ? "border-[#5438FF] bg-[#5438FF]/5"
                                                : "border-slate-200 bg-white hover:border-slate-300"
                                        )}
                                    >
                                        <span className={cn(
                                            "font-medium",
                                            data.documentTypes.includes(option) ? "text-[#5438FF]" : "text-slate-700"
                                        )}>
                                            {option}
                                        </span>
                                        <div className={cn(
                                            "w-5 h-5 rounded-md flex items-center justify-center transition-colors",
                                            data.documentTypes.includes(option) ? "bg-[#5438FF] text-white" : "border-2 border-slate-200 group-hover:border-slate-300"
                                        )}>
                                            {data.documentTypes.includes(option) && <Check size={14} strokeWidth={3} />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                                <p className="text-sm font-medium text-slate-800 mb-1">Why this matters</p>
                                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                                    <li>Determines default workflows</li>
                                    <li>Optimizes document creation flow</li>
                                </ul>
                                <p className="text-xs text-slate-500 mt-3 font-medium bg-white px-2 py-1 rounded inline-block border border-slate-100">Hint: We'll prioritize these in your dashboard</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                    {currentStep > 1 && (
                        <button
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="flex-1 py-4 px-6 rounded-xl font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={!canProceed() || loading}
                        className={cn(
                            "flex-none py-4 px-8 rounded-xl font-semibold text-white transition-all shadow-sm",
                            currentStep === 1 ? "w-full" : "w-2/3",
                            canProceed()
                                ? "bg-[#5438FF] hover:bg-[#462EE5] shadow-[#5438FF]/20"
                                : "bg-slate-300 cursor-not-allowed"
                        )}
                    >
                        {loading ? 'Setting up...' : currentStep === TOTAL_STEPS ? 'Complete Setup' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
}
