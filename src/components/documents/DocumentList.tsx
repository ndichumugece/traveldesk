import { useState } from 'react';
import { Plus, Search, FileText, Loader2 } from 'lucide-react';
import { useDocuments } from '../../hooks/useDocuments';
import type { Document } from '../../hooks/useDocuments';

export function DocumentList({ onCreate, onEdit, typeFilter }: { onCreate: () => void, onEdit: (doc: Document) => void, typeFilter?: string | null }) {
    const [searchTerm, setSearchTerm] = useState('');
    const { documents, loading } = useDocuments();

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !typeFilter || doc.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
            case 'confirmed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getPageTitle = () => {
        if (!typeFilter) return 'All Documents';
        switch (typeFilter) {
            case 'Voucher': return 'Confirmation Vouchers';
            case 'Booking': return 'Booking Vouchers';
            case 'Quotation': return 'Quotations';
            case 'Invoice': return 'Invoices';
            default: return typeFilter + 's';
        }
    };

    const getCreateLabel = () => {
        if (!typeFilter) return 'Create Document';
        return `Create ${typeFilter}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{getPageTitle()}</h1>
                    <p className="text-slate-500 mt-1">Manage your {typeFilter ? typeFilter.toLowerCase() + 's' : 'documents'}.</p>
                </div>
                <button
                    onClick={onCreate}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl transition-all duration-150 shadow-sm hover:shadow active:scale-95 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    {getCreateLabel()}
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder={`Search ${typeFilter ? typeFilter.toLowerCase() + 's' : 'documents'}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 placeholder:text-slate-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created By</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client Name</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredDocs.map((doc) => (
                                <tr
                                    key={doc.id}
                                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                                    onClick={() => onEdit(doc)}
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <span className="font-medium text-slate-900 group-hover:text-brand-600 transition-colors">
                                                {doc.reference}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-900">{doc.createdBy}</span>
                                            {doc.createdByEmail && <span className="text-xs text-slate-500">{doc.createdByEmail}</span>}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-700">
                                        {doc.client}
                                    </td>
                                    <td className="py-4 px-6 text-sm font-semibold text-slate-900">
                                        ${doc.amount.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-500">
                                        {doc.date}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(doc.status)}`}>
                                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredDocs.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-lg font-medium text-slate-900">No {typeFilter ? typeFilter.toLowerCase() + 's' : 'documents'} found</p>
                        <p className="text-sm">Get started by creating a new {typeFilter ? typeFilter.toLowerCase() : 'quotation'}.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
