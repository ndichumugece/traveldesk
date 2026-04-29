import { useFinance } from '../../hooks/useFinance';
import { Wallet, Plus, ArrowRightLeft, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';

export function Accounts() {
    const { accounts, payments, expenses, loading, isFetching, refetch } = useFinance();
    const { agencyId } = useAuth();
    const [isCreating, setIsCreating] = useState(false);

    if (loading && !accounts.length) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

    const handleCreateDefaultAccounts = async () => {
        if (!agencyId || isCreating) return;
        setIsCreating(true);
        try {
            const defaults = [
                { name: 'Main Bank Account', type: 'Bank', balance: 0, agency_id: agencyId },
                { name: 'M-Pesa Paybill', type: 'M-Pesa', balance: 0, agency_id: agencyId },
                { name: 'Petty Cash', type: 'Cash', balance: 0, agency_id: agencyId }
            ];
            
            for (const acc of defaults) {
                // Check if account already exists with that type
                if (!accounts.find(a => a.type === acc.type)) {
                    await supabase.from('finance_accounts').insert(acc);
                }
            }
            refetch();
        } catch (err) {
            console.error('Error creating default accounts:', err);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Accounts</h1>
                    <p className="text-slate-500 text-sm">Manage your M-Pesa, Bank, and Cash balances.</p>
                </div>
                {isFetching && (
                    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 px-3 py-1 rounded-full shadow-sm flex items-center gap-2 h-fit">
                        <Loader2 className="w-3 h-3 animate-spin text-brand-600" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Updating...</span>
                    </div>
                )}
                {accounts.length === 0 && (
                    <button
                        onClick={handleCreateDefaultAccounts}
                        disabled={isCreating}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-colors disabled:opacity-50"
                    >
                        {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        Create Default Accounts
                    </button>
                )}
            </div>

            <div className="bg-brand-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
                <div className="relative z-10 flex flex-col gap-2">
                    <span className="text-brand-200 font-medium text-sm">Total Available Balance</span>
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">KES {totalBalance.toLocaleString()}</h2>
                </div>
            </div>

            {accounts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {accounts.map(account => (
                        <div key={account.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 relative group overflow-hidden">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                        <Wallet size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{account.name}</h3>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{account.type}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900">KES {Number(account.balance).toLocaleString()}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">No Accounts Found</h3>
                    <p className="text-slate-500 text-sm mt-1">Click the button above to set up your default M-Pesa, Bank, and Cash accounts.</p>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">Account Ledger</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {/* Simplified mixed view of payments and expenses */}
                    {[...payments.map(p => ({ ...p, _type: 'in', _date: p.payment_date })), ...expenses.map(e => ({ ...e, _type: 'out', _date: e.payment_date || e.created_at }))]
                        .sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime())
                        .map((tx: any, idx) => {
                            const account = accounts.find(a => a.id === tx.account_id);
                            return (
                                <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                            tx._type === 'in' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                        )}>
                                            {tx._type === 'in' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">
                                                {tx._type === 'in' ? `Received from ${tx.client_name}` : `Paid to ${tx.supplier_name}`}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                                                <span>{format(new Date(tx._date), 'MMM d, yyyy')}</span>
                                                {account && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">{account.name}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "font-bold text-base whitespace-nowrap text-right",
                                        tx._type === 'in' ? "text-emerald-600" : "text-rose-600"
                                    )}>
                                        {tx._type === 'in' ? '+' : '-'} KES {Number(tx.amount).toLocaleString()}
                                    </div>
                                </div>
                            );
                        })}
                    {payments.length === 0 && expenses.length === 0 && (
                        <div className="p-8 text-center text-slate-500">No ledger entries yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
