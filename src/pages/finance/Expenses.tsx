import { useExpenses } from '../../hooks/useFinance';
import { ArrowUpFromLine, Search, Plus, Calendar, Building2, Tag, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { useQueryState } from '../../hooks/useQueryState';
import { motion, useReducedMotion } from 'framer-motion';
import { containerVariants, listItemVariants } from '../../lib/animations';

export function Expenses() {
    const { data: expenses = [], isLoading, isFetching } = useExpenses();
    const [searchTerm, setSearchTerm] = useQueryState<string>('search', '');

    const filteredExpenses = expenses.filter(exp => 
        exp.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const shouldReduceMotion = useReducedMotion();

    if (isLoading && !expenses.length) {
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
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expenses</h1>
                    <p className="text-slate-500 text-sm">Track all payments made to suppliers and other costs.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search expenses..."
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
                        <span className="hidden xs:inline">Add Expense</span>
                        <span className="xs:hidden">Add</span>
                    </motion.button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Supplier</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <motion.tbody 
                            variants={containerVariants}
                            className="divide-y divide-slate-100"
                        >
                            {filteredExpenses.length > 0 ? (
                                filteredExpenses.map((exp) => (
                                    <motion.tr 
                                        key={exp.id} 
                                        variants={listItemVariants}
                                        className="hover:bg-slate-50/50 transition-colors cursor-default"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Calendar size={14} />
                                                {format(new Date(exp.payment_date || exp.created_at), 'MMM d, yyyy')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                                                    <Building2 size={14} />
                                                </div>
                                                <span className="font-bold text-slate-900">{exp.supplier_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Tag size={14} className="text-slate-400" />
                                                {exp.category}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                                                exp.status === 'Paid' 
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                                    : "bg-amber-50 text-amber-600 border-amber-100"
                                            )}>
                                                {exp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-slate-900 text-base">KES {Number(exp.amount).toLocaleString()}</span>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <ArrowUpFromLine className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p>No expenses found.</p>
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
                    {filteredExpenses.length > 0 ? (
                        filteredExpenses.map((exp) => (
                            <motion.div 
                                key={exp.id} 
                                variants={listItemVariants}
                                className="p-4 active:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-900">{exp.supplier_name}</div>
                                        <div className="text-xs text-slate-500 mt-1">{format(new Date(exp.payment_date || exp.created_at), 'MMM d, yyyy')}</div>
                                    </div>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border shrink-0",
                                        exp.status === 'Paid' 
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                            : "bg-amber-50 text-amber-600 border-amber-100"
                                    )}>
                                        {exp.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Tag size={12} />
                                        {exp.category}
                                    </div>
                                    <div className="font-bold text-slate-900">KES {Number(exp.amount).toLocaleString()}</div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="px-6 py-12 text-center text-slate-500">
                            <ArrowUpFromLine className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p>No expenses found.</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Quick Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm">Payables Warning</h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                            You have {expenses.filter(e => e.status === 'Pending').length} pending supplier payments that need attention.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
