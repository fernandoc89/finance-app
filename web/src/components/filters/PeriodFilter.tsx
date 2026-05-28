import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface PeriodFilterProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  className?: string;
}

// Períodos predefinidos
const PRESET_PERIODS = [
  {
    label: 'Mês Atual', getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: formatDate(start), end: formatDate(end) };
    }
  },
  {
    label: 'Mês Anterior', getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: formatDate(start), end: formatDate(end) };
    }
  },
  {
    label: 'Últimos 3 meses', getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const end = new Date();
      return { start: formatDate(start), end: formatDate(end) };
    }
  },
  {
    label: 'Últimos 6 meses', getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const end = new Date();
      return { start: formatDate(start), end: formatDate(end) };
    }
  },
  {
    label: 'Último ano', getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      const end = new Date();
      return { start: formatDate(start), end: formatDate(end) };
    }
  },
  {
    label: 'Ano Atual', getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date();
      return { start: formatDate(start), end: formatDate(end) };
    }
  },
];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export const PeriodFilter: React.FC<PeriodFilterProps> = React.memo(({
  startDate,
  endDate,
  onChange,
  className = '',
}) => {
  const [showPresets, setShowPresets] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const handlePresetClick = useCallback((preset: typeof PRESET_PERIODS[0]) => {
    const { start, end } = preset.getValue();
    onChange(start, end);
    setSelectedPreset(preset.label);
    setShowPresets(false);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange('', '');
    setSelectedPreset('');
  }, [onChange]);

  const handleMonthNavigation = useCallback((direction: 'prev' | 'next') => {
    if (!startDate) return;

    const currentStart = new Date(startDate + 'T00:00:00');
    const newStart = new Date(currentStart.getFullYear(), currentStart.getMonth() + (direction === 'next' ? 1 : -1), 1);
    const newEnd = new Date(newStart.getFullYear(), newStart.getMonth() + 1, 0);

    onChange(formatDate(newStart), formatDate(newEnd));
    setSelectedPreset('');
  }, [startDate, onChange]);

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        {/* Navegação mensal */}
        <button
          onClick={() => handleMonthNavigation('prev')}
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          title="Mês anterior"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Seletor de período */}
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="flex items-center gap-2 px-3 py-1.5 form-control hover:border-indigo-400 transition-colors"
        >
          <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
          <span className="text-gray-700 dark:text-gray-200">
            {selectedPreset || (startDate && endDate
              ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
              : 'Selecionar período'
            )}
          </span>
        </button>

        <button
          onClick={() => handleMonthNavigation('next')}
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          title="Próximo mês"
        >
          <ChevronRight size={18} />
        </button>

        {/* Limpar filtro */}
        {(startDate || endDate) && (
          <button
            onClick={handleClear}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            title="Limpar período"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dropdown de períodos predefinidos */}
      {showPresets && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowPresets(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20">
            <div className="px-3 py-1.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Períodos Predefinidos
              </p>
            </div>
            {PRESET_PERIODS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset)}
                className={`
                  w-full text-left px-4 py-2 text-sm transition-colors
                  ${selectedPreset === preset.label
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                {preset.label}
              </button>
            ))}

            <div className="border-t border-gray-100 mt-2 pt-2 px-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Período Personalizado
              </p>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500">De</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onChange(e.target.value, endDate)}
                    className="form-control w-full mt-0.5 px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Até</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onChange(startDate, e.target.value)}
                    className="form-control w-full mt-0.5 px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

PeriodFilter.displayName = 'PeriodFilter';
