import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';
import { pageTransition, pageTransitionConfig } from '../../lib/animations';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : "initial"}
      animate={shouldReduceMotion ? { opacity: 1 } : "animate"}
      exit={shouldReduceMotion ? { opacity: 0 } : "exit"}
      variants={pageTransition}
      transition={pageTransitionConfig}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
