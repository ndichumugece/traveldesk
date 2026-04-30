import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    ChevronRight,
    Loader2
} from 'lucide-react';
import { usePropertyStats } from '../hooks/usePropertyStats';
import { cn } from '../lib/utils';
import { 
    Tooltip, 
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { downloadCSV } from '../lib/exportUtils';

const COLORS = ['#16a34a', '#D87D31', '#22c55e', '#FFC107', '#EF4444', '#3B82F6'];

export function TopProperties() {
    const navigate = useNavigate();
    const { data, isLoading, error } = usePropertyStats();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleExport = () => {
        if (!data || !data.properties.length) return;
        
        const exportData = data.properties.map(p => ({
            'Property Name': p.name,
            'Location': p.location,
            'Type': p.type,
            'Total Revenue (KSH)': p.totalRevenue,
            'Total Bookings': p.bookings,
            'Avg Booking Rate': Math.round(p.avgRate)
        }));
        
        downloadCSV(exportData, 'Property_Analytics');
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center min-h-[600px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-100">
                <p className="text-rose-600 font-bold">Error loading property analytics: {(error as any)?.message || 'No data found'}</p>
            </div>
        );
    }

    const filteredProperties = data.properties.filter(prop => 
        prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
    const paginatedProperties = filteredProperties.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <button 
                        onClick={() => navigate('/')}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm mt-1"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Top Properties</h1>
                        <p className="text-slate-500 mt-1 text-sm font-medium">Comprehensive analysis of property-level performance and revenue distribution.</p>
                    </div>
                </div>
                <button 
                    onClick={handleExport}
                    className="bg-brand-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
                >
                    Export Analysis
                </button>
            </div>

            {/* Metric Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-brand-50 rounded-[2.5rem] p-8 relative overflow-hidden group border border-brand-100 shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-sm font-bold text-brand-600 uppercase tracking-widest">Best Performing</span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 truncate max-w-full">
                            {data.bestPerforming.name}
                        </h4>
                        <p className="text-sm font-bold text-brand-600 mt-2">
                            KSH {data.bestPerforming.revenue.toLocaleString()} in revenue
                        </p>
                    </div>
                </div>

                <div className="bg-[#FFF4E8] rounded-[2.5rem] p-8 relative overflow-hidden group border border-orange-100 shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-sm font-bold text-[#D87D31] uppercase tracking-widest">Avg. Revenue / Prop</span>
                        </div>
                        <h4 className="text-3xl font-black text-slate-900">KSH {data.avgRevPerProperty.toLocaleString()}</h4>
                        <p className="text-sm font-bold text-[#D87D31] mt-2">Performance efficiency</p>
                    </div>
                </div>

                <div className="bg-brand-50/50 rounded-[2.5rem] p-8 relative overflow-hidden group border border-brand-100 shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-sm font-bold text-brand-600 uppercase tracking-widest">Total Bookings</span>
                        </div>
                        <h4 className="text-3xl font-black text-slate-900">{data.totalBookings}</h4>
                        <p className="text-sm font-bold text-brand-600 mt-2">Processed requests</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Type Distribution */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue by Category</h3>
                            <p className="text-slate-400 text-sm font-medium mt-1">Split across property types</p>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.typeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.typeDistribution.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => `KSH ${value.toLocaleString()}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-8">
                            {data.typeDistribution.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-900">
                                        {data.typeDistribution.reduce((a, b) => a + b.value, 0) > 0 
                                            ? Math.round((item.value / data.typeDistribution.reduce((a, b) => a + b.value, 0)) * 100)
                                            : 0}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Regional Performance */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Regional Performance</h3>
                            <p className="text-slate-400 text-sm font-medium mt-1">Top performing locations by revenue</p>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.locationDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="revenue"
                                    >
                                        {data.locationDistribution.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => `KSH ${value.toLocaleString()}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-8">
                            {data.locationDistribution.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider truncate max-w-[100px]">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-900">
                                        {data.locationDistribution.reduce((a, b) => a + b.revenue, 0) > 0 
                                            ? Math.round((item.revenue / data.locationDistribution.reduce((a, b) => a + b.revenue, 0)) * 100)
                                            : 0}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Performance List */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Performance Index</h3>
                        <p className="text-slate-500 text-sm font-medium mt-1">Property-by-property breakdown of analytics.</p>
                    </div>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Filter properties..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-6 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500 transition-all w-full sm:w-[300px] font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="py-4 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Details</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Bookings</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue (KSH)</th>
                                <th className="py-4 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Contribution</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedProperties.map((prop) => {
                                const totalSystemRevenue = data.properties.reduce((sum, p) => sum + p.totalRevenue, 0);
                                const contribution = totalSystemRevenue > 0 ? (prop.totalRevenue / totalSystemRevenue) * 100 : 0;
                                
                                return (
                                    <tr key={prop.name} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="py-6 px-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors uppercase font-black text-xs">
                                                    {prop.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 uppercase">{prop.name}</div>
                                                    <div className="text-[11px] text-slate-400 font-bold mt-1 uppercase">
                                                        {prop.location}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-6">
                                            <span className={cn(
                                                "inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                                prop.type === 'Hotel' ? "bg-brand-50 text-brand-700" : 
                                                prop.type === 'Villa' ? "bg-[#FFF4E8] text-[#D87D31]" : 
                                                "bg-slate-100 text-slate-500"
                                            )}>
                                                {prop.type}
                                            </span>
                                        </td>
                                        <td className="py-6 px-6 text-right">
                                            <div className="text-sm font-black text-slate-900">{prop.bookings}</div>
                                        </td>
                                        <td className="py-6 px-6 text-right">
                                            <div className="text-sm font-black text-slate-900">
                                                {prop.totalRevenue.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="py-6 px-10 text-right">
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-sm font-black text-slate-900">{contribution.toFixed(1)}%</div>
                                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-brand-600 rounded-full transition-all duration-1000"
                                                        style={{ width: `${contribution}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {paginatedProperties.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase text-xs">
                                        No properties found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredProperties.length)} of {filteredProperties.length} properties
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4 text-slate-600" />
                            </button>
                            <div className="flex items-center gap-1 mx-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={cn(
                                            "w-8 h-8 rounded-lg text-xs font-black transition-all",
                                            currentPage === i + 1 
                                                ? "bg-brand-600 text-white shadow-md shadow-brand-200Scale-110" 
                                                : "text-slate-400 hover:bg-slate-100"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
