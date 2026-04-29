import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion, useReducedMotion } from 'framer-motion';
import { cardVariants } from '../../lib/animations';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    variant?: 'orange' | 'emerald' | 'indigo' | 'blue' | 'slate';
    className?: string;
    href?: string;
}

const variants = {
    orange: "bg-[#FFF4E8] text-[#D87D31]",
    emerald: "bg-[#E8F8F0] text-[#1D9C83]",
    indigo: "bg-[#F0F0FF] text-[#6366F1]",
    blue: "bg-[#E8F5FF] text-[#3B82F6]",
    slate: "bg-slate-50 text-slate-600"
};

const iconBackgrounds = {
    orange: "bg-white/80",
    emerald: "bg-white/80",
    indigo: "bg-white/80",
    blue: "bg-white/80",
    slate: "bg-white"
};

export function MetricCard({ title, value, icon: Icon, trend, variant = 'slate', className, href }: MetricCardProps) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : "initial"}
            whileInView="animate"
            viewport={{ once: true }}
            whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
            variants={cardVariants}
            className={cn(
                "rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 transition-all duration-300 relative group overflow-hidden cursor-default",
                variants[variant],
                className
            )}>
            {/* Top Bar: Title & Arrow */}
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                <span className="text-sm font-bold tracking-tight opacity-80 uppercase">{title}</span>
            </div>

            {/* Middle: Value */}
            <div className="mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight block text-slate-900">{value}</span>
            </div>

            {/* Bottom: Trend */}
            {trend && (
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "text-xs font-bold px-0",
                        trend.isPositive ? "text-emerald-600" : "text-rose-600"
                    )}>
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                    <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider">vs last period</span>
                </div>
            )}
        </motion.div>
    );
}
