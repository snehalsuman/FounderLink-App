import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  danger:    'btn-danger',
  success:   'btn-success',
  ghost:     'inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors active:scale-[0.98]',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'py-1.5 px-3 text-xs',
  md: '',           // base sizing already in CSS classes
  lg: 'py-3 px-7 text-base',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...rest
}) => {
  const base = variantClass[variant];
  const sizing = sizeClass[size];
  const width = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || isLoading}
      className={`${base} ${sizing} ${width} ${className}`.trim()}
      {...rest}
    >
      {isLoading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};

export default Button;
