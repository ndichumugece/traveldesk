import { useState } from 'react';
import { Building2, Search, Plus, MapPin } from 'lucide-react';
import { useProperties, type Property } from '../../hooks/useProperties';

export function PropertyList({ onAdd, onEdit }: { onAdd: () => void, onEdit: (property: Property) => void }) {
    const { properties, loading, error } = useProperties();
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Properties</h1>
                    <p className="text-slate-500 mt-1">Manage your hotels, pricing, and availability.</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl transition-all duration-150 shadow-sm hover:shadow active:scale-95 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add Property
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search properties..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 placeholder:text-slate-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500">
                            <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-brand-600 rounded-full mx-auto mb-4"></div>
                            <p>Loading properties...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-500">
                            <p>Error loading properties: {error}</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Property Name</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Base Price</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rooms</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {properties.map((property) => (
                                    <tr
                                        key={property.id}
                                        onClick={() => onEdit(property)}
                                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <span className="font-medium text-slate-900 group-hover:text-brand-600 transition-colors">
                                                    {property.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <MapPin className="h-4 w-4" />
                                                <span className="text-sm">{property.location}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-semibold text-slate-900">
                                            ${property.base_price}/night
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-500">
                                            {property.rooms} rooms
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${property.status === 'active'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {property.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {!loading && properties.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        <Building2 className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-lg font-medium text-slate-900">No properties found</p>
                        <p className="text-sm">Get started by creating a new property.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
