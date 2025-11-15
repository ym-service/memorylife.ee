
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'default';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'default', children, className = '', ...props }) => {
  const baseClasses = "appearance-none border cursor-pointer px-3.5 py-2.5 rounded-xl shadow-main transition-transform duration-200 ease-in-out inline-flex gap-2 items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0 hover:-translate-y-px";

  const variantClasses = {
    default: 'bg-gradient-to-b from-[#2a2019] to-[#1b1410] text-brand-text border-brand-accent/25 hover:border-brand-accent/45',
    primary: 'bg-gradient-to-b from-[#3a2c22] to-[#201712] border-brand-accent/50 hover:border-brand-accent/70 text-brand-text',
    ghost: 'bg-transparent border-brand-accent/25 hover:border-brand-accent/45 text-brand-text',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
