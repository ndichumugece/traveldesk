import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
    name: string;
    revenue: number;
}

interface RevenueChartProps {
    data: ChartData[];
    range?: 'week' | 'month' | 'year';
    href?: string;
}

export function RevenueChart({ data, range = 'year' }: RevenueChartProps) {
    const rangeLabel = range === 'week' ? 'Last 7 days' : range === 'month' ? 'Last 30 days' : 'Current year';
    
    return (
        <div className="bg-[#1AA385] rounded-[3rem] p-12 shadow-2xl min-h-[480px] relative overflow-hidden group">
            {/* Soft Glow Background */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/5 rounded-full -ml-20 -mb-20 blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 mb-10 flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Revenue Overview</h3>
                    <p className="text-white/70 text-sm font-medium mt-1">{range === 'year' ? 'Monthly' : 'Daily'} revenue for {rangeLabel}</p>
                </div>
            </div>

            <div className="h-[280px] w-full relative z-10 mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fff" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600 }}
                            tickFormatter={(value) => `KSH ${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{ 
                                backgroundColor: '#147a66', 
                                border: 'none', 
                                borderRadius: '16px', 
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#fff', fontWeight: 700 }}
                            formatter={(value: any) => [`KSH ${value}`, 'Revenue']}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#fff"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
