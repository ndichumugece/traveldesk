import { useFinance } from '../../hooks/useFinance';
import { FileText, TrendingUp, PieChart, BarChart3, Loader2, Download } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { containerVariants, listItemVariants, cardVariants } from '../../lib/animations';

export function Reports() {
    const { payments, expenses, loading, isFetching } = useFinance();

    const shouldReduceMotion = useReducedMotion();

    if (loading && !payments.length && !expenses.length) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const grossProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return (
        <motion.div 
            initial="initial"
            animate="animate"
            variants={shouldReduceMotion ? {} : containerVariants}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Reports</h1>
                    <p className="text-slate-500 text-sm">Analyze your agency's performance and profitability.</p>
                </div>
                {isFetching && (
                    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 px-3 py-1 rounded-full shadow-sm flex items-center gap-2 h-fit">
                        <Loader2 className="w-3 h-3 animate-spin text-brand-600" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Updating...</span>
                    </div>
                )}
                <motion.button 
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors shrink-0"
                >
                    <Download size={16} />
                    Export All Reports
                </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profit & Loss Card */}
                <motion.div 
                    variants={cardVariants}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                                <FileText size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Profit & Loss Summary</h3>
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">All Time</span>
                    </div>
                    <div className="p-6 flex-1 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">Total Income</span>
                                <span className="font-bold text-emerald-600">KES {totalRevenue.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">Total Expenses</span>
                                <span className="font-bold text-rose-600">(KES {totalExpenses.toLocaleString()})</span>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-base font-bold text-slate-900">Gross Profit</span>
                                <span className="text-xl font-black text-slate-900">KES {grossProfit.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-brand-600">
                                    <TrendingUp size={16} />
                                </div>
                                <span className="text-sm font-bold text-slate-600">Profit Margin</span>
                            </div>
                            <span className="text-lg font-black text-brand-600">{margin.toFixed(1)}%</span>
                        </div>
                    </div>
                </motion.div>

                {/* Performance Visualizers Placeholder */}
                <div className="grid grid-cols-1 gap-6">
                    <motion.div 
                        variants={cardVariants}
                        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <PieChart size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Revenue Distribution</h3>
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center py-8">
                             <div className="text-center">
                                <BarChart3 className="w-16 h-16 text-slate-100 mx-auto mb-2" />
                                <p className="text-sm text-slate-400 font-medium">Chart visualization will appear here<br/>as transaction data grows.</p>
                             </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Additional Reports Links */}
            <motion.div 
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                {['Cash Flow Statement', 'Supplier Payables', 'Client Aging Report'].map((report) => (
                    <motion.button 
                        key={report} 
                        variants={listItemVariants}
                        whileTap={{ scale: 0.98 }}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-200 hover:bg-brand-50/30 transition-all text-left group"
                    >
                        <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{report}</h4>
                        <p className="text-xs text-slate-500 mt-1">Generate a detailed {report.toLowerCase()} for the current period.</p>
                    </motion.button>
                ))}
            </motion.div>
        </motion.div>
    );
}
