import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedList({ children, className }: AnimatedListProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn('space-y-3', className)}
    >
      <AnimatePresence mode="popLayout">
        {children}
      </AnimatePresence>
    </motion.div>
  );
}

interface AnimatedListItemProps {
  children: React.ReactNode;
  layoutId?: string;
  className?: string;
}

export function AnimatedListItem({ children, layoutId, className }: AnimatedListItemProps) {
  return (
    <motion.div
      variants={staggerItem}
      layout
      layoutId={layoutId}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
