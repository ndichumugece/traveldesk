import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    Download, 
    Search, 
    Loader2
} from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { cn } from '../lib/utils';
import { 
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

const COLORS = ['#16a34a', '#D87D31', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4']; // Emerald, Orange, Rose, Amber

export function LeadSourcePerformance() {
    const navigate = useNavigate();
    const { stats, loading, timeRange, setTimeRange } = useDashboardStats();
    const [searchTerm, setSearchTerm] = useState('');

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center min-h-[600px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
        );
    }

    const leadSources = stats.leadSources || [];
    const filteredSources = leadSources.filter(source => 
        source.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalVolume = leadSources.reduce((acc, s) => acc + s.count, 0);
    const totalRevenue = leadSources.reduce((acc, s) => acc + s.amount, 0);
    const topSource = leadSources[0]?.name || 'N/A';

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
                        <h1 className="text-3xl font-black tracking-tight text-[#333333]">Lead Attribution</h1>
                        <p className="text-slate-500 mt-1 text-sm font-medium">Marketing ROI and lead source efficiency analysis.</p>
                    </div>
                </div>
                
                {/* Time Range Toggle */}
                <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit">
                    {(['week', 'month', 'year'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                                timeRange === range
                                    ? 'bg-white text-brand-600 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metric Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Leads</span>
                    </div>
                    <h4 className="text-2xl font-black text-[#333333]">{totalVolume} Inquiries</h4>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Channel</span>
                    </div>
                    <h4 className="text-2xl font-black text-[#333333] truncate uppercase">{topSource}</h4>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attributed Revenue</span>
                    </div>
                    <h4 className="text-2xl font-black text-brand-600">KSH {totalRevenue.toLocaleString()}</h4>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Share Pie Chart */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm flex flex-col items-center">
                    <div className="w-full mb-8">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Contribution</h3>
                        <p className="text-slate-400 text-xs font-bold mt-1">Value distribution by channel</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={leadSources}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="amount"
                                    nameKey="name"
                                >
                                    {leadSources.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`KSH ${value.toLocaleString()}`, 'Revenue']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full mt-6">
                        {leadSources.slice(0, 4).map((source, index) => (
                            <div key={source.name} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-[10px] font-black text-slate-500 uppercase truncate">{source.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Volume Bar Chart */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Inquiry Volume</h3>
                        <p className="text-slate-400 text-xs font-bold mt-1">Booking counts per lead source</p>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={leadSources} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                />
                                <Bar 
                                    dataKey="count" 
                                    fill="#16a34a" 
                                    radius={[8, 8, 0, 0]}
                                    barSize={32}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-black text-[#333333] tracking-tight">Source Efficiency Index</h3>
                        <p className="text-slate-500 text-sm font-medium mt-1">Granular breakdown of marketing performance.</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Find source..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-6 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500 transition-all w-full sm:w-[300px] font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400">
                                <th className="py-5 px-10 text-[10px] font-black uppercase tracking-widest">Lead Source</th>
                                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-center">Volume</th>
                                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest">Total Value (KSH)</th>
                                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-center">ROI Share</th>
                                <th className="py-5 px-10 text-[10px] font-black uppercase tracking-widest text-right">Avg. Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredSources.map((source, index) => (
                                <tr key={source.name} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="py-6 px-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors border border-slate-200 uppercase font-black">
                                                {source.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900 uppercase leading-none">{source.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold mt-1.5">Direct attribution</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-6 text-center">
                                        <span className="text-sm font-black text-slate-900">{source.count} inquiries</span>
                                    </td>
                                    <td className="py-6 px-6">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-black text-slate-900">KSH {source.amount.toLocaleString()}</div>
                                            <div className="w-24 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                                <div 
                                                    className="h-full bg-brand-600 rounded-full" 
                                                    style={{ width: `${(source.amount / totalRevenue) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-6 text-center">
                                        <div className="inline-flex items-center px-4 py-1.5 rounded-xl bg-slate-50 text-[11px] font-black">
                                            {((source.amount / totalRevenue) * 100).toFixed(1)}%
                                        </div>
                                    </td>
                                    <td className="py-6 px-10 text-right">
                                        <div className="text-sm font-black text-slate-900 uppercase">KSH {(source.amount / source.count).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
