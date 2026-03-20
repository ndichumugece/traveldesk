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
    iconColor?: string;
    className?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, iconColor = "brand", className }: MetricCardProps) {
    const colorMap: Record<string, string> = {
        brand: "bg-brand-50 text-brand-600 from-brand-50 to-brand-100/50",
        emerald: "bg-emerald-50 text-emerald-600 from-emerald-50 to-emerald-100/50",
        amber: "bg-amber-50 text-amber-600 from-amber-50 to-amber-100/50",
        rose: "bg-rose-50 text-rose-600 from-rose-50 to-rose-100/50",
        blue: "bg-blue-50 text-blue-600 from-blue-50 to-blue-100/50"
    };

    return (
        <div className={cn("premium-card p-7 group", className)}>
            <div className="flex items-start justify-between mb-6">
                <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                    colorMap[iconColor] || colorMap.brand
                )}>
                    <Icon className="w-7 h-7" strokeWidth={2.5} />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ring-inset",
                        trend.isPositive 
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-100/50" 
                            : "bg-rose-50 text-rose-700 ring-rose-100/50"
                    )}>
                        {trend.isPositive ? '↑' : '↓'} {trend.value}%
                    </div>
                )}
            </div>

            <div>
                <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 group-hover:text-slate-500 transition-colors">
                    {title}
                </p>
                <h4 className="text-3xl font-black text-slate-900 tracking-tight">
                    {value}
                </h4>
            </div>
            
            {/* Subtle light effect on card */}
            <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br from-transparent to-slate-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
    );
}
