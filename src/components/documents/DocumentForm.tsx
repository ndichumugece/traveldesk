import { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Loader2, Download } from 'lucide-react';
import { useDocuments } from '../../hooks/useDocuments';
import type { Document } from '../../hooks/useDocuments';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { DocumentPDF } from '../../lib/pdfEngine/DocumentPDF';
import { useSettings } from '../../hooks/useSettings';
import { useProperties } from '../../hooks/useProperties';
import { useActivities } from '../../hooks/useActivities';
import { differenceInDays, parseISO } from 'date-fns';

export function DocumentForm({ onDiscard, initialDoc }: { onDiscard: () => void, initialDoc?: Document | null }) {
    const { createDocument, updateDocument } = useDocuments();
    const { settings } = useSettings();
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [clientName, setClientName] = useState(initialDoc?.client || '');
    const [clientEmail, setClientEmail] = useState(initialDoc?.clientEmail || '');
    const [reference] = useState(initialDoc?.reference || `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
    const [issueDate, setIssueDate] = useState(initialDoc?.date || new Date().toISOString().split('T')[0]);
    const [checkIn, setCheckIn] = useState(initialDoc?.checkIn || '');
    const [checkOut, setCheckOut] = useState(initialDoc?.checkOut || '');
    const { properties } = useProperties();
    const { activities } = useActivities();
    const [activeSelection, setActiveSelection] = useState<{ id: number, type: 'category' | 'hotel' | 'activity' } | null>(null);

    const nights = (checkIn && checkOut) ? Math.max(0, differenceInDays(parseISO(checkOut), parseISO(checkIn))) : 0;

    const [lineItems, setLineItems] = useState<any[]>(
        initialDoc?.lineItems && initialDoc.lineItems.length > 0
            ? initialDoc.lineItems
            : [{ id: 1, description: '', quantity: 1, unitPrice: 0 }]
    );

    const addLineItem = () => {
        setLineItems([...lineItems, { id: Date.now(), description: '', quantity: 1, unitPrice: 0 }]);
    };

    const removeLineItem = (id: number) => {
        if (lineItems.length === 1) return; // Prevent removing the last item
        setLineItems(lineItems.filter(item => item.id !== id));
    };

    const updateLineItem = (id: number, field: string, value: string | number) => {
        setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    const handleSave = async () => {
        if (!clientName || !clientEmail || !reference || !issueDate) {
            alert('Please fill in all document details (Client Name, Email, Reference, Date).');
            return;
        }

        if (lineItems.length === 0 || !lineItems[0].description) {
            alert('Please provide a description for your line items.');
            return;
        }

        setIsSaving(true);

        let errorMsg = null;
        if (initialDoc?.id) {
            const { error } = await updateDocument(initialDoc.id, {
                reference,
                client_name: clientName,
                client_email: clientEmail,
                amount: subtotal,
                issue_date: issueDate,
                check_in: checkIn || null,
                check_out: checkOut || null,
                line_items: lineItems
            });
            errorMsg = error;
        } else {
            const { error } = await createDocument({
                reference,
                type: 'Quotation',
                client_name: clientName,
                client_email: clientEmail,
                amount: subtotal,
                status: 'pending',
                issue_date: issueDate,
                check_in: checkIn || null,
                check_out: checkOut || null,
                line_items: lineItems
            });
            errorMsg = error;
        }

        setIsSaving(false);
        if (errorMsg) {
            alert('Error saving document: ' + errorMsg);
        } else {
            onDiscard();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onDiscard}
                        disabled={isSaving}
                        className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{initialDoc ? 'Edit Document' : 'Create Quotation'}</h1>
                        <p className="text-slate-500 text-sm mt-0.5">{initialDoc ? 'Update the details of this document.' : 'Generate a new branded quotation for your client.'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {initialDoc && (
                        <PDFDownloadLink
                            document={<DocumentPDF
                                documentType={initialDoc.type}
                                reference={reference}
                                clientName={clientName}
                                clientEmail={clientEmail}
                                date={issueDate}
                                lineItems={lineItems}
                                settings={settings}
                            />}
                            fileName={`${clientName.replace(/[^a-zA-Z0-9 -]/g, '')}-${(lineItems?.[0]?.description || 'Hotel').replace(/[^a-zA-Z0-9 -]/g, '')}-${reference.replace(/[^a-zA-Z0-9 -]/g, '')}.pdf`}
                            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl transition-all duration-150 shadow-sm font-medium"
                        >
                            {/* @ts-ignore */}
                            {({ loading: pdfLoading }) => (
                                pdfLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Download className="w-4 h-4" /> Download PDF</>
                            )}
                        </PDFDownloadLink>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl transition-all duration-150 shadow-sm hover:shadow active:scale-95 font-medium disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {initialDoc ? 'Save Changes' : 'Save & Generate'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Client Details */}
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Client Details</h3>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Client Name</label>
                                    <input
                                        type="text"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                        placeholder="e.g. Sarah Jenkins"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                                    <input
                                        type="email"
                                        value={clientEmail}
                                        onChange={(e) => setClientEmail(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                        placeholder="sarah@example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Document Details */}
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Document Details</h3>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Issue Date</label>
                                    <input
                                        type="date"
                                        value={issueDate}
                                        onChange={(e) => setIssueDate(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 cursor-pointer"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Check-in Date</label>
                                        <input
                                            type="date"
                                            value={checkIn}
                                            onChange={(e) => setCheckIn(e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 cursor-pointer"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Check-out Date</label>
                                        <input
                                            type="date"
                                            value={checkOut}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Line Items */}
            <div className="mt-10 space-y-4">
                <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Line Items</h3>
                <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <div className="col-span-6">Description</div>
                        <div className="col-span-2">Quantity</div>
                        <div className="col-span-2">Unit Price</div>
                        <div className="col-span-2 text-right">Amount</div>
                    </div>

                    {lineItems.map((item) => (
                        <div key={item.id} className="relative bg-slate-50 p-2 pl-4 rounded-xl border border-slate-100">
                            <div className="grid grid-cols-12 gap-3 items-center">
                                <div className="col-span-6 relative">
                                    <input
                                        type="text"
                                        value={item.description}
                                        onFocus={() => setActiveSelection({ id: item.id, type: 'category' })}
                                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                        className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0 font-medium text-slate-900 placeholder:text-slate-400 text-sm"
                                        placeholder="Enter description"
                                    />

                                    {/* Category Selection Dropdown */}
                                    {activeSelection?.id === item.id && activeSelection?.type === 'category' && (
                                        <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <div className="p-2 border-b border-slate-50">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Select Category</span>
                                            </div>
                                            <div className="p-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveSelection({ id: item.id, type: 'hotel' });
                                                    }}
                                                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 group transition-colors"
                                                >
                                                    <span className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center text-xs group-hover:bg-amber-100 italic font-serif">H</span>
                                                    Hotels
                                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateLineItem(item.id, 'description', 'Transport: ');
                                                        setActiveSelection(null);
                                                    }}
                                                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 group transition-colors"
                                                >
                                                    <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs group-hover:bg-blue-100">🚗</span>
                                                    Transport
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveSelection({ id: item.id, type: 'activity' });
                                                    }}
                                                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 group transition-colors"
                                                >
                                                    <span className="w-6 h-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center text-xs group-hover:bg-rose-100">🧗</span>
                                                    Activities
                                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Hotel Selection Dropdown */}
                                    {activeSelection?.id === item.id && activeSelection?.type === 'hotel' && (
                                        <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <div className="p-2 border-b border-slate-50 flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Pick a Hotel</span>
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveSelection({ id: item.id, type: 'category' });
                                                }} className="text-[10px] text-brand-600 hover:underline px-2">Back</button>
                                            </div>
                                            <div className="p-1 max-h-64 overflow-y-auto">
                                                {properties.length === 0 ? (
                                                    <div className="p-4 text-center text-slate-400 text-xs italic">No hotels found. Add some in Properties first.</div>
                                                ) : (
                                                    properties.map(hotel => (
                                                        <button
                                                            key={hotel.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const desc = `${hotel.name} (${nights} nights)`;
                                                                setLineItems(lineItems.map(li =>
                                                                    li.id === item.id
                                                                        ? { ...li, description: desc, quantity: nights || 1, unitPrice: hotel.base_price }
                                                                        : li
                                                                ));
                                                                setActiveSelection(null);
                                                            }}
                                                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                                        >
                                                            <div className="font-semibold text-slate-900">{hotel.name}</div>
                                                            <div className="text-[10px] text-slate-500 font-normal">{hotel.location} • ${hotel.base_price}/night</div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Activity Selection Dropdown */}
                                    {activeSelection?.id === item.id && activeSelection?.type === 'activity' && (
                                        <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <div className="p-2 border-b border-slate-50 flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Pick an Activity</span>
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveSelection({ id: item.id, type: 'category' });
                                                }} className="text-[10px] text-brand-600 hover:underline px-2">Back</button>
                                            </div>
                                            <div className="p-1 max-h-64 overflow-y-auto">
                                                {activities.length === 0 ? (
                                                    <div className="p-4 text-center text-slate-400 text-xs italic">No activities found. Add some in Activities first.</div>
                                                ) : (
                                                    activities.map(activity => (
                                                        <button
                                                            key={activity.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const desc = `Activity: ${activity.name}`;
                                                                setLineItems(lineItems.map(li =>
                                                                    li.id === item.id
                                                                        ? { ...li, description: desc, quantity: 1, unitPrice: activity.price }
                                                                        : li
                                                                ));
                                                                setActiveSelection(null);
                                                            }}
                                                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                                        >
                                                            <div className="font-semibold text-slate-900">{activity.name}</div>
                                                            <div className="text-[10px] text-slate-500 font-normal">{activity.location} • ${activity.price}</div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                                        className="w-20 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.unitPrice}
                                            onChange={(e) => updateLineItem(item.id, 'unitPrice', Number(e.target.value))}
                                            className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2 flex items-center justify-end gap-3 pr-2">
                                    <span className="font-semibold text-slate-900 text-sm">
                                        ${(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <button
                                        onClick={() => removeLineItem(item.id)}
                                        disabled={lineItems.length === 1}
                                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button onClick={addLineItem} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-brand-600 hover:border-brand-300 hover:bg-brand-50 transition-all flex items-center justify-center gap-2 font-medium text-sm mt-4">
                        <Plus className="w-4 h-4" />
                        Add Line Item
                    </button>
                </div>

                <div className="flex justify-end pt-6">
                    <div className="w-64 space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex justify-between text-sm font-medium text-slate-600">
                            <span>Subtotal</span>
                            <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-3">
                            <span>Total Amount</span>
                            <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
