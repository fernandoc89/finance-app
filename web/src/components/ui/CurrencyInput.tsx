import React, { useCallback, useState } from 'react';

interface CurrencyInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = React.memo(({
  label,
  value,
  onChange,
  error,
  placeholder = '0,00',
  disabled = false,
}) => {
  const [displayValue, setDisplayValue] = useState(
    value ? (value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''
  );

  const formatCurrency = useCallback((input: string): string => {
    // Remove tudo exceto números
    const numbers = input.replace(/\D/g, '');

    // Converte para valor em centavos
    const cents = parseInt(numbers) || 0;

    // Formata para exibição
    const formatted = (cents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatted;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const numbers = input.replace(/\D/g, '');
    const cents = parseInt(numbers) || 0;

    setDisplayValue(formatCurrency(input));
    onChange(cents);
  };

  const handleBlur = () => {
    if (displayValue) {
      setDisplayValue(formatCurrency(displayValue));
    }
  };

  return (
    <div>
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
          R$
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            form-control w-full py-2.5 pl-10 pr-3
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
});

CurrencyInput.displayName = 'CurrencyInput';
