import { usePayments } from '../../hooks/useFinance';
import { ArrowDownToLine, Search, Plus, Calendar, User, Wallet, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useQueryState } from '../../hooks/useQueryState';
import { motion, useReducedMotion } from 'framer-motion';
import { containerVariants, listItemVariants } from '../../lib/animations';

export function Payments() {
    const { data: payments = [], isLoading, isFetching } = usePayments();
    const [searchTerm, setSearchTerm] = useQueryState<string>('search', '');

    const filteredPayments = payments.filter(pay => 
        pay.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pay.reference_number && pay.reference_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const shouldReduceMotion = useReducedMotion();

    if (isLoading && !payments.length) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <motion.div 
            initial="initial"
            animate="animate"
            variants={shouldReduceMotion ? {} : containerVariants}
            className="space-y-6 relative"
        >
            {isFetching && (
                <div className="absolute -top-2 right-0 z-50">
                    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 px-3 py-1 rounded-full shadow-sm flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin text-brand-600" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Updating...</span>
                    </div>
                </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments Received</h1>
                    <p className="text-slate-500 text-sm">Track all money coming in from your clients.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search payments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-full sm:w-64"
                        />
                    </div>
                    <motion.button 
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-colors shrink-0 flex-1 sm:flex-none"
                    >
                        <Plus size={16} />
                        <span className="hidden xs:inline">Record Payment</span>
                        <span className="xs:hidden">Record</span>
                    </motion.button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Client</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Method</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Reference</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <motion.tbody 
                            variants={containerVariants}
                            className="divide-y divide-slate-100"
                        >
                            {filteredPayments.length > 0 ? (
                                filteredPayments.map((pay) => (
                                    <motion.tr 
                                        key={pay.id} 
                                        variants={listItemVariants}
                                        className="hover:bg-slate-50/50 transition-colors cursor-default"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Calendar size={14} />
                                                {format(new Date(pay.payment_date), 'MMM d, yyyy')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                    <User size={14} />
                                                </div>
                                                <span className="font-bold text-slate-900">{pay.client_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                <Wallet size={14} className="text-slate-400" />
                                                {pay.method}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                                            {pay.reference_number || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-emerald-600">KES {Number(pay.amount).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase">Completed</span>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <ArrowDownToLine className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p>No payments recorded yet.</p>
                                    </td>
                                </tr>
                            )}
                        </motion.tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <motion.div 
                    variants={containerVariants}
                    className="md:hidden divide-y divide-slate-100"
                >
                    {filteredPayments.length > 0 ? (
                        filteredPayments.map((pay) => (
                            <motion.div 
                                key={pay.id} 
                                variants={listItemVariants}
                                className="p-4 active:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-900">{pay.client_name}</div>
                                        <div className="text-xs text-slate-500 mt-1">{format(new Date(pay.payment_date), 'MMM d, yyyy')}</div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="font-bold text-emerald-600">KES {Number(pay.amount).toLocaleString()}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">{pay.method}</div>
                                    </div>
                                </div>
                                {pay.reference_number && (
                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded w-fit">
                                        Ref: {pay.reference_number}
                                    </div>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <div className="px-6 py-12 text-center text-slate-500">
                            <ArrowDownToLine className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p>No payments found.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
