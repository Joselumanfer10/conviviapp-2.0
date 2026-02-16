import { motion } from 'framer-motion';
import { staggerItem, cardHover } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function AnimatedCard({ children, className, hoverable = true }: AnimatedCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={hoverable ? cardHover : undefined}
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
