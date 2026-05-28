import {
  ArrowUpDown,
  ChevronDown,
  Filter,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { PeriodFilter } from './PeriodFilter';

interface CategoryFiltersProps {
  filters: CategoryFilterValues;
  onChange: (filters: CategoryFilterValues) => void;
  onReset: () => void;
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export interface CategoryFilterValues {
  search: string;
  startDate: string;
  endDate: string;
  sortBy: 'name' | 'transactions' | 'totalSpent' | 'recent';
  sortOrder: 'ASC' | 'DESC';
  showInactive: boolean;
  showZeroTransactions: boolean;
  minTransactions: string;
  minAmount: string;
}

const defaultFilters: CategoryFilterValues = {
  search: '',
  startDate: '',
  endDate: '',
  sortBy: 'totalSpent',
  sortOrder: 'DESC',
  showInactive: false,
  showZeroTransactions: true,
  minTransactions: '',
  minAmount: '',
};

export const CategoryFilters: React.FC<CategoryFiltersProps> = React.memo(({
  filters,
  onChange,
  onReset,
  totalCategories,
  activeCategories,
  inactiveCategories,
  viewMode,
  onViewModeChange,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = useCallback((field: keyof CategoryFilterValues, value: string | number | boolean) => {
    onChange({ ...filters, [field]: value });
  }, [filters, onChange]);

  const handlePeriodChange = useCallback((startDate: string, endDate: string) => {
    onChange({ ...filters, startDate, endDate });
  }, [filters, onChange]);

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy' && value === 'totalSpent') return false;
    if (key === 'sortOrder' && value === 'DESC') return false;
    if (key === 'showInactive' && value === false) return false;
    if (key === 'showZeroTransactions' && value === true) return false;
    return value !== '' && value !== defaultFilters[key as keyof CategoryFilterValues];
  }).length;

  const sortOptions = [
    { value: 'totalSpent', label: 'Maior Gasto', icon: TrendingDown },
    { value: 'transactions', label: 'Mais Transações', icon: ArrowUpDown },
    { value: 'name', label: 'Nome (A-Z)', icon: ArrowUpDown },
    { value: 'recent', label: 'Mais Recentes', icon: ArrowUpDown },
  ];

  return (
    <div className="space-y-3">
      {/* Barra Principal de Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar categorias..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="form-control w-full pl-10 pr-10 py-2 text-sm transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => handleChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Período */}
        <PeriodFilter
          startDate={filters.startDate}
          endDate={filters.endDate}
          onChange={handlePeriodChange}
        />

        {/* Ordenação */}
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="form-control appearance-none pl-3 pr-8 py-2 text-sm cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              onClick={() => handleChange('sortOrder', filters.sortOrder === 'ASC' ? 'DESC' : 'ASC')}
              className="p-0.5 hover:bg-gray-100 rounded transition-colors"
              title={filters.sortOrder === 'ASC' ? 'Ascendente' : 'Descendente'}
            >
              {filters.sortOrder === 'ASC' ? (
                <TrendingUp size={14} className="text-gray-400" />
              ) : (
                <TrendingDown size={14} className="text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Filtros Avançados */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors whitespace-nowrap
            ${showAdvanced || activeFiltersCount > 0
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
              : 'form-control text-gray-700 dark:text-gray-200 hover:border-indigo-400'
            }
          `}
        >
          <Filter size={16} />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown size={14} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {/* Visualização */}
        <div className="flex items-center form-control overflow-hidden p-0">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="Visualização em grade"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="Visualização em lista"
          >
            <List size={16} />
          </button>
        </div>

        {/* Reset */}
        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
            title="Limpar todos os filtros"
          >
            <RotateCcw size={14} />
            Limpar
          </button>
        )}
      </div>

      {/* Status Rápido */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleChange('showInactive', !filters.showInactive)}
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors
            ${filters.showInactive
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${filters.showInactive ? 'bg-indigo-500' : 'bg-gray-400'}`} />
          Ativas ({activeCategories})
        </button>

        <button
          onClick={() => handleChange('showInactive', !filters.showInactive)}
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors
            ${!filters.showInactive
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-indigo-100 text-indigo-700'
            }
          `}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${!filters.showInactive ? 'bg-indigo-500' : 'bg-gray-400'}`} />
          Inativas ({inactiveCategories})
        </button>

        <span className="text-xs text-gray-400">|</span>

        <span className="text-xs text-gray-500">
          Total: {totalCategories} categorias
        </span>
      </div>

      {/* Filtros Avançados */}
      {showAdvanced && (
        <div className="card animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Mostrar inativas */}
            <div>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.showInactive}
                  onChange={(e) => handleChange('showInactive', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Mostrar Inativas</p>
                  <p className="text-xs text-gray-500">Exibir categorias desativadas</p>
                </div>
              </label>
            </div>

            {/* Mostrar sem transações */}
            <div>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.showZeroTransactions}
                  onChange={(e) => handleChange('showZeroTransactions', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sem Transações</p>
                  <p className="text-xs text-gray-500">Mostrar categorias não utilizadas</p>
                </div>
              </label>
            </div>

            {/* Mínimo de Transações */}
            <div>
              <label className="form-label text-xs mb-1">
                Mínimo de Transações
              </label>
              <input
                type="number"
                placeholder="Ex: 5"
                value={filters.minTransactions}
                onChange={(e) => handleChange('minTransactions', e.target.value)}
                min={0}
                className="form-control w-full px-3 py-2 text-sm"
              />
            </div>

            {/* Valor Mínimo Gasto */}
            <div>
              <label className="form-label text-xs mb-1">
                Valor Mínimo Gasto
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                <input
                  type="number"
                  placeholder="0,00"
                  value={filters.minAmount}
                  onChange={(e) => handleChange('minAmount', e.target.value)}
                  min={0}
                  step="0.01"
                  className="form-control w-full pl-10 pr-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tags de Filtros Ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.showInactive && (
            <FilterTag
              label="Mostrando inativas"
              onRemove={() => handleChange('showInactive', false)}
              color="#6B7280"
            />
          )}
          {!filters.showZeroTransactions && (
            <FilterTag
              label="Ocultando sem transações"
              onRemove={() => handleChange('showZeroTransactions', true)}
              color="#6B7280"
            />
          )}
          {filters.minTransactions && (
            <FilterTag
              label={`Mín. ${filters.minTransactions} transações`}
              onRemove={() => handleChange('minTransactions', '')}
            />
          )}
          {filters.minAmount && (
            <FilterTag
              label={`Mín. R$ ${filters.minAmount}`}
              onRemove={() => handleChange('minAmount', '')}
            />
          )}
          {filters.sortBy !== 'totalSpent' && (
            <FilterTag
              label={`Ordenado por: ${sortOptions.find(o => o.value === filters.sortBy)?.label}`}
              onRemove={() => handleChange('sortBy', 'totalSpent')}
            />
          )}
        </div>
      )}
    </div>
  );
});

CategoryFilters.displayName = 'CategoryFilters';

// Componente auxiliar para tags de filtro
interface FilterTagProps {
  label: string;
  onRemove: () => void;
  color?: string;
}

const FilterTag: React.FC<FilterTagProps> = React.memo(({ label, onRemove, color }) => (
  <span
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
    style={color ? { backgroundColor: color + '15', color: color } : {}}
  >
    {label}
    <button
      onClick={onRemove}
      className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
      style={color ? { backgroundColor: color + '20' } : {}}
    >
      <X size={12} />
    </button>
  </span>
));

FilterTag.displayName = 'FilterTag';
