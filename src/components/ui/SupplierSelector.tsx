import { Plus, Loader2 } from 'lucide-react';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useState } from 'react';

interface SupplierSelectorProps {
    selectedId?: string;
    onSelect: (id: string) => void;
    label?: string;
}

export function SupplierSelector({ selectedId, onSelect, label = "Parent Supplier" }: SupplierSelectorProps) {
    const { suppliers, loading, addSupplier } = useSuppliers();
    const [isAdding, setIsAdding] = useState(false);
    const [newSupplierName, setNewSupplierName] = useState('');

    const handleQuickAdd = async () => {
        if (!newSupplierName.trim()) return;
        setIsAdding(true);
        const { data, error } = await addSupplier({ name: newSupplierName.trim() });
        setIsAdding(false);
        if (data) {
            onSelect(data.id);
            setNewSupplierName('');
        } else if (error) {
            alert('Error adding supplier: ' + error);
        }
    };

    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {label}
            </label>
            <div className="flex gap-2">
                <select
                    value={selectedId || ''}
                    onChange={(e) => onSelect(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    disabled={loading}
                >
                    <option value="">Independent (No Supplier)</option>
                    {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                
                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        placeholder="Add new supplier..."
                        value={newSupplierName}
                        onChange={(e) => setNewSupplierName(e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
                    />
                    <button
                        onClick={handleQuickAdd}
                        disabled={isAdding || !newSupplierName.trim()}
                        className="p-2.5 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-100 transition-colors disabled:opacity-50"
                        title="Quick Add Supplier"
                    >
                        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
