import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md', 
  shadow = 'md' 
}) => {
  const paddings = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadows = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  return (
    <div className={`bg-white rounded-lg ${shadows[shadow]} ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;