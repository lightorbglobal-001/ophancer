import React from 'react';

export default function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const baseClasses = 'inline-flex items-center font-medium tracking-tight rounded-full border whitespace-nowrap flex-shrink-0 select-none';
  
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
  };

  const variantClasses = {
    default: 'bg-[#F4F5FD] text-[#525866] border-[#E0E3FA]',
    violet: 'bg-[#EEF0FD] text-[#6962F1] border-[#D6D8FB] font-semibold',
    cyan: 'bg-sky-50 text-sky-700 border-sky-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
    mint: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    ghost: 'bg-white text-[#525866] border-[#EBEFF5]',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
}
