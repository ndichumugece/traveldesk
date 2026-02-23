import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, className }: MetricCardProps) {
    return (
        <div className={cn("bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-150", className)}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-500">{title}</h3>
                <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{value}</span>
                {trend && (
                    <span className={cn(
                        "text-xs font-semibold px-2 py-1 rounded-full",
                        trend.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    )}>
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>
        </div>
    );
}
