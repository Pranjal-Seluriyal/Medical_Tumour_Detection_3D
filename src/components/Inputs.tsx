import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const MinimalInput: React.FC<InputProps> = ({ label, id, className = '', ...props }) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <label
        htmlFor={inputId}
        className="font-label-sm text-label-sm text-tertiary dark:text-surface-container-highest select-none"
      >
        {label}
      </label>
      <input
        id={inputId}
        className="form-input-minimal w-full font-body-md text-body-md text-on-surface dark:text-white border-b border-outline focus:border-primary py-2 outline-none bg-transparent transition-colors"
        {...props}
      />
    </div>
  );
};

export const SearchInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="material-symbols-outlined absolute left-3 text-on-surface-variant dark:text-outline text-[18px]">
        search
      </span>
      <input
        type="text"
        className="glass-panel text-on-surface dark:text-white pl-9 pr-4 py-2 rounded-full font-body-md text-body-md border-none outline-none w-64 focus:w-80 transition-all bg-transparent"
        {...props}
      />
    </div>
  );
};
