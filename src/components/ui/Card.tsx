import React from 'react';
import { motion } from 'framer-motion';

type CardVariant = 'default' | 'glass' | 'glass-ai' | 'glass-green' | 'glass-gold' | 'glass-light' | 'neu' | 'bento';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: CardVariant;
  shimmer?: boolean;
  delay?: number;
}

const variantBase: Record<CardVariant, string> = {
  default:     'bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-white/20',
  glass:       'glass',
  'glass-ai':  'glass-ai',
  'glass-green':'glass-green',
  'glass-gold':'glass-gold',
  'glass-light':'glass-light',
  neu:         'neu',
  bento:       'glass-light rounded-[1.5rem]',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'md',
  variant = 'default',
  shimmer = false,
  delay = 0,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClasses = hover
    ? variant === 'neu'
      ? 'cursor-pointer hover:shadow-[8px_8px_18px_#bec3cc,-8px_-8px_18px_#ffffff]'
      : 'cursor-pointer hover:shadow-card-hover'
    : '';

  const cardClasses = [
    variantBase[variant],
    'transition-all duration-300',
    hoverClasses,
    onClick ? 'cursor-pointer' : '',
    shimmer ? 'glass-shimmer' : '',
    paddingClasses[padding],
    className,
  ].filter(Boolean).join(' ');

  const motionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.4,
      delay,
      type: 'spring' as const,
      stiffness: 100,
      damping: 20,
    },
    ...(onClick && hover ? {
      whileHover: { y: -4, scale: 1.02 },
      whileTap: { scale: 0.98, y: 0 },
    } : {}),
  };

  return (
    <motion.div className={cardClasses} onClick={onClick} {...motionProps}>
      {children}
    </motion.div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <h3 className={`text-xl font-bold text-gray-900 mb-2 ${className}`}>
    {children}
  </h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <p className={`text-gray-600 ${className}`}>
    {children}
  </p>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`flex-1 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`mt-6 pt-4 border-t border-white/20 ${className}`}>
    {children}
  </div>
);

export default Card;
