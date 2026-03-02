import { useState } from 'react';
import { Save, Loader2, Trash2 } from 'lucide-react';
import { type Exclusion } from '../../hooks/useExclusions';

interface ExclusionFormProps {
    existingExclusion?: Exclusion | null;
    onSave: (exclusion: Omit<Exclusion, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
    onUpdate: (id: string, updates: Partial<Exclusion>) => Promise<any>;
    onDiscard: () => void;
    onDelete?: () => void;
}

export function ExclusionForm({ existingExclusion, onSave, onUpdate, onDiscard, onDelete }: ExclusionFormProps) {
    const [name, setName] = useState(existingExclusion?.name || '');
    const [status, setStatus] = useState<'active' | 'inactive'>(existingExclusion?.status || 'active');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            if (existingExclusion) {
                const { error: updateError } = await onUpdate(existingExclusion.id, { name, status });
                if (updateError) throw new Error(updateError);
            } else {
                const { error: saveError } = await onSave({ name, status });
                if (saveError) throw new Error(saveError);
            }
            if (!existingExclusion) onDiscard();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900">
                    {existingExclusion ? 'Edit Exclusion' : 'Create New Item'}
                </h2>
                <p className="text-slate-500 font-medium">
                    {existingExclusion ? 'Update the details of this exclusion.' : 'Add a new exclusion to the list.'}
                </p>
            </div>

            <div className="space-y-8">
                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Name</label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                            placeholder="e.g. Personal Expenses"
                        />
                    </div>

                    {/* Status Toggle */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Status</label>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${status === 'active' ? 'bg-brand-600' : 'bg-slate-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${status === 'active' ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                            <span className="text-sm font-bold text-slate-600">
                                {status === 'active' ? 'Active' : 'Draft'}
                            </span>
                        </div>
                    </div>

                </div>

                <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        {onDelete && (
                            <button
                                type="button"
                                onClick={onDelete}
                                className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                title="Delete exclusion"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onDiscard}
                            className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-all"
                        >
                            Discard
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-2.5 rounded-xl transition-all font-bold shadow-lg shadow-brand-500/20 disabled:opacity-50 active:scale-95"
                    >
                        {isSaving ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        {existingExclusion ? 'Update Item' : 'Create Item'}
                    </button>
                </div>
            </div>
        </form>
    );
}
