import { 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    format, 
    isSameMonth, 
    isSameDay, 
    addMonths, 
    subMonths 
} from 'date-fns';

export interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
}

export function generateCalendarDays(month: Date): CalendarDay[] {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    const days = eachDayOfInterval({ start, end });
    const today = new Date();

    return days.map(date => ({
        date,
        isCurrentMonth: isSameMonth(date, month),
        isToday: isSameDay(date, today)
    }));
}

export function getMonthYearLabel(date: Date): string {
    return format(date, 'MMMM yyyy');
}
