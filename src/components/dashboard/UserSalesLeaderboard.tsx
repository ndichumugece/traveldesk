import { TrendingUp, Users, Loader2 } from 'lucide-react';
import { useUserSales } from '../../hooks/useUserSales';

export function UserSalesLeaderboard() {
    const { salesData, loading, error } = useUserSales();

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 flex items-center justify-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#5438FF]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <p className="text-rose-500 text-sm font-medium">Error loading sales performance: {error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">User Sales Performance</h3>
                        <p className="text-xs text-slate-500">Sales volume by agent</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">{salesData.length} Agents</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 px-6">
                            <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Agent</th>
                            <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Sales Count</th>
                            <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Total Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {salesData.length > 0 ? (
                            salesData.map((user) => (
                                <tr key={user.userId} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs ring-2 ring-white group-hover:ring-brand-50 transition-all">
                                                {user.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 leading-none">{user.userName}</p>
                                                <p className="text-[11px] text-slate-500 mt-1">{user.userEmail}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                                            {user.documentCount} docs
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <p className="text-sm font-bold text-slate-900">KSH {user.totalSales.toLocaleString()}</p>
                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 ml-auto overflow-hidden">
                                            <div 
                                                className="h-full bg-brand-500 rounded-full" 
                                                style={{ width: `${Math.min(100, (user.totalSales / (salesData[0]?.totalSales || 1)) * 100)}%` }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="py-12 px-6 text-center">
                                    <p className="text-sm text-slate-400 italic">No sales data available yet.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
