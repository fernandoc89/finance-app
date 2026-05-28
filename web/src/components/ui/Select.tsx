import React from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = React.memo(({
  label,
  error,
  options,
  placeholder = 'Selecione...',
  className = '',
  id,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          form-control w-full py-2.5 px-3
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${error
            ? 'border-red-300 focus:ring-red-500'
            : 'focus:ring-indigo-500'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
