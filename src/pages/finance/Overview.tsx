import { useFinance } from '../../hooks/useFinance';
import { ArrowUpFromLine, ArrowDownToLine, Receipt, Loader2, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export function Overview() {
    const { payments, expenses, invoices, loading } = useFinance();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = totalRevenue - totalExpenses;
    
    const outstandingInvoicesCount = invoices.filter(i => i.status !== 'Paid').length;
    const outstandingInvoicesAmount = invoices
        .filter(i => i.status !== 'Paid')
        .reduce((sum, i) => sum + Number(i.amount), 0);

    const recentTransactions = [
        ...payments.map(p => ({ ...p, _type: 'payment', _date: p.payment_date })),
        ...expenses.map(e => ({ ...e, _type: 'expense', _date: e.payment_date || e.created_at }))
    ].sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime()).slice(0, 10);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Finance Overview</h1>
                <p className="text-slate-500 text-sm">Monitor your agency's financial health, track income, and manage expenses.</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                            <ArrowDownToLine size={20} />
                        </div>
                        <span className="text-sm font-semibold text-slate-500">Total Revenue</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">KES {totalRevenue.toLocaleString()}</h2>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                            <ArrowUpFromLine size={20} />
                        </div>
                        <span className="text-sm font-semibold text-slate-500">Total Expenses</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">KES {totalExpenses.toLocaleString()}</h2>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-sm font-semibold text-slate-500">Net Profit</span>
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-slate-900">KES {netProfit.toLocaleString()}</h2>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                            <Receipt size={20} />
                        </div>
                        <span className="text-sm font-semibold text-slate-500">Outstanding Invoices</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <h2 className="text-2xl font-bold text-slate-900">{outstandingInvoicesCount}</h2>
                        <span className="text-sm font-medium text-slate-400 mb-1">KES {outstandingInvoicesAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Recent Transactions List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
                    <Link to="/finance/reports" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View Full Ledger &rarr;</Link>
                </div>
                <div className="divide-y divide-slate-100">
                    {recentTransactions.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No recent transactions found.</div>
                    ) : (
                        recentTransactions.map((tx: any, idx) => (
                            <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                        tx._type === 'payment' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                    )}>
                                        {tx._type === 'payment' ? <ArrowDownToLine size={18} /> : <ArrowUpFromLine size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">
                                            {tx._type === 'payment' ? `Payment from ${tx.client_name}` : `Expense to ${tx.supplier_name}`}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5">
                                            <span>{format(new Date(tx._date), 'MMM d, yyyy')}</span>
                                            <span>•</span>
                                            <span className="uppercase">{tx.method || tx.payment_method || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={cn(
                                    "font-bold text-base",
                                    tx._type === 'payment' ? "text-emerald-600" : "text-rose-600"
                                )}>
                                    {tx._type === 'payment' ? '+' : '-'} KES {Number(tx.amount).toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
