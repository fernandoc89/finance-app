import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = React.memo(({
  label,
  error,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full rounded-lg border transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${leftIcon ? 'pl-10' : 'pl-3'} ${rightIcon ? 'pr-10' : 'pr-3'}
            py-2.5 text-sm
            bg-white dark:bg-gray-700 dark:text-gray-100
            ${error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
            }
            disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
