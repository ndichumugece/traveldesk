import { useQueryState } from '../hooks/useQueryState';
import { useClientStats } from '../hooks/useClientStats';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    ResponsiveContainer,
    Cell,
    Tooltip
} from 'recharts';
import { cn } from '../lib/utils';
import { downloadCSV } from '../lib/exportUtils';

export function Clients() {
    const navigate = useNavigate();
    const { data, isLoading, isFetching, error } = useClientStats();
    const [searchTerm, setSearchTerm] = useQueryState('search', '');

    if (isLoading && !data) {
        return (
            <div className="h-full flex items-center justify-center min-h-[600px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-100">
                <p className="text-rose-600 font-bold">Error loading client analytics: {error instanceof Error ? error.message : 'No data found'}</p>
            </div>
        );
    }

    const filteredDirectory = data.clientDirectory.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        if (!data || !data.clientDirectory.length) return;
        
        const exportData = data.clientDirectory.map(c => ({
            'Client Name': c.name,
            'Email': c.email,
            'Phone': c.phone || 'N/A',
            'Total Revenue (KSH)': c.totalRevenue,
            'Booking Count': c.count,
            'Last Booking': c.lastBookingDate ? format(c.lastBookingDate, 'PPP') : 'N/A',
            'Status': c.status
        }));
        
        downloadCSV(exportData, 'Client_Analytics');
    };

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
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Top Clients</h1>
                        <p className="text-slate-500 mt-1 text-sm font-medium">Analysis of your most frequent and valuable guests.</p>
                    </div>
                    {isFetching && (
                        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 px-3 py-1 rounded-full shadow-sm flex items-center gap-2 h-fit">
                            <Loader2 className="w-3 h-3 animate-spin text-brand-600" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Updating...</span>
                        </div>
                    )}
                </div>
                <button 
                    onClick={handleExport}
                    className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                >
                    Export Report
                </button>
            </div>

            {/* Metric Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Top Guest</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h4 className="text-2xl font-black text-slate-900 truncate max-w-[180px] uppercase">
                            {data.topGuest.name}
                        </h4>
                        <div className="bg-[#FFF9E5] px-3 py-1 rounded-lg">
                            <span className="text-[10px] font-black text-[#FFC107] uppercase">
                                {data.topGuest.count} Bookings
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Avg. Revenue / Client</span>
                    </div>
                    <div>
                        <h4 className="text-3xl font-black text-slate-900">KSH {data.avgRevenue.toLocaleString()}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Based on {data.clientDirectory.length} unique clients</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Bookers</span>
                    </div>
                    <div>
                        <h4 className="text-3xl font-black text-slate-900">{data.activeBookers}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Clients who booked in the last 90 days</p>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bookings Chart */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Top 10 Clients (by Bookings)</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={data.topByBookings}
                                margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
                            >
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                                    width={70}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20}>
                                    {data.topByBookings.map((_, index) => (
                                        <Cell key={index} fill={['#FFC107', '#1D9C83', '#D87D31', '#EF4444', '#6366F1'][index % 5]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Top 10 Clients (by Revenue)</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={data.topByRevenue}
                                margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
                            >
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                                    width={70}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    formatter={(value) => [`KSH ${value}`, 'Revenue']}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="amount" radius={[0, 8, 8, 0]} barSize={20}>
                                    {data.topByRevenue.map((_, index) => (
                                        <Cell key={index} fill={index === 0 ? '#1D9C83' : '#1D9C83'} opacity={1 - (index * 0.1)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Directory Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mt-8">
                <div className="p-10 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Loyal Client Directory</h3>
                        <p className="text-slate-500 text-sm font-medium mt-1">Comprehensive list of all guests and their booking history.</p>
                    </div>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search clients..." 
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
                                <th className="py-4 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client / Guest</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total Bookings</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Booking</th>
                                <th className="py-4 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Loyalty Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredDirectory.map((client) => (
                                <tr key={client.email} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="py-6 px-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors uppercase font-black text-xs">
                                                {client.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900 uppercase">{client.name}</div>
                                                <div className="flex flex-col gap-1 mt-1">
                                                    {client.phone && (
                                                        <div className="text-[11px] text-slate-500 font-bold uppercase">
                                                            {client.phone}
                                                        </div>
                                                    )}
                                                    <div className="text-[11px] text-slate-400 font-medium">
                                                        {client.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-6 text-center">
                                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[#FFF9E5] text-[#FFC107] text-xs font-black">
                                            {client.count}
                                        </span>
                                    </td>
                                    <td className="py-6 px-6">
                                        <div className="text-sm font-black text-slate-900">KSH {client.totalRevenue.toLocaleString()}</div>
                                    </td>
                                    <td className="py-6 px-6">
                                        {client.lastBookingDate ? (
                                            <div className="text-sm text-slate-600 font-bold">
                                                {format(client.lastBookingDate, 'dd MMM yyyy')}
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 text-xs uppercase font-bold">No bookings</span>
                                        )}
                                    </td>
                                    <td className="py-6 px-10 text-right">
                                        <span className={cn(
                                            "inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider",
                                            client.status === 'Frequent' ? "bg-brand-50 text-brand-700" : 
                                            client.status === 'Regular' ? "bg-slate-100 text-slate-500" :
                                            "bg-[#E8F5FF] text-[#3B82F6]"
                                        )}>
                                            {client.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredDirectory.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase text-xs">No clients found matching your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function AwardIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>
    );
}
