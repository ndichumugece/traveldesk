import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    Loader2,
    Search
} from 'lucide-react';
import { useDetailedUserStats } from '../hooks/useDetailedUserStats';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';

const COLORS = ['#16a34a', '#D87D31', '#22c55e', '#FFC107', '#EF4444', '#3B82F6'];

export function SalesPerformance() {
    const navigate = useNavigate();
    const { data, loading, error } = useDetailedUserStats();
    const [searchTerm, setSearchTerm] = useState('');

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center min-h-[600px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-100">
                <p className="text-rose-600 font-bold">Error loading sales performance: {error || 'No data found'}</p>
            </div>
        );
    }

    const filteredAgents = data.agents.filter(agent => 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Team Performance</h1>
                        <p className="text-slate-500 mt-1 text-sm font-medium">High-resolution analysis of agent productivity and agency sales efficiency.</p>
                    </div>
                </div>
                <button className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-all shadow-md active:scale-95">
                    Export Performance Data
                </button>
            </div>

            {/* Metric Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Revenue</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900">KSH {data.totalTeamRevenue.toLocaleString()}</h4>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Performer</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 truncate uppercase">{data.topPerformer.name}</h4>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Sale</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900">KSH {data.avgSaleValue.toLocaleString()}</h4>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Close Rate</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900">{data.teamConversionRate.toFixed(1)}%</h4>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <div className="lg:col-span-2 bg-[#1E1E2E] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">Agency Revenue Growth</h3>
                                <p className="text-slate-400 text-xs font-bold mt-1">Monthly performance trend for {new Date().getFullYear()}</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.monthlyGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis 
                                        dataKey="month" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
                                        tickFormatter={(val) => `KSH ${(val / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#2D2D44', border: 'none', borderRadius: '16px', color: '#fff' }}
                                        itemStyle={{ color: '#fff', fontWeight: 800 }}
                                        formatter={(val: any) => [`KSH ${val.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#16a34a" 
                                        strokeWidth={4} 
                                        fillOpacity={1} 
                                        fill="url(#colorRev)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Sales Split */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Breakdown</h3>
                        <p className="text-slate-400 text-xs font-bold mt-1">Contribution by agent</p>
                    </div>
                    <div className="h-[240px] w-full my-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.agents}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="totalRevenue"
                                >
                                    {data.agents.map((_, index) => (
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
                    <div className="space-y-3">
                        {data.agents.slice(0, 4).map((agent, index) => (
                            <div key={agent.userId} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-[10px] font-black text-slate-500 uppercase truncate max-w-[120px]">{agent.name}</span>
                                </div>
                                <span className="text-[10px] font-black text-slate-900">{agent.contribution.toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Leaderboard */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Agent Performance Index</h3>
                        <p className="text-slate-500 text-sm font-medium mt-1">Comprehensive leaderboard of team results.</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Find agent..." 
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
                                <th className="py-5 px-10 text-[10px] font-black uppercase tracking-widest">Agent Detail</th>
                                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-center">Bookings</th>
                                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest">Revenue (KSH)</th>
                                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-center">Conv. Rate</th>
                                <th className="py-5 px-10 text-[10px] font-black uppercase tracking-widest text-right">Avg. Deal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredAgents.map((agent) => (
                                <tr key={agent.userId} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="py-6 px-10">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors border border-slate-200 uppercase font-black">
                                                    {agent.name.charAt(0)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900 uppercase leading-none">{agent.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold mt-1.5">{agent.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-6 text-center">
                                        <div className="inline-flex flex-col">
                                            <span className="text-sm font-black text-slate-900">{agent.bookings}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">confirmed</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-6">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-black text-slate-900">KSH {agent.totalRevenue.toLocaleString()}</div>
                                            <div className="w-24 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                                <div 
                                                    className="h-full bg-brand-600 rounded-full"
                                                    style={{ width: `${agent.contribution}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-6 text-center">
                                        <div className="inline-flex items-center px-4 py-1.5 rounded-xl bg-slate-50 text-[11px] font-black">
                                            {agent.conversionRate.toFixed(1)}%
                                        </div>
                                    </td>
                                    <td className="py-6 px-10 text-right">
                                        <div className="text-sm font-black text-slate-900 uppercase">KSH {agent.avgDealSize.toLocaleString()}</div>
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
