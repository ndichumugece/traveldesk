import { FileText, CalendarCheck, FileCheck, HelpCircle } from 'lucide-react';
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
}

export function RecentActivity({ activities }: RecentActivityProps) {

    // Helper function to map activity types to icons
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'document_created': return FileText;
            case 'booking_confirmed': return CalendarCheck;
            case 'invoice_sent': return FileCheck;
            default: return HelpCircle;
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 shrink-0">
                <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                <p className="text-sm text-slate-500">Latest operations and updates</p>
            </div>

            <div className="divide-y divide-slate-100 flex-1 overflow-auto">
                {activities.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                        No recent activity found.
                    </div>
                ) : (
                    activities.map((activity, index) => {
                        const IconComponent = getActivityIcon(activity.type);
                        return (
                            <div
                                key={activity.id}
                                className="p-4 hover:bg-slate-50 transition-colors duration-150 flex items-start gap-4"
                                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                            >
                                <div className={cn(
                                    "p-2 rounded-xl mt-1 shrink-0",
                                    activity.type === 'document_created' && "bg-blue-50 text-blue-600",
                                    activity.type === 'booking_confirmed' && "bg-emerald-50 text-emerald-600",
                                    activity.type === 'invoice_sent' && "bg-amber-50 text-amber-600"
                                )}>
                                    <IconComponent className="h-5 w-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">
                                        {activity.client}
                                    </p>
                                    <p className="text-sm text-slate-500 truncate">
                                        {activity.type === 'document_created' && 'Created new '}
                                        {activity.type === 'booking_confirmed' && 'Confirmed '}
                                        {activity.type === 'invoice_sent' && 'Sent '}
                                        <span className="font-medium text-slate-700">{activity.document}</span>
                                    </p>
                                </div>

                                <div className="text-xs text-slate-400 whitespace-nowrap shrink-0 mt-1">
                                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
                <button className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                    View All Activity
                </button>
            </div>
        </div>
    );
}
