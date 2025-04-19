'use client';

import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

interface LinkButtonProps extends ButtonProps {
  href: string;
}

const getVariantClasses = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 relative overflow-hidden';
    case 'secondary':
      return 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500 relative overflow-hidden';
    case 'outline':
      return 'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500';
    case 'text':
      return 'bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500';
    default:
      return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 relative overflow-hidden';
  }
};

const getSizeClasses = (size: ButtonSize) => {
  switch (size) {
    case 'sm':
      return 'text-sm py-2 px-4';
    case 'md':
      return 'text-base py-2.5 px-5';
    case 'lg':
      return 'text-lg py-3 px-6';
    default:
      return 'text-base py-2.5 px-5';
  }
};

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  fullWidth = false,
  disabled = false,
  ...props
}: ButtonProps) => {
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <motion.button
      className={`
        font-medium rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
        inline-flex items-center justify-center
        ${variantClasses} ${sizeClasses} ${widthClass} ${className}
        ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : 'transform hover:-translate-y-1'}
      `}
      whileHover={disabled || isLoading ? {} : { scale: 1.02 }}
      whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {icon && !isLoading && <span className="mr-2">{icon}</span>}
      
      <span className="relative z-10">{children}</span>
      
      {variant === 'primary' && !disabled && !isLoading && (
        <span className="absolute inset-0 bg-blue-800 transform translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0"></span>
      )}
      
      {variant === 'secondary' && !disabled && !isLoading && (
        <span className="absolute inset-0 bg-gray-900 transform translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0"></span>
      )}
    </motion.button>
  );
};

export const LinkButton = ({
  children,
  href,
  className = '',
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  ...props
}: LinkButtonProps) => {
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <Link href={href} legacyBehavior>
      <motion.a
        className={`
          font-medium rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
          inline-flex items-center justify-center group
          ${variantClasses} ${sizeClasses} ${widthClass} ${className}
          transform hover:-translate-y-1
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {icon && <span className="mr-2">{icon}</span>}
        
        <span className="relative z-10">{children}</span>
        
        {variant === 'primary' && (
          <span className="absolute inset-0 bg-blue-800 transform translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0"></span>
        )}
        
        {variant === 'secondary' && (
          <span className="absolute inset-0 bg-gray-900 transform translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0"></span>
        )}
      </motion.a>
    </Link>
  );
};

export default Button; 