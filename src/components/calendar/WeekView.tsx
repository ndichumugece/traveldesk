import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { cn } from '../../lib/utils';
import type { Document } from '../../hooks/useDocuments';
import { BookingCard } from './BookingCard';

interface WeekViewProps {
    currentDate: Date;
    bookings: Document[];
    onBookingClick: (booking: Document) => void;
    commentedBookingIds?: Set<string>;
}

export function WeekView({ currentDate, bookings, onBookingClick, commentedBookingIds = new Set() }: WeekViewProps) {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    const dayInterval = eachDayOfInterval({ start, end });

    const getBookingsByDate = (date: Date) => {
        return bookings.filter(doc => doc.checkIn && isSameDay(parseISO(doc.checkIn), date));
    };

    return (
        <div className="grid grid-cols-7 auto-rows-fr">
            {dayInterval.map((date, idx) => {
                const dayBookings = getBookingsByDate(date);
                const isToday = isSameDay(date, new Date());

                return (
                    <div
                        key={idx}
                        className={cn(
                            "min-h-[300px] p-4 border-r border-slate-100 last:border-0 transition-colors flex flex-col gap-4",
                            isToday ? "bg-brand-50/10" : "bg-white"
                        )}
                    >
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {format(date, 'EEE')}
                            </span>
                            <span className={cn(
                                "text-lg font-bold w-10 h-10 flex items-center justify-center rounded-full transition-all",
                                isToday ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30" : "text-slate-900"
                            )}>
                                {format(date, 'd')}
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 pr-1">
                            {dayBookings.length > 0 ? (
                                dayBookings.map(booking => (
                                    <BookingCard
                                        key={booking.id}
                                        booking={booking}
                                        onClick={() => onBookingClick(booking)}
                                        hasComments={commentedBookingIds.has(booking.id)}
                                    />
                                ))
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl opacity-40">
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">No Arrivals</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
