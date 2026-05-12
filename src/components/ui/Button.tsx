import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'neu';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  title?: string;
  glow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  icon,
  iconPosition = 'left',
  title,
  glow = false,
}) => {
  const baseClasses = 'relative inline-flex cursor-pointer items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden';

  const variantClasses = {
    primary: 'btn-v2-primary text-white',
    secondary: 'bg-secondary-100 hover:bg-secondary-200 text-secondary-800 focus:ring-secondary-300 shadow-sm hover:shadow-md',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-primary-300 hover:shadow-glow',
    ghost: 'text-secondary-600 hover:text-secondary-800 hover:bg-secondary-100/80 focus:ring-secondary-300',
    glass: 'btn-v2-glass text-white',
    neu: 'neu-btn text-slate-700 dark:text-slate-200',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-[0.9375rem] gap-2',
    lg: 'px-8 py-4 text-base gap-2.5',
  };

  const glowClass = glow ? (variant === 'primary' ? 'glow-green' : 'glow-ai') : '';
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${glowClass} ${className}`;

  const buttonContent = (
    <>
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </>
  );

  return (
    <motion.button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      whileHover={!disabled && !loading ? { y: -2, scale: variant === 'neu' ? 1 : 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {buttonContent}
    </motion.button>
  );
};

export default Button;
