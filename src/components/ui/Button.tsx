import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-offset-white';
  
  const variants = {
    primary: 'bg-[var(--btn-primary-bg,theme(colors.pink.500))] text-white hover:bg-[var(--btn-primary-hover,theme(colors.pink.600))] focus:ring-[var(--btn-primary-ring,theme(colors.pink.500))] shadow-sm',
    secondary: 'bg-[var(--btn-secondary-bg,theme(colors.blue.400))] text-white hover:bg-[var(--btn-secondary-hover,theme(colors.blue.500))] focus:ring-[var(--btn-secondary-ring,theme(colors.blue.400))] shadow-sm',
    outline: 'border-2 border-current text-[var(--btn-outline-text,theme(colors.pink.600))] hover:bg-[var(--btn-outline-hover,theme(colors.pink.50))] focus:ring-[var(--btn-outline-ring,theme(colors.pink.500))]',
    ghost: 'text-[var(--btn-ghost-text,theme(colors.gray.600))] hover:bg-[var(--btn-ghost-hover,theme(colors.gray.100))] focus:ring-[var(--btn-ghost-ring,theme(colors.gray.500))]'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />}
    </button>
  );
};

export default Button;