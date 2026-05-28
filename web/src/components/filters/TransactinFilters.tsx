import {
  ChevronDown,
  Filter,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { PeriodFilter } from './PeriodFilter';

interface TransactionFiltersProps {
  filters: TransactionFilterValues;
  onChange: (filters: TransactionFilterValues) => void;
  onReset: () => void;
  categories: Array<{ value: string; label: string; color: string }>;
  accounts: Array<{ value: string; label: string }>;
  cards: Array<{ value: string; label: string; color: string }>;
}

export interface TransactionFilterValues {
  search: string;
  startDate: string;
  endDate: string;
  type: string;
  paymentMethod: string;
  categoryId: string;
  accountId: string;
  cardId: string;
  minAmount: string;
  maxAmount: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

const defaultFilters: TransactionFilterValues = {
  search: '',
  startDate: '',
  endDate: '',
  type: '',
  paymentMethod: '',
  categoryId: '',
  accountId: '',
  cardId: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'date',
  sortOrder: 'DESC',
};

export const TransactionFilters: React.FC<TransactionFiltersProps> = React.memo(({
  filters,
  onChange,
  onReset,
  categories,
  accounts,
  cards,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = useCallback((field: keyof TransactionFilterValues, value: string) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onChange(newFilters);
  }, [localFilters, onChange]);

  const handlePeriodChange = useCallback((startDate: string, endDate: string) => {
    const newFilters = { ...localFilters, startDate, endDate };
    setLocalFilters(newFilters);
    onChange(newFilters);
  }, [localFilters, onChange]);

  const handleReset = useCallback(() => {
    setLocalFilters(defaultFilters);
    onReset();
  }, [onReset]);

  const activeFiltersCount = Object.entries(localFilters).filter(([key, value]) => {
    if (key === 'sortBy' && value === 'date') return false;
    if (key === 'sortOrder' && value === 'DESC') return false;
    return value !== '' && value !== defaultFilters[key as keyof TransactionFilterValues];
  }).length;

  return (
    <div className="space-y-3">
      {/* Filtros Rápidos */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar transações..."
            value={localFilters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="form-control w-full pl-10 pr-10 py-2 text-sm transition-colors"
          />
          {localFilters.search && (
            <button
              onClick={() => handleChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Tipo */}
        <select
          value={localFilters.type}
          onChange={(e) => handleChange('type', e.target.value)}
          className="form-control px-3 py-2 text-sm"
        >
          <option value="">Todos os tipos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
          <option value="transfer">Transferências</option>
        </select>

        {/* Período */}
        <PeriodFilter
          startDate={localFilters.startDate}
          endDate={localFilters.endDate}
          onChange={handlePeriodChange}
        />

        {/* Botão Filtros Avançados */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors
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

        {/* Reset */}
        {activeFiltersCount > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Limpar todos os filtros"
          >
            <RotateCcw size={14} />
            Limpar
          </button>
        )}
      </div>

      {/* Filtros Avançados */}
      {showAdvanced && (
        <div className="card animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Método de Pagamento */}
            <div>
              <label className="form-label text-xs mb-1">
                Método de Pagamento
              </label>
              <select
                value={localFilters.paymentMethod}
                onChange={(e) => handleChange('paymentMethod', e.target.value)}
                className="form-control w-full px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                <option value="pix">PIX</option>
                <option value="debit">Débito</option>
                <option value="credit">Crédito</option>
                <option value="money">Dinheiro</option>
                <option value="ted">TED</option>
              </select>
            </div>

            {/* Categoria */}
            <div>
              <label className="form-label text-xs mb-1">
                Categoria
              </label>
              <select
                value={localFilters.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                className="form-control w-full px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Conta */}
            <div>
              <label className="form-label text-xs mb-1">
                Conta
              </label>
              <select
                value={localFilters.accountId}
                onChange={(e) => handleChange('accountId', e.target.value)}
                className="form-control w-full px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {accounts.map((acc) => (
                  <option key={acc.value} value={acc.value}>
                    {acc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cartão */}
            <div>
              <label className="form-label text-xs mb-1">
                Cartão
              </label>
              <select
                value={localFilters.cardId}
                onChange={(e) => handleChange('cardId', e.target.value)}
                className="form-control w-full px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {cards.map((card) => (
                  <option key={card.value} value={card.value}>
                    {card.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor Mínimo */}
            <div>
              <label className="form-label text-xs mb-1">
                Valor Mínimo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                <input
                  type="number"
                  placeholder="0,00"
                  value={localFilters.minAmount}
                  onChange={(e) => handleChange('minAmount', e.target.value)}
                  className="form-control w-full pl-10 pr-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Valor Máximo */}
            <div>
              <label className="form-label text-xs mb-1">
                Valor Máximo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                <input
                  type="number"
                  placeholder="0,00"
                  value={localFilters.maxAmount}
                  onChange={(e) => handleChange('maxAmount', e.target.value)}
                  className="form-control w-full pl-10 pr-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Ordenação */}
            <div>
              <label className="form-label text-xs mb-1">
                Ordenar por
              </label>
              <div className="flex gap-2">
                <select
                  value={localFilters.sortBy}
                  onChange={(e) => handleChange('sortBy', e.target.value)}
                  className="form-control flex-1 px-3 py-2 text-sm"
                >
                  <option value="date">Data</option>
                  <option value="amount">Valor</option>
                  <option value="description">Descrição</option>
                </select>
                <button
                  onClick={() => handleChange('sortOrder', localFilters.sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                  className="form-control px-3 py-2 hover:border-indigo-400 transition-colors text-sm"
                  title={localFilters.sortOrder === 'ASC' ? 'Ascendente' : 'Descendente'}
                >
                  {localFilters.sortOrder === 'ASC' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tags de filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {localFilters.type && (
            <FilterTag
              label={`Tipo: ${localFilters.type === 'income' ? 'Receitas' : localFilters.type === 'expense' ? 'Despesas' : 'Transferências'}`}
              onRemove={() => handleChange('type', '')}
            />
          )}
          {localFilters.paymentMethod && (
            <FilterTag
              label={`Método: ${localFilters.paymentMethod.toUpperCase()}`}
              onRemove={() => handleChange('paymentMethod', '')}
            />
          )}
          {localFilters.categoryId && (
            <FilterTag
              label={`Categoria: ${categories.find(c => c.value === localFilters.categoryId)?.label}`}
              onRemove={() => handleChange('categoryId', '')}
              color={categories.find(c => c.value === localFilters.categoryId)?.color}
            />
          )}
          {localFilters.accountId && (
            <FilterTag
              label={`Conta: ${accounts.find(a => a.value === localFilters.accountId)?.label}`}
              onRemove={() => handleChange('accountId', '')}
            />
          )}
          {localFilters.cardId && (
            <FilterTag
              label={`Cartão: ${cards.find(c => c.value === localFilters.cardId)?.label}`}
              onRemove={() => handleChange('cardId', '')}
              color={cards.find(c => c.value === localFilters.cardId)?.color}
            />
          )}
        </div>
      )}
    </div>
  );
});

TransactionFilters.displayName = 'TransactionFilters';

// Componente auxiliar para tags de filtro
interface FilterTagProps {
  label: string;
  onRemove: () => void;
  color?: string;
}

const FilterTag: React.FC<FilterTagProps> = ({ label, onRemove, color }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
    style={color ? { backgroundColor: color + '20', color: color } : {}}
  >
    {label}
    <button
      onClick={onRemove}
      className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
      style={color ? { backgroundColor: color + '30' } : {}}
    >
      <X size={12} />
    </button>
  </span>
);
