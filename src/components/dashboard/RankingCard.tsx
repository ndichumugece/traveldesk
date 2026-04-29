import { Wallet, Users, Award, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion, useReducedMotion } from 'framer-motion';
import { cardVariants, containerVariants, listItemVariants } from '../../lib/animations';

interface RankingItem {
    name: string;
    amount: number;
    count: number;
}

interface RankingCardProps {
    title: string;
    items: RankingItem[];
    type: 'properties' | 'clients' | 'lead-sources';
    href?: string;
}

export function RankingCard({ title, items, type, href }: RankingCardProps) {
    const Icon = type === 'properties' ? Award : type === 'clients' ? Users : TrendingUp;
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div 
            initial={shouldReduceMotion ? { opacity: 0 } : "initial"}
            whileInView="animate"
            viewport={{ once: true }}
            variants={cardVariants}
            className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-100 flex flex-col h-full"
        >
            <div className="flex items-center justify-between mb-6 sm:mb-10">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                {i}
                            </div>
                        ))}
                    </div>
                    {href && (
                        <Link 
                            to={href}
                            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-white hover:shadow-md transition-all active:scale-95"
                        >
                            <ArrowUpRight className="w-5 h-5" />
                        </Link>
                    )}
                </div>
            </div>

            <motion.div 
                variants={containerVariants}
                className="space-y-6 flex-1"
            >
                {items.length > 0 ? (
                    items.map((item, index) => (
                        <motion.div 
                            key={item.name} 
                            variants={listItemVariants}
                            whileHover={shouldReduceMotion ? {} : { x: 4 }}
                            className="flex items-center gap-4 group cursor-default"
                        >
                            {/* Icon Container - Pastel Backgrounds based on index */}
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105",
                                index === 0 ? "bg-[#E8F8F0] text-[#1D9C83]" : 
                                index === 1 ? "bg-[#FFF4E8] text-[#D87D31]" : 
                                "bg-[#F0F0FF] text-[#6366F1]"
                            )}>
                                <Icon className="w-6 h-6" />
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="text-sm font-bold text-slate-900 line-clamp-1">{item.name}</div>
                                <div className="text-xs font-semibold text-slate-400 mt-0.5">{item.count} bookings</div>
                            </div>

                            {/* Amount */}
                            <div className="text-right">
                                <div className="text-sm font-black text-slate-900">KSH {item.amount.toLocaleString()}</div>
                                <div className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest mt-0.5",
                                    index === 0 ? "text-emerald-500" : "text-slate-300"
                                )}>
                                    {index === 0 ? "Top Performer" : "Active"}
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                            <Icon className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-400 font-bold italic tracking-tight">No rankings available yet</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
