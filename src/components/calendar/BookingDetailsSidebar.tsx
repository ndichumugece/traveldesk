import { X, MapPin, Calendar, Clock, Users, Building2, Utensils, Info, Loader2 } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Document } from '../../hooks/useDocuments';
import { BookingComments } from './BookingComments';
import { useBookingFinance } from '../../hooks/useFinance';
import { Banknote, TrendingUp } from 'lucide-react';

interface BookingDetailsSidebarProps {
    booking: Document | null;
    onClose: () => void;
}

export function BookingDetailsSidebar({ booking, onClose }: BookingDetailsSidebarProps) {
    const metadata = booking?.metadata || {};
    const checkIn = booking?.checkIn ? parseISO(booking.checkIn) : null;
    const checkOut = booking?.checkOut ? parseISO(booking.checkOut) : null;
    const nights = (checkIn && checkOut) ? Math.max(0, differenceInDays(checkOut, checkIn)) : 0;

    // Lock body scroll when sidebar is open
    useEffect(() => {
        if (booking) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [booking]);

    const shouldReduceMotion = useReducedMotion();

    return createPortal(
        <AnimatePresence>
            {booking && (
                <motion.div 
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={shouldReduceMotion ? { duration: 0.2 } : { type: 'spring', damping: 30, stiffness: 300 }}
                    className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-lg bg-white/95 backdrop-blur-xl shadow-2xl border-l border-slate-200/60 flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Booking Details</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Guest Summary */}
                        <div className="flex items-start gap-5">
                            <div className="w-16 h-16 rounded-full bg-brand-50 border-4 border-white shadow-sm flex items-center justify-center text-2xl font-bold text-brand-600">
                                {booking.client?.charAt(0).toUpperCase() || 'G'}
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className="text-2xl font-bold text-slate-900">{booking.client}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-500">From {metadata.nationality || 'Resident'}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className={cn(
                                        "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm",
                                        booking.status === 'confirmed' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                                    )}>
                                        {booking.status}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border border-slate-100 shadow-sm">
                                        Ref: {booking.reference}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stay Information */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-brand-600">
                                <MapPin size={18} />
                                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">Stay Information</h4>
                            </div>
                            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Property</span>
                                    <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Building2 size={16} className="text-slate-400" />
                                        {metadata.unitName || 'Not Specified'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Room Type</span>
                                        <div className="text-sm font-semibold text-slate-700">{metadata.roomType || 'Standard Room'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meal Plan</span>
                                        <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                            <Utensils size={14} className="text-slate-400" />
                                            {metadata.mealPlan || 'BB'}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200/60 grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check In</span>
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <Calendar size={14} className="text-slate-400" />
                                            <div className="text-sm font-bold">{checkIn ? format(checkIn, 'MMM d, yyyy') : 'N/A'}</div>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock size={12} />
                                            <span className="text-xs">{metadata.checkInTime || '2:00pm'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check Out</span>
                                        <div className="flex items-center gap-2 justify-end text-slate-700">
                                            <div className="text-sm font-bold">{checkOut ? format(checkOut, 'MMM d, yyyy') : 'N/A'}</div>
                                            <Calendar size={14} className="text-slate-400" />
                                        </div>
                                        <div className="flex items-center gap-2 justify-end text-slate-400">
                                            <span className="text-xs">{metadata.checkOutTime || '10:00am'}</span>
                                            <Clock size={12} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center -mt-3">
                                    <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-500 italic shadow-sm">
                                        {nights} Nights
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Finance Summary */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-brand-600">
                                <Banknote size={18} />
                                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">Finance Summary</h4>
                            </div>
                            <BookingFinanceSummary bookingId={booking.id} />
                        </div>

                        {/* Guests & Rooms */}
                        <div className="space-y-4 text-slate-900">
                            <div className="flex items-center gap-2 text-brand-600">
                                <Users size={18} />
                                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">Guests & Rooms</h4>
                            </div>
                            <div className="space-y-3">
                                {metadata.rooms?.map((room: any, idx: number) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                                        <div>
                                            <div className="text-sm font-bold">{room.roomType || 'Room'}</div>
                                            <div className="text-xs text-slate-500 font-medium">{room.bedType || 'Standard Bed'}</div>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-600">
                                            <div className="flex flex-col items-center">
                                                <div className="text-sm font-bold">{room.adults}</div>
                                                <div className="text-[10px] uppercase font-bold text-slate-400">Adults</div>
                                            </div>
                                            {room.children > 0 && (
                                                <div className="flex flex-col items-center border-l border-slate-100 pl-4">
                                                    <div className="text-sm font-bold">{room.children}</div>
                                                    <div className="text-[10px] uppercase font-bold text-slate-400">Children</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Other Info */}
                        {(metadata.dietaryRequests || metadata.specialRequests) && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-brand-600">
                                    <Info size={18} />
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">Additional Requests</h4>
                                </div>
                                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 space-y-3">
                                    {metadata.dietaryRequests && (
                                        <div>
                                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Dietary</span>
                                            <p className="text-sm text-amber-900 font-medium">{metadata.dietaryRequests}</p>
                                        </div>
                                    )}
                                    {metadata.specialRequests && (
                                        <div>
                                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Special</span>
                                            <p className="text-sm text-amber-900 font-medium">{metadata.specialRequests}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Activity & Comments */}
                        <BookingComments bookingId={booking.id} />
                    </div>

                    {/* Actions */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                        <motion.button 
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.open(`/booking-voucher?id=${booking.id}`, '_blank')}
                            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 transition-all"
                        >
                            Edit Full Booking
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

function BookingFinanceSummary({ bookingId }: { bookingId: string }) {
    const { totalPayments, totalExpenses, profit, loading } = useBookingFinance(bookingId);

    if (loading) return (
        <div className="flex justify-center py-4">
            <Loader2 size={24} className="animate-spin text-slate-200" />
        </div>
    );

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 flex items-center justify-between border-b border-slate-200/60 bg-white/50">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Profit</span>
                    <span className={cn(
                        "text-lg font-black",
                        profit >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                        KES {profit.toLocaleString()}
                    </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <TrendingUp size={20} />
                </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4 divide-x divide-slate-200">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Received</span>
                    <span className="text-sm font-bold text-slate-900">KES {totalPayments.toLocaleString()}</span>
                </div>
                <div className="flex flex-col pl-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expenses</span>
                    <span className="text-sm font-bold text-slate-900">KES {totalExpenses.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}

