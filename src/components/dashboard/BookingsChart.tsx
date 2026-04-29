import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BookingsChartProps {
    data: any[];
    range?: 'week' | 'month' | 'year';
    href?: string;
}

export function BookingsChart({ data, range = 'year', href }: BookingsChartProps) {
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);
    const rangeLabel = range === 'week' ? 'Last 7 days' : range === 'month' ? 'Last 30 days' : 'Current year';

    return (
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 min-h-[450px] flex flex-col">
            <div className="flex items-start justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Total Bookings</h3>
                        <p className="text-slate-500 text-sm font-medium mt-1">{range === 'year' ? 'Monthly' : 'Daily'} volume for {rangeLabel}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-3xl font-black text-[#6366F1]">{totalCount}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Range Total</div>
                    </div>
                </div>
            </div>

            <div className="h-[280px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                        />
                        <Tooltip
                            contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: 'none', 
                                borderRadius: '16px',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                            }}
                            cursor={{ fill: '#f1f5f9' }}
                        />
                        <Bar 
                            dataKey="count" 
                            radius={[12, 12, 12, 12]}
                            barSize={32}
                        >
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.count > 0 ? '#FFE8C8' : '#f1f5f9'} 
                                    className="hover:fill-[#FFD8A8] transition-colors duration-300"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
