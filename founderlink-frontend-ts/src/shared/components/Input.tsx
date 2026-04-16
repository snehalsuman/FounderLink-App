import React from 'react';

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className = '', id, ...rest }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`input-field ${leftIcon ? 'pl-9' : ''} ${error ? 'border-red-500/60 focus:ring-red-500/30' : ''} ${className}`}
            {...rest}
          />
        </div>
        {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...rest }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`input-field resize-none ${error ? 'border-red-500/60 focus:ring-red-500/30' : ''} ${className}`}
          {...rest}
        />
        {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', id, children, ...rest }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={`input-field ${error ? 'border-red-500/60 focus:ring-red-500/30' : ''} ${className}`}
          {...rest}
        >
          {children}
        </select>
        {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
