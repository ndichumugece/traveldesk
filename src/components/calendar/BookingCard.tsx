import { Building2, Plane, Train, Car, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Document } from '../../hooks/useDocuments';

interface BookingCardProps {
    booking: Document;
    onClick: () => void;
    hasComments?: boolean;
}

export function BookingCard({ booking, onClick, hasComments }: BookingCardProps) {
    const metadata = booking.metadata || {};
    const transport = metadata.arrivalTransport || 'Self Drive';

    const getTransportIcon = () => {
        if (transport.toLowerCase().includes('fly')) return <Plane size={12} />;
        if (transport.toLowerCase().includes('train')) return <Train size={12} />;
        if (transport.toLowerCase().includes('road')) return <Car size={12} />;
        return <Car size={12} />;
    };

    // Determine colors based on transport or nationality for variety
    const isResident = metadata.nationality === 'Resident';
    
    return (
        <button
            onClick={onClick}
            className={cn(
                "group w-full text-left p-2 rounded-lg transition-all duration-200 border shadow-sm flex flex-col gap-1 active:scale-95",
                isResident 
                    ? "bg-rose-50 border-rose-100 hover:bg-rose-100/80 text-rose-900" 
                    : "bg-emerald-50 border-emerald-100 hover:bg-emerald-100/80 text-emerald-900"
            )}
        >
            <div className="flex items-center justify-between gap-1 overflow-hidden">
                <div className="font-bold text-[11px] truncate uppercase tracking-tight leading-none">
                    {booking.client}
                </div>
                {hasComments && (
                    <MessageSquare size={12} className="shrink-0 opacity-60" />
                )}
            </div>
            
            <div className="flex items-center gap-1 opacity-70">
                <Building2 size={10} className="shrink-0" />
                <span className="text-[10px] truncate font-medium">{metadata.unitName || 'Lodge'}</span>
            </div>

            <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/60 text-[9px] font-bold uppercase tracking-tight border border-white/50">
                    {getTransportIcon()}
                    <span className="truncate max-w-[40px]">{transport}</span>
                </div>
                {booking.status === 'confirmed' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
            </div>
        </button>
    );
}
