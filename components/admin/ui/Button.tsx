import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon' | 'success' | 'destructive' | 'warning' | 'outline';
  size?: 'default' | 'sm';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'default', ...props }) => {
  const baseClasses = 'font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 rounded-lg';
  
  const sizeClasses = {
      default: 'px-4 py-2',
      sm: 'px-3 py-1 text-sm',
  }

  const variantClasses = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
    secondary: 'bg-stone-700 text-gray-200 hover:bg-stone-600 focus:ring-stone-500',
    icon: 'p-2 bg-stone-700 text-gray-200 hover:bg-stone-600 focus:ring-stone-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-500 text-stone-900 hover:bg-yellow-600 focus:ring-yellow-400',
    outline: 'bg-transparent border border-stone-600 text-gray-300 hover:bg-stone-700 focus:ring-stone-500',
  };

  return (
    <button className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};