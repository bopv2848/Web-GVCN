import React from 'react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  targetPhase?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  targetPhase,
  actionText,
  onAction,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-3xl bg-white border border-slate-200/80 shadow-sm', className)}>
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary text-3xl md:text-4xl mb-4 shadow-inner">
        {icon || '📋'}
      </div>
      <h3 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm md:text-base text-slate-500 max-w-md mb-4 leading-relaxed font-medium">
        {description}
      </p>
      {targetPhase && (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-6">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Kế hoạch triển khai: {targetPhase}
        </div>
      )}
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};
