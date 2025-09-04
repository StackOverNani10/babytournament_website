import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
  customColor?: {
    background: string;
    text: string;
  };
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  customColor 
}) => {
  const variants = {
    primary: 'bg-pink-100 text-pink-800',
    secondary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };

  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  const variantClasses = customColor ? '' : variants[variant];
  const sizeClasses = sizes[size];
  
  return (
    <span 
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      style={customColor ? {
        backgroundColor: customColor.background,
        color: customColor.text
      } : undefined}
    >
      {children}
    </span>
  );
};

export default Badge;