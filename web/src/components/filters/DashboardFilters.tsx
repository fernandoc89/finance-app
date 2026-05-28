import { ChevronDown, Filter, RotateCcw } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { PeriodFilter } from './PeriodFilter';

interface DashboardFiltersProps {
  filters: DashboardFilterValues;
  onChange: (filters: DashboardFilterValues) => void;
  onReset: () => void;
  categories: Array<{ value: string; label: string; color: string }>;
  accounts: Array<{ value: string; label: string }>;
  cards: Array<{ value: string; label: string; color: string }>;
}

export interface DashboardFilterValues {
  startDate: string;
  endDate: string;
  accountId: string;
  cardId: string;
  categoryIds: string[];
  compareWithPrevious: boolean;
  groupBy: 'day' | 'week' | 'month' | 'year';
}

const defaultFilters: DashboardFilterValues = {
  startDate: '',
  endDate: '',
  accountId: '',
  cardId: '',
  categoryIds: [],
  compareWithPrevious: false,
  groupBy: 'month',
};

export const DashboardFilters: React.FC<DashboardFiltersProps> = React.memo(({
  filters,
  onChange,
  onReset,
  categories,
  accounts,
  cards,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = useCallback((field: keyof DashboardFilterValues, value: string | number | boolean) => {
    onChange({ ...filters, [field]: value });
  }, [filters, onChange]);

  const handlePeriodChange = useCallback((startDate: string, endDate: string) => {
    onChange({ ...filters, startDate, endDate });
  }, [filters, onChange]);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    const newCategories = filters.categoryIds.includes(categoryId)
      ? filters.categoryIds.filter(id => id !== categoryId)
      : [...filters.categoryIds, categoryId];
    handleChange('categoryIds', newCategories as unknown as boolean);
  }, [filters, handleChange]);

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'groupBy' && value === 'month') return false;
    if (key === 'compareWithPrevious' && value === false) return false;
    if (key === 'categoryIds' && Array.isArray(value) && value.length === 0) return false;
    return value !== '' && value !== defaultFilters[key as keyof DashboardFilterValues];
  }).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Período */}
        <PeriodFilter
          startDate={filters.startDate}
          endDate={filters.endDate}
          onChange={handlePeriodChange}
        />

        {/* Conta */}
        <select
          value={filters.accountId}
          onChange={(e) => handleChange('accountId', e.target.value)}
          className="form-control px-3 py-1.5 text-sm"
        >
          <option value="">Todas as contas</option>
          {accounts.map((acc) => (
            <option key={acc.value} value={acc.value}>
              {acc.label}
            </option>
          ))}
        </select>

        {/* Cartão */}
        <select
          value={filters.cardId}
          onChange={(e) => handleChange('cardId', e.target.value)}
          className="form-control px-3 py-1.5 text-sm"
        >
          <option value="">Todos os cartões</option>
          {cards.map((card) => (
            <option key={card.value} value={card.value}>
              {card.label}
            </option>
          ))}
        </select>

        {/* Agrupamento */}
        <select
          value={filters.groupBy}
          onChange={(e) => handleChange('groupBy', e.target.value)}
          className="form-control px-3 py-1.5 text-sm"
        >
          <option value="day">Diário</option>
          <option value="week">Semanal</option>
          <option value="month">Mensal</option>
          <option value="year">Anual</option>
        </select>

        {/* Comparar com período anterior */}
        <label className="flex items-center gap-2 px-3 py-1.5 form-control cursor-pointer hover:border-indigo-400 transition-colors">
          <input
            type="checkbox"
            checked={filters.compareWithPrevious}
            onChange={(e) => handleChange('compareWithPrevious', e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-gray-700 dark:text-gray-200">Comparar com período anterior</span>
        </label>

        {/* Mais Filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors
            ${showFilters || filters.categoryIds.length > 0
              ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
              : 'form-control text-gray-700 dark:text-gray-200 hover:border-indigo-400'
            }
          `}
        >
          <Filter size={14} />
          Categorias
          {filters.categoryIds.length > 0 && (
            <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {filters.categoryIds.length}
            </span>
          )}
          <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Reset */}
        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RotateCcw size={14} />
            Limpar
          </button>
        )}
      </div>

      {/* Filtro de Categorias */}
      {showFilters && (
        <div className="card animate-slide-up">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategoryToggle(category.value)}
                className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all
                  ${filters.categoryIds.includes(category.value)
                    ? 'text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
                style={
                  filters.categoryIds.includes(category.value)
                    ? { backgroundColor: category.color }
                    : {}
                }
              >
                <div
                  className={`w-2 h-2 rounded-full ${filters.categoryIds.includes(category.value)
                    ? 'bg-white'
                    : ''
                    }`}
                  style={
                    !filters.categoryIds.includes(category.value)
                      ? { backgroundColor: category.color }
                      : {}
                  }
                />
                {category.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

DashboardFilters.displayName = 'DashboardFilters';
