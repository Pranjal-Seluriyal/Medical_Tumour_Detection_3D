import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
}

export const AnomalyBadge: React.FC<BadgeProps> = ({ children }) => {
  return (
    <span className="bg-error/10 border border-error/25 text-error px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
      {children}
    </span>
  );
};

export const NormalBadge: React.FC<BadgeProps> = ({ children }) => {
  return (
    <span className="bg-[#10b981]/10 border border-[#10b981]/25 text-[#059669] px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
      {children}
    </span>
  );
};

export const GenericBadge: React.FC<BadgeProps> = ({ children }) => {
  return (
    <span className="bg-slate-500/10 border border-slate-500/20 text-slate-600 px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
      {children}
    </span>
  );
};
