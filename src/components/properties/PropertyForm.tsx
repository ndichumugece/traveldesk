import { useState } from 'react';
import { ArrowLeft, Plus, X, Loader2, Pencil, Users, DollarSign, BedDouble, Baby, UserPlus, TrendingUp } from 'lucide-react';
import { useProperties, type RoomType, type OccupancyType, type RateType, type SeasonalPricing, type Property } from '../../hooks/useProperties';

interface PropertyFormProps {
    onDiscard: () => void;
    existingProperty?: Property | null;
}

const OCCUPANCY_OPTIONS: { value: OccupancyType; label: string; capacity: number; description: string }[] = [
    { value: 'SGL', label: 'Single (SGL)', capacity: 1, description: '1 adult' },
    { value: 'DBL', label: 'Double (DBL)', capacity: 2, description: '2 adults, 1 bed' },
    { value: 'TWN', label: 'Twin (TWN)', capacity: 2, description: '2 adults, 2 beds' },
    { value: 'TPL', label: 'Triple (TPL)', capacity: 3, description: '3 adults' },
    { value: 'Quad', label: 'Quad / Family', capacity: 4, description: '4 adults' },
    { value: 'Per Room', label: 'Per Room', capacity: 4, description: 'Fixed room rate' },
    { value: 'Per Person', label: 'Per Person', capacity: 4, description: 'Charged per guest' },
];

type PriceKey = 'price_sgl' | 'price_dbl' | 'price_twn' | 'price_tpl' | 'price_quad';

const PRICE_FIELDS: { key: PriceKey; short: string; label: string }[] = [
    { key: 'price_sgl', short: 'SGL', label: 'Single' },
    { key: 'price_dbl', short: 'DBL', label: 'Double' },
    { key: 'price_twn', short: 'TWN', label: 'Twin' },
    { key: 'price_tpl', short: 'TPL', label: 'Triple' },
    { key: 'price_quad', short: 'QUD', label: 'Quad' },
];

const defaultRoomType = (): Omit<RoomType, 'id' | 'property_id'> => ({
    name: '',
    capacity: 2,
    price_modifier: 0,
    occupancy_type: 'DBL',
    rate_type: 'per_room',
    price_sgl: null,
    price_dbl: null,
    price_twn: null,
    price_tpl: null,
    price_quad: null,
    extra_adult_rate: 0,
    child_rate: 0,
    infants_free: true,
});

function fmt(val?: number | null) {
    if (val == null || val === 0) return null;
    return `KSH ${Number(val).toLocaleString()}`;
}

const inputBase = 'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-300';
const labelBase = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5';

export function PropertyForm({ onDiscard, existingProperty }: PropertyFormProps) {
    const [activeTab, setActiveTab] = useState('general');
    const { addProperty, updatePropertyFull } = useProperties();
    const [isSaving, setIsSaving] = useState(false);

    const [name, setName] = useState(existingProperty?.name || '');
    const [location, setLocation] = useState(existingProperty?.location || '');
    const [basePrice, setBasePrice] = useState(existingProperty?.base_price?.toString() || '');
    const [amenities, setAmenities] = useState(existingProperty?.amenities?.join(', ') || '');

    const [roomTypes, setRoomTypes] = useState<RoomType[]>(existingProperty?.room_types || []);

    const [showRoomForm, setShowRoomForm] = useState(false);
    const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);
    const [rtForm, setRtForm] = useState<RoomType>(defaultRoomType() as RoomType);

    const [showSeasonForm, setShowSeasonForm] = useState(false);
    const [editingSeasonIndex, setEditingSeasonIndex] = useState<number | null>(null);
    const [spName, setSpName] = useState('');
    const [spStart, setSpStart] = useState('');
    const [spEnd, setSpEnd] = useState('');
    const [spType, setSpType] = useState<'percentage' | 'fixed'>('percentage');
    const [spMarkup, setSpMarkup] = useState('0');
    const [spPrices, setSpPrices] = useState<Record<PriceKey, number | null>>({
        price_sgl: null, price_dbl: null, price_twn: null, price_tpl: null, price_quad: null
    });

    const setRt = <K extends keyof typeof rtForm>(key: K, val: typeof rtForm[K]) =>
        setRtForm(prev => ({ ...prev, [key]: val }));

    const handleOccupancyChange = (occ: OccupancyType) => {
        const opt = OCCUPANCY_OPTIONS.find(o => o.value === occ);
        setRtForm(prev => ({ ...prev, occupancy_type: occ, capacity: opt?.capacity ?? 2 }));
    };

    const openNewRoom = () => { setRtForm(defaultRoomType() as RoomType); setEditingRoomIndex(null); setShowRoomForm(true); };
    const editRoom = (i: number) => { setRtForm({ ...roomTypes[i] }); setEditingRoomIndex(i); setShowRoomForm(true); };

    const handleSave = async () => {
        if (!name || !location || !basePrice) {
            alert('Please fill in Name, Location, and Base Price.');
            return;
        }
        setIsSaving(true);
        const pd = {
            name, location, base_price: Number(basePrice), rooms: roomTypes.length,
            status: 'active' as const, amenities: amenities.split(',').map(a => a.trim()).filter(Boolean)
        };
        const res = existingProperty
            ? await updatePropertyFull(existingProperty.id, pd, roomTypes, [])
            : await addProperty(pd, roomTypes, []);
        setIsSaving(false);
        if (res.error) alert('Error: ' + res.error);
        else onDiscard();
    };

    const confirmRoom = () => {
        if (!rtForm.name) return;
        const rt: RoomType = { ...rtForm };
        if (editingRoomIndex !== null) {
            const u = [...roomTypes]; u[editingRoomIndex] = rt; setRoomTypes(u);
        } else setRoomTypes([...roomTypes, rt]);
        setShowRoomForm(false); setEditingRoomIndex(null);
    };

    const deleteRoom = (i: number) => {
        if (confirm('Delete this room type and its seasonal pricing?')) {
            setRoomTypes(roomTypes.filter((_, idx) => idx !== i));
        }
    };

    const confirmSeason = () => {
        if (!spName || !spStart || !spEnd) return;
        const s: SeasonalPricing = {
            name: spName,
            start_date: spStart,
            end_date: spEnd,
            pricing_type: spType,
            markup_percentage: Number(spMarkup),
            ...spPrices
        };
        const currentSeasons = rtForm.seasonal_pricing || [];

        let newSeasons: SeasonalPricing[];
        if (editingSeasonIndex !== null) {
            newSeasons = [...currentSeasons];
            newSeasons[editingSeasonIndex] = s;
            setEditingSeasonIndex(null);
        } else {
            newSeasons = [...currentSeasons, s];
        }

        setRtForm(prev => ({ ...prev, seasonal_pricing: newSeasons }));
        setSpName(''); setSpStart(''); setSpEnd(''); setSpMarkup('0'); setSpType('percentage');
        setSpPrices({ price_sgl: null, price_dbl: null, price_twn: null, price_tpl: null, price_quad: null });
        setShowSeasonForm(false);
    };

    const editSeason = (sp: SeasonalPricing, i: number) => {
        setSpName(sp.name); setSpStart(sp.start_date); setSpEnd(sp.end_date);
        setSpType(sp.pricing_type || 'percentage');
        setSpMarkup(sp.markup_percentage.toString());
        setSpPrices({
            price_sgl: sp.price_sgl ?? null,
            price_dbl: sp.price_dbl ?? null,
            price_twn: sp.price_twn ?? null,
            price_tpl: sp.price_tpl ?? null,
            price_quad: sp.price_quad ?? null,
        });
        setEditingSeasonIndex(i); setShowSeasonForm(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ── Page Header ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onDiscard} disabled={isSaving}
                        className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {existingProperty ? 'Edit Property' : 'Add New Property'}
                        </h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {existingProperty ? 'Update property details below.' : 'Fill in the property details to get started.'}
                        </p>
                    </div>
                </div>
                <button onClick={handleSave} disabled={isSaving}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-50">
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Property
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-slate-100 bg-slate-50/50">
                    {['General', 'Room Types'].map(tab => {
                        const key = tab.toLowerCase().replace(' ', '-');
                        const active = activeTab === key;
                        return (
                            <button key={tab} onClick={() => setActiveTab(key)}
                                className={`px-6 py-4 text-sm font-semibold transition-colors relative ${active ? 'text-brand-600 bg-white' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}`}>
                                {tab}
                                {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-t-full" />}
                            </button>
                        );
                    })}
                </div>

                <div className="p-8">

                    {/* ── GENERAL TAB ────────────────────────────────── */}
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className={labelBase}>Property Name *</label>
                                <input value={name} onChange={e => setName(e.target.value)} className={inputBase} placeholder="e.g. The Grand Resort" />
                            </div>
                            <div>
                                <label className={labelBase}>Location *</label>
                                <input value={location} onChange={e => setLocation(e.target.value)} className={inputBase} placeholder="e.g. Maldives, Zanzibar" />
                            </div>
                            <div>
                                <label className={labelBase}>Base Price (KSH / night) *</label>
                                <input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} className={inputBase} placeholder="0.00" />
                            </div>
                            <div>
                                <label className={labelBase}>Amenities (comma-separated)</label>
                                <input value={amenities} onChange={e => setAmenities(e.target.value)} className={inputBase} placeholder="WiFi, Pool, Spa, Gym" />
                            </div>
                        </div>
                    )}

                    {/* ── ROOM TYPES TAB ─────────────────────────────── */}
                    {activeTab === 'room-types' && (
                        <div className="space-y-4">
                            {/* Existing room type cards */}
                            {!showRoomForm && roomTypes.map((rt, i) => (
                                <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden">
                                    {/* Card header */}
                                    <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
                                                <BedDouble className="w-4 h-4 text-brand-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm">{rt.name}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs px-2 py-0.5 bg-brand-600 text-white rounded-full font-semibold">{rt.occupancy_type}</span>
                                                    <span className="text-xs text-slate-500">{rt.rate_type === 'per_person' ? 'Per Person' : 'Per Room'} · max {rt.capacity} pax</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => editRoom(i)} className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors">
                                                <Pencil className="w-3 h-3" /> Edit
                                            </button>
                                            <button onClick={() => deleteRoom(i)} className="text-xs font-semibold text-rose-500 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                    {/* Pricing grid */}
                                    <div className="p-5">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Occupancy Prices</p>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'nowrap' }}>
                                            {PRICE_FIELDS.map(pf => {
                                                const val = fmt(rt[pf.key] as number | null);
                                                return (
                                                    <div key={pf.key} style={{ flex: 1, minWidth: 0 }}
                                                        className={`rounded-xl border text-center py-3 px-2 ${val ? 'border-brand-100 bg-brand-50' : 'border-slate-100 bg-slate-50'}`}>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pf.short}</div>
                                                        <div className={`text-sm font-bold mt-1 ${val ? 'text-brand-700' : 'text-slate-300'}`}>{val ?? '—'}</div>
                                                        <div className="text-[10px] text-slate-400 mt-0.5">{pf.label}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {(rt.extra_adult_rate > 0 || rt.child_rate > 0 || rt.infants_free || (rt.seasonal_pricing && rt.seasonal_pricing.length > 0)) && (
                                            <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                                                {rt.extra_adult_rate > 0 && (
                                                    <span className="flex items-center gap-1.5 text-xs text-slate-600">
                                                        <UserPlus className="w-3 h-3 text-slate-400" /> +${rt.extra_adult_rate} extra adult
                                                    </span>
                                                )}
                                                {rt.child_rate > 0 && (
                                                    <span className="flex items-center gap-1.5 text-xs text-slate-600">
                                                        <Users className="w-3 h-3 text-slate-400" /> +${rt.child_rate} child
                                                    </span>
                                                )}
                                                {rt.infants_free && (
                                                    <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                                        <Baby className="w-3 h-3" /> Infants free
                                                    </span>
                                                )}
                                                {rt.seasonal_pricing && rt.seasonal_pricing.length > 0 && (
                                                    <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                                                        {rt.seasonal_pricing.length} Season{rt.seasonal_pricing.length > 1 ? 's' : ''} defined
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Add / Edit form */}
                            {showRoomForm ? (
                                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                    {/* Form header */}
                                    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-brand-50 to-slate-50 border-b border-brand-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                                                <BedDouble className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <h4 className="font-bold text-slate-900 text-sm">
                                                {editingRoomIndex !== null ? 'Edit Room Type' : 'New Room Type'}
                                            </h4>
                                        </div>
                                        <button onClick={() => { setShowRoomForm(false); setEditingRoomIndex(null); }}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {/* Row 1: Name, Occupancy, Rate Type */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className={labelBase}>Room Name *</label>
                                                <input value={rtForm.name} onChange={e => setRt('name', e.target.value)}
                                                    className={inputBase} placeholder="e.g. Deluxe Ocean View" />
                                            </div>
                                            <div>
                                                <label className={labelBase}>Occupancy Type</label>
                                                <select value={rtForm.occupancy_type}
                                                    onChange={e => handleOccupancyChange(e.target.value as OccupancyType)}
                                                    className={inputBase}>
                                                    {OCCUPANCY_OPTIONS.map(o => (
                                                        <option key={o.value} value={o.value}>{o.label} — {o.description}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelBase}>Rate Type</label>
                                                <select value={rtForm.rate_type}
                                                    onChange={e => setRt('rate_type', e.target.value as RateType)}
                                                    className={inputBase}>
                                                    <option value="per_room">Per Room (fixed price)</option>
                                                    <option value="per_person">Per Person (price × guests)</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Row 2: Occupancy prices — always horizontal */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <DollarSign className="w-4 h-4 text-slate-400" />
                                                <label className={labelBase} style={{ marginBottom: 0 }}>Occupancy Prices (KSH / night)</label>
                                            </div>
                                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                                {/* Headers */}
                                                <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                                    {PRICE_FIELDS.map(pf => (
                                                        <div key={pf.key} style={{ flex: 1, padding: '10px 12px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                                                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{pf.short}</div>
                                                            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{pf.label}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Inputs */}
                                                <div style={{ display: 'flex' }}>
                                                    {PRICE_FIELDS.map((pf, idx) => (
                                                        <div key={pf.key} style={{ flex: 1, borderRight: idx < PRICE_FIELDS.length - 1 ? '1px solid #e2e8f0' : 'none', padding: '10px 12px' }}>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                placeholder="—"
                                                                value={(rtForm[pf.key] as number | null) ?? ''}
                                                                onChange={e => setRt(pf.key, e.target.value === '' ? null : Number(e.target.value))}
                                                                style={{ width: '100%', textAlign: 'center', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}
                                                                className="placeholder:text-slate-300"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 4: Seasonal Pricing within Room */}
                                        <div className="pt-4 border-t border-slate-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4 text-amber-500" />
                                                    <label className={labelBase} style={{ marginBottom: 0 }}>Seasonal Pricing for this Room</label>
                                                </div>
                                                {!showSeasonForm && (
                                                    <button onClick={() => setShowSeasonForm(true)}
                                                        className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg transition-colors">
                                                        + Add Season
                                                    </button>
                                                )}
                                            </div>

                                            {showSeasonForm ? (
                                                <div className="p-5 border-2 border-amber-100 rounded-2xl bg-amber-50/30 space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h5 className="font-bold text-slate-900 text-xs uppercase tracking-widest">{editingSeasonIndex !== null ? 'Edit Season' : 'New Season'}</h5>
                                                        <button onClick={() => { setShowSeasonForm(false); setEditingSeasonIndex(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="sm:col-span-2">
                                                            <label className={labelBase}>Season Name</label>
                                                            <input value={spName} onChange={e => setSpName(e.target.value)} className={inputBase} placeholder="e.g. Peak Summer" />
                                                        </div>
                                                        <div>
                                                            <label className={labelBase}>Start Date</label>
                                                            <input type="date" value={spStart} onChange={e => setSpStart(e.target.value)} className={inputBase} />
                                                        </div>
                                                        <div>
                                                            <label className={labelBase}>End Date</label>
                                                            <input type="date" value={spEnd} onChange={e => setSpEnd(e.target.value)} className={inputBase} />
                                                        </div>

                                                        {/* Pricing Type Toggle */}
                                                        <div className="sm:col-span-2 bg-white rounded-xl border border-amber-100 p-1 flex">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSpType('percentage')}
                                                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${spType === 'percentage' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                                                            >
                                                                Percentage Markup
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSpType('fixed')}
                                                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${spType === 'fixed' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                                                            >
                                                                Fixed Room Prices
                                                            </button>
                                                        </div>

                                                        {spType === 'percentage' ? (
                                                            <div className="sm:col-span-2">
                                                                <label className={labelBase}>Price Markup (%)</label>
                                                                <input type="number" value={spMarkup} onChange={e => setSpMarkup(e.target.value)} className={inputBase} placeholder="e.g. 25" />
                                                            </div>
                                                        ) : (
                                                            <div className="sm:col-span-2">
                                                                <label className={labelBase}>Fixed Occupancy Prices (KSH)</label>
                                                                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                                                                    <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                                                        {PRICE_FIELDS.map(pf => (
                                                                            <div key={pf.key} style={{ flex: 1, padding: '8px 4px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                                                                                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{pf.short}</div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div style={{ display: 'flex' }}>
                                                                        {PRICE_FIELDS.map((pf, idx) => (
                                                                            <div key={pf.key} style={{ flex: 1, borderRight: idx < PRICE_FIELDS.length - 1 ? '1px solid #e2e8f0' : 'none', padding: '6px' }}>
                                                                                <input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    placeholder="—"
                                                                                    value={spPrices[pf.key] ?? ''}
                                                                                    onChange={e => setSpPrices(prev => ({ ...prev, [pf.key]: e.target.value === '' ? null : Number(e.target.value) }))}
                                                                                    style={{ width: '100%', textAlign: 'center', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}
                                                                                    className="placeholder:text-slate-300"
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-3 pt-2 border-t border-amber-100">
                                                        <button onClick={confirmSeason} className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
                                                            {editingSeasonIndex !== null ? 'Update Season' : 'Apply Season'}
                                                        </button>
                                                        <button onClick={() => { setShowSeasonForm(false); setEditingSeasonIndex(null); }} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white transition-colors">Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {(rtForm.seasonal_pricing || []).map((sp, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                                                            <div>
                                                                <h5 className="font-bold text-slate-900 text-sm">{sp.name}</h5>
                                                                <div className="flex items-center gap-3 mt-0.5">
                                                                    <p className="text-xs text-slate-500">
                                                                        {sp.start_date} → {sp.end_date}
                                                                    </p>
                                                                    {sp.pricing_type === 'percentage' || !sp.pricing_type ? (
                                                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-bold text-[10px] uppercase">
                                                                            +{sp.markup_percentage}% Markup
                                                                        </span>
                                                                    ) : (
                                                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold text-[10px] uppercase">
                                                                            Fixed Prices
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {sp.pricing_type === 'fixed' && (
                                                                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                                                                        {PRICE_FIELDS.map(pf => {
                                                                            const val = sp[pf.key] as number | null;
                                                                            if (!val) return null;
                                                                            return (
                                                                                <div key={pf.key} className="flex flex-col items-center bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 min-w-[50px]">
                                                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{pf.short}</span>
                                                                                    <span className="text-[10px] font-bold text-slate-700">{fmt(val)}</span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => editSeason(sp, idx)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button onClick={() => setRtForm(prev => ({ ...prev, seasonal_pricing: (prev.seasonal_pricing || []).filter((_, i) => i !== idx) }))}
                                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!rtForm.seasonal_pricing || rtForm.seasonal_pricing.length === 0) && (
                                                        <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                            No seasonal pricing defined for this room type.
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                                            <button onClick={confirmRoom}
                                                className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95">
                                                {editingRoomIndex !== null ? 'Update Room Type' : 'Add Room Type'}
                                            </button>
                                            <button onClick={() => { setShowRoomForm(false); setEditingRoomIndex(null); }}
                                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={openNewRoom}
                                    className="w-full py-5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50/50 transition-all flex items-center justify-center gap-2 font-semibold">
                                    <Plus className="w-4 h-4" /> Add Room Type
                                </button>
                            )}
                        </div>
                    )}

                    {/* Tab content ends */}
                </div>
            </div>
        </div>
    );
}
