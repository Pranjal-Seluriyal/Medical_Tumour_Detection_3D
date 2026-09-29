import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: string;
}

export const GradientButton: React.FC<ButtonProps> = ({ children, icon, className = '', ...props }) => {
  return (
    <button
      className={`gradient-bg text-white font-label-sm text-label-sm px-6 py-3 rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 border-none cursor-pointer font-bold ${className}`}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      {children}
    </button>
  );
};

export const GlassButton: React.FC<ButtonProps> = ({ children, icon, className = '', ...props }) => {
  return (
    <button
      className={`glass-panel text-primary dark:text-inverse-primary font-label-sm text-label-sm px-6 py-3 rounded-lg hover:bg-surface-container-low dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 border-none cursor-pointer font-bold ${className}`}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      {children}
    </button>
  );
};
