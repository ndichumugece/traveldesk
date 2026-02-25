import { useState } from 'react';
import { Users, Train, Car, Home, Ticket, Calculator, ChevronRight, Info } from 'lucide-react';

const TRAIN_TYPES = [
    { label: 'Economy', value: 'economy', price: 2000 },
    { label: 'Business', value: 'business', price: 5000 },
    { label: 'First Class', value: 'first', price: 10000 },
];

const TRANSPORT_TYPES = [
    { label: 'Salon car', value: 'salon', price: 8000, capacity: 3 },
    { label: 'Noah', value: 'noah', price: 12000, capacity: 5 },
    { label: 'Van (9 seater)', value: 'van_9', price: 15000, capacity: 9 },
    { label: 'Van (13 seater)', value: 'van_13', price: 20000, capacity: 13 },
    { label: 'Bus (Rosa)', value: 'bus_rosa', price: 35000, capacity: 22 },
];

const ROOM_DAILY_RATE = 30000; // Example rate for Two Bedroom

const EVENT_TICKET_TYPES = [
    { label: 'Standard', value: 'standard', price: 3000 },
    { label: 'VIP', value: 'vip', price: 7000 },
    { label: 'VVIP', value: 'vvip', price: 15000 },
];

export function Summertides() {
    // State
    const [numGuests, setNumGuests] = useState(2);
    const [trainType, setTrainType] = useState('economy');
    const [transportType, setTransportType] = useState('salon');
    const [numNights, setNumNights] = useState(2);
    const [wantsTickets, setWantsTickets] = useState('no');
    const [ticketType, setTicketType] = useState('standard');

    // Calculations
    const trainPpp = TRAIN_TYPES.find(t => t.value === trainType)?.price || 0;

    const totalTransport = TRANSPORT_TYPES.find(t => t.value === transportType)?.price || 0;
    const transportPpp = totalTransport / numGuests;

    const totalRoom = ROOM_DAILY_RATE * numNights;
    const accommodationPpp = totalRoom / numGuests;

    const ticketPpp = wantsTickets === 'yes' ? (EVENT_TICKET_TYPES.find(t => t.value === ticketType)?.price || 0) : 0;

    const finalTotalPpp = trainPpp + transportPpp + accommodationPpp + ticketPpp;

    const cardBase = "bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-brand-200 transition-colors";
    const labelBase = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";
    const selectBase = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 appearance-none cursor-pointer";

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-widest mb-3">
                        Package Builder
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Summertides Calculator</h1>
                    <p className="text-slate-500 mt-1">Automated pricing for Summertides hotel packages.</p>
                </div>
                <div className="bg-brand-600 rounded-2xl p-6 text-white shadow-xl shadow-brand-500/20 flex flex-col items-end min-w-[240px]" style={{ backgroundColor: '#4f46e5' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Final Price Per Person</span>
                    <div className="text-4xl font-black tabular-nums text-white">
                        ${finalTotalPpp.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-[10px] font-medium opacity-60 mt-2">All inclusive estimate</div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input Sections */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Section 1: Groups */}
                    <div className={cardBase}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Users size={18} />
                            </div>
                            <h3 className="font-bold text-slate-900">Group Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelBase}>Number of Guests</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="2"
                                        max="22"
                                        value={numGuests}
                                        onChange={(e) => setNumGuests(parseInt(e.target.value))}
                                        className="flex-1 accent-indigo-600"
                                    />
                                    <span className="w-12 text-center font-black text-indigo-600 text-lg">{numGuests}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 italic font-medium">shared costs are divided by this number</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Train */}
                    <div className={cardBase}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Train size={18} />
                            </div>
                            <h3 className="font-bold text-slate-900">Train Transport</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <label className={labelBase}>Ticket Type</label>
                                <select
                                    value={trainType}
                                    onChange={(e) => setTrainType(e.target.value)}
                                    className={selectBase}
                                >
                                    {TRAIN_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-[10px] text-slate-400 uppercase font-black mb-1">Cost Per Person</span>
                                <span className="text-xl font-bold text-slate-900">${trainPpp.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Ground Transport */}
                    <div className={cardBase}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Car size={18} />
                            </div>
                            <h3 className="font-bold text-slate-900">Ground Transport</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <label className={labelBase}>Vehicle Selection</label>
                                <select
                                    value={transportType}
                                    onChange={(e) => setTransportType(e.target.value)}
                                    className={selectBase}
                                >
                                    {TRANSPORT_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label} (up to {t.capacity})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-[10px] text-slate-400 uppercase font-black mb-1">Shared Cost Result</span>
                                <span className="text-xl font-bold text-slate-900">${transportPpp.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs text-slate-400 font-medium">per person</span></span>
                                <p className="text-[10px] text-slate-400 mt-1 italic font-medium">Total vessel cost: ${totalTransport.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Accommodation */}
                    <div className={cardBase}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                <Home size={18} />
                            </div>
                            <h3 className="font-bold text-slate-900">Accommodation</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelBase}>Unit Type</label>
                                <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-500 text-sm">
                                    Summertides Two Bedroom
                                </div>
                            </div>
                            <div>
                                <label className={labelBase}>Number of Nights</label>
                                <select
                                    value={numNights}
                                    onChange={(e) => setNumNights(parseInt(e.target.value))}
                                    className={selectBase}
                                >
                                    {[2, 3, 4, 5, 6].map(n => (
                                        <option key={n} value={n}>{n} Nights</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-[10px] text-slate-400 uppercase font-black mb-1">Accommodation Result</span>
                                <span className="text-xl font-bold text-slate-900">${accommodationPpp.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs text-slate-400 font-medium">per person</span></span>
                                <p className="text-[10px] text-slate-400 mt-1 italic font-medium">Total room cost: ${totalRoom.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Tickets */}
                    <div className={cardBase}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                <Ticket size={18} />
                            </div>
                            <h3 className="font-bold text-slate-900">Event Tickets</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className={labelBase}>Tickets Required?</label>
                                <select
                                    value={wantsTickets}
                                    onChange={(e) => setWantsTickets(e.target.value)}
                                    className={selectBase}
                                >
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                </select>
                            </div>
                            {wantsTickets === 'yes' && (
                                <>
                                    <div>
                                        <label className={labelBase}>Ticket Category</label>
                                        <select
                                            value={ticketType}
                                            onChange={(e) => setTicketType(e.target.value)}
                                            className={selectBase}
                                        >
                                            {EVENT_TICKET_TYPES.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="text-[10px] text-slate-400 uppercase font-black mb-1">Per Person Cost</span>
                                        <span className="text-xl font-bold text-slate-900">${ticketPpp.toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary Breakdown */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white sticky top-6 shadow-2xl" style={{ backgroundColor: '#0f172a' }}>
                        <div className="flex items-center gap-3 mb-8">
                            <Calculator className="text-brand-400" size={24} />
                            <h3 className="text-xl font-bold text-white">Price Breakdown</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Train Travel</p>
                                    <p className="text-sm font-semibold text-white">{TRAIN_TYPES.find(t => t.value === trainType)?.label}</p>
                                </div>
                                <span className="font-bold text-lg text-white">${trainPpp.toLocaleString()}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Ground Transfer</p>
                                    <p className="text-sm font-semibold text-white">{TRANSPORT_TYPES.find(t => t.value === transportType)?.label}</p>
                                </div>
                                <span className="font-bold text-lg text-white">${transportPpp.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Summertides Unit</p>
                                    <p className="text-sm font-semibold text-white">{numNights} Nights (Shared)</p>
                                </div>
                                <span className="font-bold text-lg text-white">${accommodationPpp.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Event Ticket</p>
                                    <p className="text-sm font-semibold text-white">{wantsTickets === 'yes' ? EVENT_TICKET_TYPES.find(t => t.value === ticketType)?.label : 'None'}</p>
                                </div>
                                <span className="font-bold text-lg text-white">${ticketPpp.toLocaleString()}</span>
                            </div>

                            <div className="pt-8 border-t border-slate-800 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Per Person</span>
                                    <span className="text-3xl font-black text-brand-400">${finalTotalPpp.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                                <button className="w-full bg-brand-500 hover:bg-brand-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                                    Use for Quotation <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-slate-800/50 rounded-2xl flex items-start gap-3">
                            <Info className="text-slate-500 mt-1 shrink-0" size={16} />
                            <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
                                This calculation includes all selected services. Prices are subject to availability at time of booking.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
