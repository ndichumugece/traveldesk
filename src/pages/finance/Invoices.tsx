import { useInvoices, useMarkInvoicePaid, useDeleteInvoice } from '../../hooks/useFinance';
import { Receipt, Search, FileText, Download, CheckCircle2, Loader2, Trash2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { useQueryState } from '../../hooks/useQueryState';
import { motion, useReducedMotion } from 'framer-motion';
import { containerVariants, listItemVariants } from '../../lib/animations';

export function Invoices() {
    const navigate = useNavigate();
    const { data: invoices = [], isLoading, isFetching } = useInvoices();
    const markPaid = useMarkInvoicePaid();
    const deleteInvoice = useDeleteInvoice();
    const [searchTerm, setSearchTerm] = useQueryState<string>('search', '');

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                await deleteInvoice.mutateAsync(id);
            } catch (err: any) {
                alert('Error deleting invoice: ' + (err.message || 'Unknown error'));
            }
        }
    };

    const filteredInvoices = invoices.filter(inv => 
        inv.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const shouldReduceMotion = useReducedMotion();

    if (isLoading && !invoices.length) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
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
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoices</h1>
                    <p className="text-slate-500 text-sm">Manage and track client invoices.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-full sm:w-64"
                        />
                    </div>
                    <motion.button 
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-colors"
                    >
                        <Receipt size={16} />
                        New Invoice
                    </motion.button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Invoice</th>
                                <th className="px-6 py-4">Client Name</th>
                                <th className="px-6 py-4">Issue Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <motion.tbody 
                            variants={containerVariants}
                            className="divide-y divide-slate-100"
                        >
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((inv) => (
                                    <motion.tr 
                                        key={inv.id} 
                                        variants={listItemVariants}
                                        className="hover:bg-slate-50/50 transition-colors group cursor-default"
                                    >
                                        <td className="px-6 py-4 font-bold text-slate-900">{inv.invoice_number}</td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{inv.client_name}</td>
                                        <td className="px-6 py-4 text-slate-500">{format(new Date(inv.issue_date), 'MMM d, yyyy')}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                inv.status === 'Paid' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                inv.status === 'Partial' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                "bg-rose-50 text-rose-600 border border-rose-100"
                                            )}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 text-right">KES {Number(inv.amount).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="View Details">
                                                    <FileText size={16} />
                                                </button>
                                                <button className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Download PDF">
                                                    <Download size={16} />
                                                </button>
                                                {inv.status !== 'Paid' && (
                                                    <button 
                                                        className={cn(
                                                            "p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors",
                                                            markPaid.isPending && "opacity-50 cursor-not-allowed"
                                                        )}
                                                        title="Mark Paid"
                                                        onClick={() => markPaid.mutate(inv.id)}
                                                        disabled={markPaid.isPending}
                                                    >
                                                        {markPaid.isPending ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 size={16} />
                                                        )}
                                                    </button>
                                                )}
                                                <button 
                                                    className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" 
                                                    title="Sync to Booking Voucher"
                                                    onClick={() => navigate('/booking-voucher', { 
                                                        state: { 
                                                            syncFrom: {
                                                                type: 'Booking',
                                                                client: inv.client_name,
                                                                amount: inv.amount,
                                                                date: inv.issue_date,
                                                                reference: `INV-SYNC-${inv.invoice_number}`,
                                                                syncSourceId: inv.booking_id
                                                            } 
                                                        } 
                                                    })}
                                                >
                                                    <Zap size={16} className="fill-current" />
                                                </button>
                                                <button 
                                                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" 
                                                    title="Delete Invoice"
                                                    onClick={() => handleDelete(inv.id)}
                                                    disabled={deleteInvoice.isPending}
                                                >
                                                    {deleteInvoice.isPending ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p>No invoices found matching your criteria.</p>
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
                    {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((inv) => (
                            <motion.div 
                                key={inv.id} 
                                variants={listItemVariants}
                                className="p-4 active:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-900 mb-1">{inv.invoice_number}</div>
                                        <div className="text-sm font-medium text-slate-600 truncate">{inv.client_name}</div>
                                        <div className="text-xs text-slate-400 mt-1">{format(new Date(inv.issue_date), 'MMM d, yyyy')}</div>
                                    </div>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0",
                                        inv.status === 'Paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        inv.status === 'Partial' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                        "bg-rose-50 text-rose-600 border-rose-100"
                                    )}>
                                        {inv.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="font-bold text-slate-900">KES {Number(inv.amount).toLocaleString()}</div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 rounded-lg text-slate-400 border border-slate-100">
                                            <Download size={16} />
                                        </button>
                                        <button 
                                            onClick={() => navigate('/booking-voucher', { 
                                                state: { 
                                                    syncFrom: {
                                                        type: 'Booking',
                                                        client: inv.client_name,
                                                        amount: inv.amount,
                                                        date: inv.issue_date,
                                                        reference: `INV-SYNC-${inv.invoice_number}`,
                                                        syncSourceId: inv.booking_id
                                                    } 
                                                } 
                                            })}
                                            className="p-2 rounded-lg text-slate-400 border border-slate-100 hover:text-amber-600"
                                            title="Sync to Booking Voucher"
                                        >
                                            <Zap size={16} className="fill-current" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(inv.id)}
                                            className="p-2 rounded-lg text-slate-400 border border-slate-100 hover:text-rose-600"
                                            title="Delete Invoice"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 text-xs font-bold">
                                            Details
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="px-6 py-12 text-center text-slate-500">
                            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p>No invoices found.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
