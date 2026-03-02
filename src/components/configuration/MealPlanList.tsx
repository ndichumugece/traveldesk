import { Search, Plus, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { type MealPlan } from '../../hooks/useMealPlans';

interface MealPlanListProps {
    mealPlans: MealPlan[];
    loading: boolean;
    selectedId: string | null;
    onSelect: (mealPlan: MealPlan) => void;
    onAddNew: () => void;
}

export function MealPlanList({ mealPlans, loading, selectedId, onSelect, onAddNew }: MealPlanListProps) {
    const [search, setSearch] = useState('');

    const filteredMealPlans = mealPlans.filter(plan =>
        plan.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            <div className="p-4 space-y-4 border-b border-slate-100 bg-white">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search meal plans..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-sm text-slate-900"
                    />
                </div>
                <button
                    onClick={onAddNew}
                    className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-600 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all font-bold text-sm"
                >
                    <Plus size={16} />
                    Add New
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                    <div className="flex items-center justify-center h-20">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-600"></div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredMealPlans.map((plan) => {
                            const isSelected = selectedId === plan.id;
                            return (
                                <button
                                    key={plan.id}
                                    onClick={() => onSelect(plan)}
                                    className={`w-full group px-4 py-3 rounded-xl flex items-center justify-between transition-all ${isSelected
                                        ? 'bg-brand-50 text-brand-700 shadow-sm'
                                        : 'hover:bg-white text-slate-600 hover:text-slate-900 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500'
                                            } transition-colors`}>
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <span className={`text-sm font-bold truncate pr-2 ${isSelected ? 'text-brand-900' : ''}`}>
                                            {plan.name}
                                        </span>
                                    </div>
                                    {plan.status === 'active' && (
                                        <CheckCircle2
                                            size={14}
                                            className={`${isSelected ? 'text-brand-500' : 'text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity'}`}
                                        />
                                    )}
                                </button>
                            );
                        })}
                        {filteredMealPlans.length === 0 && (
                            <div className="px-4 py-8 text-center">
                                <p className="text-xs font-medium text-slate-400">
                                    {search ? 'No matches found' : 'No meal plans yet'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
