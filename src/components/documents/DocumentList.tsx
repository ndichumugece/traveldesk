import { useDocuments, useDeleteDocument } from '../../hooks/useDocuments';
import type { Document } from '../../hooks/useDocuments';
import { useQueryState } from '../../hooks/useQueryState';
import { Plus, Search, FileText, Loader2, Trash2, Zap } from 'lucide-react';

export function DocumentList({ onCreate, onEdit, onSync, typeFilter }: { onCreate: () => void, onEdit: (doc: Document) => void, onSync?: (doc: Document) => void, typeFilter?: string | null }) {
    const [searchTerm, setSearchTerm] = useQueryState<string>('search', '');
    const { 
        data, 
        isLoading, 
        isFetching, 
        isFetchingNextPage, 
        hasNextPage, 
        fetchNextPage 
    } = useDocuments(typeFilter);

    const deleteMutation = useDeleteDocument();

    const documents = data?.pages.flatMap(page => page.data) || [];

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.client.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
            case 'confirmed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (err: any) {
                alert('Error deleting document: ' + (err.message || 'Unknown error'));
            }
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
                <div className="flex items-center gap-3">
                    {isFetching && !isFetchingNextPage && (
                        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 px-3 py-1 rounded-full shadow-sm flex items-center gap-2 h-fit">
                            <Loader2 className="w-3 h-3 animate-spin text-brand-600" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Updating...</span>
                        </div>
                    )}
                    <button
                        onClick={onCreate}
                        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl transition-all duration-150 shadow-sm hover:shadow active:scale-95 font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        {getCreateLabel()}
                    </button>
                </div>
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

                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Reference</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created By</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client Name</th>
                                {typeFilter !== 'Booking' && typeFilter !== 'Voucher' && (
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                )}
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading && !documents.length ? (
                                <tr>
                                    <td colSpan={typeFilter === 'Booking' || typeFilter === 'Voucher' ? 6 : 7} className="py-12 text-center">
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
                                    {typeFilter !== 'Booking' && typeFilter !== 'Voucher' && (
                                        <td className="py-4 px-6 text-sm font-semibold text-slate-900">
                                            KSH {doc.amount.toLocaleString()}
                                        </td>
                                    )}
                                    <td className="py-4 px-6 text-sm text-slate-500">
                                        {doc.date}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(doc.status)}`}>
                                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {onSync && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSync(doc);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                    title="Sync/Convert Document"
                                                >
                                                    <Zap className="w-4 h-4 fill-current" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => handleDelete(e, doc.id)}
                                                disabled={deleteMutation.isPending}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Delete Document"
                                            >
                                                {deleteMutation.isPending ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-100">
                    {isLoading && !documents.length ? (
                        <div className="py-12 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
                        </div>
                    ) : filteredDocs.map((doc) => (
                        <div
                            key={doc.id}
                            onClick={() => onEdit(doc)}
                            className="p-4 active:bg-slate-50 transition-colors relative"
                        >
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-900 truncate">{doc.reference}</div>
                                        <div className="text-xs text-slate-500 truncate">{doc.client}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border shrink-0 ${getStatusColor(doc.status)}`}>
                                        {doc.status}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {onSync && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSync(doc);
                                                }}
                                                className="p-2 text-slate-300 hover:text-amber-600"
                                            >
                                                <Zap className="w-4 h-4 fill-current" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => handleDelete(e, doc.id)}
                                            className="p-2 text-slate-300 hover:text-rose-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-3 text-sm">
                                <div className="text-slate-500 font-medium">{doc.date}</div>
                                {typeFilter !== 'Booking' && typeFilter !== 'Voucher' && (
                                    <div className="font-bold text-slate-900">KSH {doc.amount.toLocaleString()}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {!isLoading && hasNextPage && (
                    <div className="p-4 border-t border-slate-100 flex justify-center">
                        <button
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium px-4 py-2 rounded-xl hover:bg-brand-50 transition-all disabled:opacity-50"
                        >
                            {isFetchingNextPage ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading more...
                                </>
                            ) : (
                                'Load More'
                            )}
                        </button>
                    </div>
                )}

                {!isLoading && filteredDocs.length === 0 && (
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
