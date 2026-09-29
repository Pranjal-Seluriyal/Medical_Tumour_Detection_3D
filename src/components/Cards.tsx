import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`glass-panel rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
};

export const DisclaimerCard: React.FC = () => {
  return (
    <div className="bg-error-container/50 dark:bg-error-container/20 border border-error/20 dark:border-error-container/30 rounded-lg p-5 flex gap-3 shadow-sm select-none">
      <span className="material-symbols-outlined text-error dark:text-error-container mt-0.5">warning</span>
      <div>
        <h4 className="font-label-sm text-label-sm text-on-error-container dark:text-error-container mb-1 uppercase tracking-wider font-bold">
          Important Medical Disclaimer
        </h4>
        <p className="text-xs text-on-surface-variant dark:text-outline leading-relaxed">
          This tool provides AI-assisted preliminary analysis only. It is <strong>not a medical diagnosis</strong>. Results must be reviewed and verified by a qualified medical professional.
        </p>
      </div>
    </div>
  );
};

export const FeatureCard: React.FC<{ title: string; description: string; icon: string; iconBg?: string; iconColor?: string }> = ({
  title,
  description,
  icon,
  iconBg = 'bg-primary-container/20',
  iconColor = 'text-primary'
}) => {
  return (
    <div className="glass-panel p-6 rounded-xl hover-lift flex flex-col gap-4">
      <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center ${iconColor} shrink-0`}>
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
      <div>
        <h3 className="font-title-md text-title-md text-on-surface dark:text-slate-100 mb-1">{title}</h3>
        <p className="text-sm text-on-surface-variant dark:text-slate-300 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};
