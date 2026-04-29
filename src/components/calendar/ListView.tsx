import { format, parseISO } from 'date-fns';
import { cn } from '../../lib/utils';
import type { Document } from '../../hooks/useDocuments';
import { MapPin, Users, Building2, ChevronRight, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';

interface ListViewProps {
    bookings: Document[];
    onBookingClick: (booking: Document) => void;
    commentedBookingIds?: Set<string>;
}

export function ListView({ bookings, onBookingClick, commentedBookingIds = new Set() }: ListViewProps) {
    // Sort bookings by check-in date
    const sortedBookings = [...bookings].sort((a, b) => {
        if (!a.checkIn) return 1;
        if (!b.checkIn) return -1;
        return parseISO(a.checkIn).getTime() - parseISO(b.checkIn).getTime();
    });

    if (sortedBookings.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                    <CalendarIcon className="text-slate-300" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No bookings found</h3>
                <p className="text-slate-500 max-w-xs mt-1">Try adjusting your search or add a new booking voucher.</p>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="divide-y divide-slate-100">
                {sortedBookings.map((booking) => {
                    const metadata = booking.metadata || {};
                    const checkIn = booking.checkIn ? parseISO(booking.checkIn) : null;
                    const status = booking.status || 'pending';

                    return (
                        <button
                            key={booking.id}
                            onClick={() => onBookingClick(booking)}
                            className="w-full flex items-center gap-6 p-6 hover:bg-slate-50/80 transition-all text-left group"
                        >
                            {/* Date Badge */}
                            <div className="flex flex-col items-center justify-center min-w-[72px] h-[72px] rounded-2xl border border-slate-200 bg-white group-hover:border-brand-200 group-hover:shadow-md transition-all">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{checkIn ? format(checkIn, 'MMM') : '---'}</span>
                                <span className="text-2xl font-black text-slate-900">{checkIn ? format(checkIn, 'dd') : '--'}</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate">{booking.client}</h4>
                                    {commentedBookingIds.has(booking.id) && (
                                        <MessageSquare size={16} className="text-slate-400 shrink-0" />
                                    )}
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                        status === 'confirmed' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                    )}>
                                        {status}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                        <Building2 size={16} className="text-slate-400" />
                                        <span>{metadata.unitName || 'Coastal Lodge'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                        <Users size={16} className="text-slate-400" />
                                        <span>{metadata.roomType || 'Standard'} • {metadata.numGuests || '2'} Guests</span>
                                    </div>
                                    {metadata.nationality && (
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                            <MapPin size={16} className="text-slate-400" />
                                            <span>{metadata.nationality}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Side */}
                            <div className="flex flex-col items-end gap-2 text-right">
                                <div className="text-sm font-bold text-slate-900">
                                    {booking.currency} {booking.amount?.toLocaleString()}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                    {booking.reference}
                                </div>
                                <div className="p-1 px-2 rounded-lg bg-slate-100 text-slate-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
