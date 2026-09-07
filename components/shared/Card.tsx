
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[var(--bg-card)] rounded-xl border border-[var(--border-primary)] shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-4 text-[var(--text-primary)] transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
};
