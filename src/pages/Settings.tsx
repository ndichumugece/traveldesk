import { useState, useEffect, useRef } from 'react';
import { Save, UploadCloud, Building2, Palette, FileText, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { supabase } from '../lib/supabase';

export function Settings() {
    const [activeTab, setActiveTab] = useState('branding');
    const { settings, loading, updateSettings } = useSettings();
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Form State
    const [legalName, setLegalName] = useState('');
    const [supportEmail, setSupportEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [taxId, setTaxId] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#4F46E5');
    const [logoUrl, setLogoUrl] = useState('');
    const [footerNote, setFooterNote] = useState('');
    const [terms, setTerms] = useState('');

    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (settings) {
            setLegalName(settings.legal_name || '');
            setSupportEmail(settings.support_email || '');
            setPhone(settings.phone || '');
            setAddress(settings.address || '');
            setTaxId(settings.tax_id || '');
            setPrimaryColor(settings.primary_color || '#4F46E5');
            setLogoUrl(settings.logo_url || '');
            setFooterNote(settings.default_footer_note || '');
            setTerms(settings.default_terms || '');
        }
    }, [settings]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        const updates = {
            legal_name: legalName,
            support_email: supportEmail,
            phone,
            address,
            tax_id: taxId,
            primary_color: primaryColor,
            logo_url: logoUrl,
            default_footer_note: footerNote,
            default_terms: terms,
        };
        const { error } = await updateSettings(updates);
        setIsSaving(false);
        if (!error) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } else {
            alert(`Failed to save settings: ${error}`);
        }
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            // Optional: check file size (e.g. max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Logo must be less than 2MB');
                return;
            }

            setIsUploadingLogo(true);

            // Create a unique file name
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Math.random()}.${fileExt}`;
            const filePath = `logos/${fileName}`;

            // Upload the image
            const { error: uploadError } = await supabase.storage
                .from('brand_assets') // Ensure this bucket exists and is public
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get the public URL
            const { data } = supabase.storage
                .from('brand_assets')
                .getPublicUrl(filePath);

            setLogoUrl(data.publicUrl);

        } catch (error: any) {
            alert(`Error uploading logo: ${error.message}`);
        } finally {
            setIsUploadingLogo(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset input
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Agency Settings</h1>
                    <p className="text-slate-500 mt-1">Configure global branding, contact details, and document preferences.</p>
                </div>
                <div className="flex items-center gap-3">
                    {saveSuccess && (
                        <span className="text-emerald-600 flex items-center gap-1.5 text-sm font-medium animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 className="w-4 h-4" />
                            Saved successfully
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-all duration-150 shadow-sm hover:shadow active:scale-95 font-medium"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row min-h-[600px]">
                {/* Settings Sidebar */}
                <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 p-4 shrink-0 bg-slate-50/50">
                    <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('branding')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'branding' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            <Palette className="w-4 h-4" />
                            Branding
                        </button>
                        <button
                            onClick={() => setActiveTab('contact')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'contact' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            <MapPin className="w-4 h-4" />
                            Contact Details
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'documents' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            <FileText className="w-4 h-4" />
                            Document Preferences
                        </button>
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="flex-1 p-6 md:p-8">
                    {activeTab === 'branding' && (
                        <div className="max-w-xl space-y-8 animate-in fade-in">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Company Logo</h3>
                                <p className="text-sm text-slate-500 mb-4">This logo will appear on all your generated PDFs and client portals.</p>
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div
                                        className="h-24 w-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 relative overflow-hidden group hover:border-brand-300 transition-colors"
                                    >
                                        {isUploadingLogo ? (
                                            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                                        ) : logoUrl ? (
                                            <img src={logoUrl} alt="Company Logo" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <Building2 className="w-8 h-8 text-slate-400 group-hover:text-brand-400 transition-colors" />
                                        )}

                                        {!isUploadingLogo && (
                                            <div
                                                className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <UploadCloud className="w-6 h-6 text-slate-700" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 w-full space-y-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleLogoUpload}
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploadingLogo}
                                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            {isUploadingLogo ? 'Uploading...' : (logoUrl ? 'Change Logo' : 'Upload Logo')}
                                        </button>
                                        {logoUrl && !isUploadingLogo && (
                                            <button
                                                onClick={() => setLogoUrl('')}
                                                className="px-4 py-2 ml-2 bg-transparent text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-50 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                        <p className="text-xs text-slate-400">Recommended size: 512x512px. Max file size: 2MB.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 border-t border-slate-100 pt-6 mb-1">Brand Colors</h3>
                                <p className="text-sm text-slate-500 mb-4">Select your primary brand color representing your agency.</p>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Primary Color (Hex)</label>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg shadow-inner border border-black/10 shrink-0"
                                            style={{ backgroundColor: primaryColor }}
                                        />
                                        <input
                                            type="text"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="w-full max-w-[200px] px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 uppercase"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div className="max-w-xl space-y-6 animate-in fade-in">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Official Contact Details</h3>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Legal Agency Name</label>
                                    <input
                                        type="text"
                                        value={legalName}
                                        onChange={(e) => setLegalName(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Support Email</label>
                                        <input
                                            type="email"
                                            value={supportEmail}
                                            onChange={(e) => setSupportEmail(e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Physical Address</label>
                                    <textarea
                                        rows={3}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 resize-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Tax ID / Registration Number</label>
                                    <input
                                        type="text"
                                        value={taxId}
                                        onChange={(e) => setTaxId(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                        placeholder="e.g. EU12345678"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="max-w-xl space-y-6 animate-in fade-in">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">PDF Footer & Terms</h3>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Default PDF Footer Note</label>
                                    <textarea
                                        rows={3}
                                        value={footerNote}
                                        onChange={(e) => setFooterNote(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm text-slate-900 resize-none"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">This text appears at the bottom of every generated PDF.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Default Terms & Conditions (Quotations)</label>
                                    <textarea
                                        rows={4}
                                        value={terms}
                                        onChange={(e) => setTerms(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm text-slate-900 resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
