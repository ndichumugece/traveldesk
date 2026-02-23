import { Search, Plus, MapPin, DollarSign, Activity as ActivityIcon, Edit, Trash2 } from 'lucide-react';
import { useActivities, type Activity } from '../../hooks/useActivities';
import { useState } from 'react';

interface ActivityListProps {
    onAdd: () => void;
    onEdit: (activity: Activity) => void;
}

export function ActivityList({ onAdd, onEdit }: ActivityListProps) {
    const { activities, loading, error, deleteActivity } = useActivities();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredActivities = activities.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this activity?')) {
            await deleteActivity(id);
        }
    };

    if (error) {
        return (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-600 text-sm">
                Error loading activities: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activities</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage available activities and their pricing.</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Activity</span>
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search activities or locations..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl h-48 animate-pulse" />
                    ))}
                </div>
            ) : filteredActivities.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ActivityIcon className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No activities found</h3>
                    <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                        {searchQuery ? "No activities match your search criteria." : "Get started by adding your first activity."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredActivities.map((activity) => (
                        <div key={activity.id} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300">
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                                        <ActivityIcon className="w-5 h-5 text-brand-600" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onEdit(activity)}
                                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(activity.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-slate-900 mb-1 group-hover:text-brand-600 transition-colors uppercase tracking-tight">
                                    {activity.name}
                                </h3>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>{activity.location || 'Location not set'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                        <DollarSign className="w-4 h-4 text-emerald-600" />
                                        <span className="text-lg">{activity.price.toLocaleString()}</span>
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest ml-1">Per Person</span>
                                    </div>
                                </div>

                                {activity.description && (
                                    <p className="text-xs text-slate-400 line-clamp-2 mt-3 leading-relaxed">
                                        {activity.description}
                                    </p>
                                )}

                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${activity.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {activity.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
