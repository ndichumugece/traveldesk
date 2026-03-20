import { FileText, CalendarCheck, FileCheck, HelpCircle, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
    id: string;
    client: string;
    type: string;
    document: string;
    timestamp: Date;
}

interface RecentActivityProps {
    activities: Activity[];
    className?: string;
}

export function RecentActivity({ activities, className }: RecentActivityProps) {

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'document_created': return FileText;
            case 'booking_confirmed': return CalendarCheck;
            case 'invoice_sent': return FileCheck;
            default: return HelpCircle;
        }
    };

    return (
        <div className={cn("premium-card overflow-hidden flex flex-col", className)}>
            <div className="p-8 border-b border-slate-50 shrink-0 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">Live updates from your agency</p>
                </div>
                <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-brand-600 transition-all">
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>

            <div className="divide-y divide-slate-50 flex-1 overflow-auto custom-scrollbar">
                {activities.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <HelpCircle className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Quiet for now</p>
                    </div>
                ) : (
                    activities.map((activity, index) => {
                        const IconComponent = getActivityIcon(activity.type);
                        return (
                            <div
                                key={activity.id}
                                className="p-6 hover:bg-slate-50/50 transition-all duration-300 flex items-start gap-5 group"
                                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                                    activity.type === 'document_created' && "bg-blue-50 text-blue-600",
                                    activity.type === 'booking_confirmed' && "bg-emerald-50 text-emerald-600",
                                    activity.type === 'invoice_sent' && "bg-amber-50 text-amber-600"
                                )}>
                                    <IconComponent className="h-6 w-6" strokeWidth={2.5} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <p className="text-[15px] font-bold text-slate-900 truncate">
                                            {activity.client}
                                        </p>
                                        <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
                                            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 truncate leading-relaxed">
                                        {activity.type === 'document_created' && 'Created new '}
                                        {activity.type === 'booking_confirmed' && 'Confirmed '}
                                        {activity.type === 'invoice_sent' && 'Sent '}
                                        <span className="font-bold text-slate-700">{activity.document}</span>
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-6 bg-slate-50/50 text-center border-t border-slate-50">
                <button className="text-[13px] font-bold text-brand-600 hover:text-brand-700 transition-colors uppercase tracking-widest">
                    View Complete History
                </button>
            </div>
        </div>
    );
}
