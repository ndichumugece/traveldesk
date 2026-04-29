import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { backdropVariants } from '../lib/animations';
import { 
    ChevronLeft, 
    ChevronRight, 
    Plus, 
    Calendar as CalendarIcon, 
    List, 
    Layers,
    Search,
    Filter,
    Loader2
} from 'lucide-react';
import { 
    format, 
    addMonths, 
    subMonths, 
    isSameDay, 
    parseISO, 
    startOfMonth, 
    endOfMonth 
} from 'date-fns';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';
import { generateCalendarDays, getMonthYearLabel } from '../lib/calendarUtils';
import { useDocuments } from '../hooks/useDocuments';
import type { Document } from '../hooks/useDocuments';
import { BookingCard } from '../components/calendar/BookingCard';
import { BookingDetailsSidebar } from '../components/calendar/BookingDetailsSidebar';
import { WeekView } from '../components/calendar/WeekView';
import { ListView } from '../components/calendar/ListView';
import { useNavigate } from 'react-router-dom';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function Calendar() {
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
    const [selectedBooking, setSelectedBooking] = useState<Document | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, isLoading, isFetching } = useDocuments('Booking');
    const documents = data?.pages.flatMap(page => page.data) || [];
    const [commentedBookingIds, setCommentedBookingIds] = useState<Set<string>>(new Set());

    // Auto-switch to list view on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640 && viewMode !== 'list') {
                setViewMode('list');
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [viewMode]);

    const fetchCommentStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('booking_comments')
                .select('booking_id');
            
            if (error) throw error;
            if (data) {
                const ids = new Set(data.map(item => item.booking_id));
                setCommentedBookingIds(ids);
            }
        } catch (err) {
            console.error('Error fetching comment status:', err);
        }
    };

    useEffect(() => {
        fetchCommentStatus();
    }, [documents]);

    const calendarDays = useMemo(() => generateCalendarDays(currentMonth), [currentMonth]);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => setCurrentMonth(new Date());

    const filteredBookings = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = doc.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                doc.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                doc.metadata?.unitName?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [documents, searchQuery]);

    const getBookingsByDate = (date: Date) => {
        return filteredBookings.filter(doc => doc.checkIn && isSameDay(parseISO(doc.checkIn), date));
    };

    return (
        <div className="flex flex-col bg-slate-50/50 -m-6 p-6 min-h-screen">
            {/* Header Area */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Calendar</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">Manage bookings and track guest arrivals.</p>
                    </div>
                    {isFetching && (
                        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 px-3 py-1 rounded-full shadow-sm flex items-center gap-2 h-fit">
                            <Loader2 className="w-3 h-3 animate-spin text-brand-600" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Updating...</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* View Switcher */}
                        <div className="bg-white border border-slate-200 p-1 rounded-xl shadow-sm flex items-center gap-1 w-full sm:w-auto">
                            <button
                                onClick={() => setViewMode('month')}
                                className={cn(
                                    "flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all",
                                    viewMode === 'month' ? "bg-brand-50 text-brand-600" : "text-slate-500 hover:text-slate-700"
                                )}>
                                <CalendarIcon size={16} /> <span className="hidden xs:inline">Month</span>
                            </button>
                            <button
                                onClick={() => setViewMode('week')}
                                className={cn(
                                    "flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all",
                                    viewMode === 'week' ? "bg-brand-50 text-brand-600" : "text-slate-500 hover:text-slate-700"
                                )}>
                                <Layers size={16} /> <span className="hidden xs:inline">Week</span>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all",
                                    viewMode === 'list' ? "bg-brand-50 text-brand-600" : "text-slate-500 hover:text-slate-700"
                                )}>
                                <List size={16} /> <span className="hidden xs:inline">List</span>
                            </button>
                        </div>

                        {/* Month Navigator */}
                        <div className="bg-white border border-slate-200 p-1 rounded-xl shadow-sm flex items-center justify-between gap-3 w-full sm:w-auto">
                            <button onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-sm font-bold text-slate-900 min-w-[120px] text-center">
                                {getMonthYearLabel(currentMonth)}
                            </span>
                            <button onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/booking-voucher')}
                        className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-500/20 transition-all active:scale-95 w-full sm:w-auto"
                    >
                        <Plus size={20} />
                        Add Booking
                    </button>
                </div>
            </div>

            {/* Main Calendar Area */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col relative group/calendar">
                {/* Calendar Title Bar */}
                <div className="p-6 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        {getMonthYearLabel(currentMonth)}
                    </h2>
                </div>

                {/* Calendar Grid / Content */}
                <div className="flex flex-col relative">
                    {isLoading && !documents.length && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                            <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
                        </div>
                    )}

                    {viewMode === 'month' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Monthly Grid Header */}
                            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 shrink-0">
                                {DAYS.map(day => (
                                    <div key={day} className="py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100/50 last:border-0">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Grid Container */}
                            <div className="">
                                <div className="grid grid-cols-7 auto-rows-fr relative">
                                    {calendarDays.map((day, idx) => {
                                        const dayBookings = getBookingsByDate(day.date);
                                        return (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "min-h-[140px] p-2 border-r border-b border-slate-100/80 transition-colors relative flex flex-col gap-1.5",
                                                    !day.isCurrentMonth && "bg-slate-50/40 opacity-40 grayscale-[0.5]",
                                                    day.isToday && "bg-brand-50/10"
                                                )}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className={cn(
                                                        "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                                                        day.isToday ? "bg-brand-500 text-white shadow-md shadow-brand-500/30" : "text-slate-400 group-hover/calendar:text-slate-600"
                                                    )}>
                                                        {format(day.date, 'd')}
                                                    </span>
                                                    {dayBookings.length > 0 && (
                                                        <span className="text-[10px] font-bold text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                                            {dayBookings.length}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    {dayBookings.map(booking => (
                                                        <BookingCard
                                                            key={booking.id}
                                                            booking={booking}
                                                            onClick={() => setSelectedBooking(booking)}
                                                            hasComments={commentedBookingIds.has(booking.id)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {viewMode === 'week' && (
                        <div className="">
                            <WeekView
                                currentDate={currentMonth}
                                bookings={filteredBookings}
                                onBookingClick={setSelectedBooking}
                                commentedBookingIds={commentedBookingIds}
                            />
                        </div>
                    )}

                    {viewMode === 'list' && (
                        <ListView
                            bookings={filteredBookings}
                            onBookingClick={setSelectedBooking}
                            commentedBookingIds={commentedBookingIds}
                        />
                    )}
                </div>
            </div>

            {/* Sidebar Overlay */}
            {createPortal(
              <AnimatePresence>
                {selectedBooking && (
                  <motion.div 
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={backdropVariants}
                    className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-sm"
                    onClick={() => setSelectedBooking(null)}
                  />
                )}
              </AnimatePresence>,
              document.body
            )}
            
            <BookingDetailsSidebar 
              booking={selectedBooking} 
              onClose={() => setSelectedBooking(null)} 
            />
        </div>
    );
}
