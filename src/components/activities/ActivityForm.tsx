import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useActivities, type Activity } from '../../hooks/useActivities';

interface ActivityFormProps {
    onDiscard: () => void;
    existingActivity?: Activity | null;
}

const inputBase = 'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-300';
const labelBase = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5';

export function ActivityForm({ onDiscard, existingActivity }: ActivityFormProps) {
    const { addActivity, updateActivity } = useActivities();
    const [isSaving, setIsSaving] = useState(false);

    const [name, setName] = useState(existingActivity?.name || '');
    const [description, setDescription] = useState(existingActivity?.description || '');
    const [location, setLocation] = useState(existingActivity?.location || '');
    const [price, setPrice] = useState(existingActivity?.price?.toString() || '');
    const [status, setStatus] = useState<'active' | 'inactive'>(existingActivity?.status || 'active');

    const handleSave = async () => {
        if (!name || !price) {
            alert('Please fill in Name and Price.');
            return;
        }

        setIsSaving(true);
        const activityData = {
            name,
            description,
            location,
            price: Number(price),
            status
        };

        const res = existingActivity
            ? await updateActivity(existingActivity.id, activityData)
            : await addActivity(activityData);

        setIsSaving(false);
        if (res.error) {
            alert('Error: ' + res.error);
        } else {
            onDiscard();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onDiscard} disabled={isSaving}
                        className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {existingActivity ? 'Edit Activity' : 'Add New Activity'}
                        </h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {existingActivity ? 'Update activity details below.' : 'Fill in the activity details to get started.'}
                        </p>
                    </div>
                </div>
                <button onClick={handleSave} disabled={isSaving}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-50">
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Activity
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                            <label className={labelBase}>Activity Name *</label>
                            <input value={name} onChange={e => setName(e.target.value)} className={inputBase} placeholder="e.g. Guided City Tour" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className={labelBase}>Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} className={`${inputBase} min-h-[100px] resize-none`} placeholder="Describe the activity..." />
                        </div>
                        <div>
                            <label className={labelBase}>Location</label>
                            <input value={location} onChange={e => setLocation(e.target.value)} className={inputBase} placeholder="e.g. Paris, France" />
                        </div>
                        <div>
                            <label className={labelBase}>Price (KSH) *</label>
                            <input type="number" value={price} onChange={e => setPrice(e.target.value)} className={inputBase} placeholder="0.00" />
                        </div>
                        <div>
                            <label className={labelBase}>Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value as 'active' | 'inactive')} className={inputBase}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
