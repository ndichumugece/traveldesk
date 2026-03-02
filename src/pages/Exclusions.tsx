import { useState } from 'react';
import { ExclusionList } from '../components/configuration/ExclusionList';
import { ExclusionForm } from '../components/configuration/ExclusionForm';
import { useExclusions, type Exclusion } from '../hooks/useExclusions';
import { Plus } from 'lucide-react';

export function Exclusions() {
    const { exclusions, loading, addExclusion, updateExclusion, deleteExclusion } = useExclusions();
    const [selectedExclusion, setSelectedExclusion] = useState<Exclusion | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleSelect = (exclusion: Exclusion) => {
        setIsAdding(false);
        setSelectedExclusion(exclusion);
    };

    const handleAddNew = () => {
        setSelectedExclusion(null);
        setIsAdding(true);
    };

    const handleDiscard = () => {
        setIsAdding(false);
        setSelectedExclusion(null);
    };

    return (
        <div className="flex flex-col md:flex-row bg-white rounded-3xl border border-slate-200 overflow-hidden h-[calc(100vh-8rem)] shadow-sm">
            {/* Left Sidebar: List */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col bg-slate-50/30 h-1/2 md:h-full">
                <ExclusionList
                    exclusions={exclusions}
                    loading={loading}
                    selectedId={selectedExclusion?.id || null}
                    onSelect={handleSelect}
                    onAddNew={handleAddNew}
                />
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 overflow-y-auto bg-white p-4 md:p-8">
                {isAdding || selectedExclusion ? (
                    <ExclusionForm
                        key={selectedExclusion?.id || 'new'}
                        existingExclusion={selectedExclusion}
                        onSave={addExclusion}
                        onUpdate={updateExclusion}
                        onDiscard={handleDiscard}
                        onDelete={selectedExclusion ? () => {
                            deleteExclusion(selectedExclusion.id);
                            handleDiscard();
                        } : undefined}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                            <Plus size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Select an Exclusion</h3>
                            <p className="text-slate-500 max-w-xs mx-auto mt-1">Select an item from the list to edit its details or click 'Add New' to create one.</p>
                        </div>
                        <button
                            onClick={handleAddNew}
                            className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
                        >
                            Add New Exclusion
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
