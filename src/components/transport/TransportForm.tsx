import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTransports, type Transport } from '../../hooks/useTransports';

interface TransportFormProps {
    onDiscard: () => void;
    existingTransport?: Transport | null;
}

const inputBase = 'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-300';
const labelBase = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5';

const VEHICLE_TYPES = [
    { label: 'Salon car', value: 'salon', capacity: 3 },
    { label: 'Noah', value: 'noah', capacity: 5 },
    { label: 'Van (9 seater)', value: 'van_9', capacity: 9 },
    { label: 'Van (13 seater)', value: 'van_13', capacity: 13 },
    { label: 'Bus (Rosa)', value: 'bus_rosa', capacity: 22 },
];

export function TransportForm({ onDiscard, existingTransport }: TransportFormProps) {
    const { addTransport, updateTransport } = useTransports();
    const [isSaving, setIsSaving] = useState(false);

    const [name, setName] = useState(existingTransport?.name || '');
    const [vehicleType, setVehicleType] = useState(existingTransport?.vehicle_type || '');
    const [pricePerWay, setPricePerWay] = useState(existingTransport?.price_per_way?.toString() || '');
    const [capacity, setCapacity] = useState(existingTransport?.capacity?.toString() || '4');
    const [status, setStatus] = useState<'active' | 'inactive'>(existingTransport?.status || 'active');

    const handleVehicleTypeChange = (typeValue: string) => {
        setVehicleType(typeValue);
        const selected = VEHICLE_TYPES.find(v => v.value === typeValue);
        if (selected) {
            setCapacity(selected.capacity.toString());
        }
    };

    const handleSave = async () => {
        if (!name || !pricePerWay) {
            alert('Please fill in Service Name and Price.');
            return;
        }

        setIsSaving(true);
        // Find label for selection if matching predefined, otherwise use raw value
        const displayType = VEHICLE_TYPES.find(v => v.value === vehicleType)?.label || vehicleType;

        const transportData = {
            name,
            vehicle_type: displayType,
            price_per_way: Number(pricePerWay),
            capacity: Number(capacity),
            status
        };

        const res = existingTransport
            ? await updateTransport(existingTransport.id, transportData)
            : await addTransport(transportData);

        setIsSaving(false);
        if (res.error) {
            alert('Error: ' + res.error);
        } else {
            onDiscard();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onDiscard} disabled={isSaving}
                        className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {existingTransport ? 'Edit Transport' : 'Add New Transport'}
                        </h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {existingTransport ? 'Update transport details below.' : 'Fill in the transport details to get started.'}
                        </p>
                    </div>
                </div>
                <button onClick={handleSave} disabled={isSaving}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-50">
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Transport
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                            <label className={labelBase}>Service Name *</label>
                            <input value={name} onChange={e => setName(e.target.value)} className={inputBase} placeholder="e.g. Airport Transfer - Private" />
                        </div>
                        <div>
                            <label className={labelBase}>Vehicle Type</label>
                            <select
                                value={vehicleType}
                                onChange={e => handleVehicleTypeChange(e.target.value)}
                                className={inputBase}
                            >
                                <option value="">Select Type</option>
                                {VEHICLE_TYPES.map(v => (
                                    <option key={v.value} value={v.value}>{v.label}</option>
                                ))}
                                <option value="custom">Other / Custom</option>
                            </select>
                            {vehicleType === 'custom' && (
                                <input
                                    className={`${inputBase} mt-2`}
                                    placeholder="Enter custom type..."
                                    onBlur={e => setVehicleType(e.target.value)}
                                />
                            )}
                        </div>
                        <div>
                            <label className={labelBase}>Capacity (Pax)</label>
                            <input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} className={inputBase} placeholder="4" />
                        </div>
                        <div>
                            <label className={labelBase}>Price Per Way (KSH) *</label>
                            <input type="number" value={pricePerWay} onChange={e => setPricePerWay(e.target.value)} className={inputBase} placeholder="0.00" />
                        </div>
                        <div>
                            <label className={labelBase}>Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value as 'active' | 'inactive')} className={inputBase}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
