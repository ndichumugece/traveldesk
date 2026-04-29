import { Users, Loader2, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserSales } from '../../hooks/useUserSales';
import { useAuth } from '../../lib/AuthContext';
import { cn } from '../../lib/utils';
import { motion, useReducedMotion } from 'framer-motion';
import { cardVariants, containerVariants, listItemVariants } from '../../lib/animations';

export function UserSalesLeaderboard() {
    const { salesData, loading, error } = useUserSales();
    const { user: currentUser } = useAuth();

    const shouldReduceMotion = useReducedMotion();

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 flex items-center justify-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
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
        <motion.div 
            initial={shouldReduceMotion ? { opacity: 0 } : "initial"}
            whileInView="animate"
            viewport={{ once: true }}
            variants={cardVariants}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full"
        >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div>
                        <h3 className="font-bold text-slate-900">User Sales Performance</h3>
                        <p className="text-xs text-slate-500">Sales volume by agent</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">{salesData.length} Agents</span>
                    </div>
                    <Link 
                        to="/sales-performance"
                        className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:shadow-md transition-all active:scale-95 group/arrow"
                    >
                        <ArrowUpRight className="w-5 h-5 group-hover/arrow:rotate-45 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* List Content */}
            <motion.div 
                variants={containerVariants}
                className="flex-1 p-6 space-y-8 overflow-y-auto"
            >
                {salesData.length > 0 ? (
                    salesData.map((user, index) => {
                        const maxSales = salesData[0]?.totalSales || 1;
                        const progressWidth = (user.totalSales / maxSales) * 100;
                        
                        return (
                            <motion.div 
                                key={user.userId} 
                                variants={listItemVariants}
                                className="group relative"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-4">
                                        {/* Rank Badge */}
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                                            index === 0 ? "bg-[#FFF9E5] text-[#D87D31]" : 
                                            index === 1 ? "bg-[#F0F9FF] text-[#0284C7]" : 
                                            index === 2 ? "bg-[#FDF2F2] text-[#DC2626]" : 
                                            "bg-slate-50 text-slate-500"
                                        )}>
                                            #{index + 1}
                                        </div>
                                        
                                        <div>
                                            <p className="text-base font-bold text-[#333333] leading-none mb-1">
                                                {user.userName}
                                                {user.userId === currentUser?.id && (
                                                    <span className="ml-2 text-[10px] font-bold text-brand-500 uppercase tracking-wider">
                                                        (You)
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs font-medium text-slate-400">
                                                {user.documentCount} total bookings
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-lg font-black text-[#333333] leading-tight">
                                            KES {user.totalSales.toLocaleString()}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            Total Sales
                                        </p>
                                    </div>
                                </div>

                                {/* Thick Progress Bar */}
                                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${progressWidth}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                        className={cn(
                                            "h-full rounded-full",
                                            index === 0 ? "bg-[#FFC107]" : 
                                            index === 1 ? "bg-[#FFC107]/60" : 
                                            index === 2 ? "bg-[#FFC107]/40" : 
                                            "bg-[#FFC107]/20"
                                        )}
                                    />
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="py-12 text-center">
                        <p className="text-sm text-slate-400 italic">No sales data available yet.</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
