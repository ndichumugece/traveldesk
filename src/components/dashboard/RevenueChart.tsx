import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
    name: string;
    revenue: number;
}

interface RevenueChartProps {
    data: ChartData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    return (
        <div className="premium-card p-8 h-[480px] flex flex-col group">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Overview</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">Monthly performance insights</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Current Year
                </div>
            </div>

            <div className="flex-1 w-full -ml-4 pr-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                            dy={15}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                            tickFormatter={(value) => `KSH ${value >= 1000 ? (value / 1000) + 'k' : value}`}
                        />
                        <Tooltip
                            contentStyle={{ 
                                borderRadius: '16px', 
                                border: '1px solid #f1f5f9', 
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(8px)'
                            }}
                            itemStyle={{ color: '#1e293b', fontWeight: 800, fontSize: '14px' }}
                            labelStyle={{ color: '#94a3b8', fontWeight: 600, fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase' }}
                            formatter={(value: any) => [`KSH ${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#8b5cf6"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
