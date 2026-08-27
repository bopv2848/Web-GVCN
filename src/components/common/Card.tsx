import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'bordered';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white rounded-2xl border border-slate-200/80 shadow-sm',
    elevated: 'bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition-shadow',
    glass: 'bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm',
    bordered: 'bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200',
  };

  return (
    <div className={cn(variantStyles[variant], 'p-4 md:p-6', className)} {...props}>
      {children}
    </div>
  );
};
