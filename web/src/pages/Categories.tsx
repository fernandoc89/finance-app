import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Edit3,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Tags,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
  createCategory,
  createDefaultCategories,
  deleteCategory,
  fetchCategories,
  fetchCategoryStats,
  updateCategory,
} from '../api/categories';
import { queryKeys } from '../api/queryKeys';
import { CategoryFilters, type CategoryFilterValues } from '../components/filters/CategoryFilters';
import { CategoryModal, type CategoryFormData } from '../components/modals';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import type { Category } from '../types/category';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { formatReais } from '../utils/money';

type CategoryView = CategoryFormData & {
  id: string;
  transactionCount: number;
  totalSpent: number;
};

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

function mergeCategoriesWithStats(
  categories: Category[],
  stats: Awaited<ReturnType<typeof fetchCategoryStats>>,
): CategoryView[] {
  const statsMap = new Map(stats.map((s) => [s.category.id, s]));

  return categories.map((category) => {
    const stat = statsMap.get(category.id);
    return {
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      isActive: category.isActive,
      transactionCount: stat?.transactionCount ?? 0,
      totalSpent: stat?.total ?? 0,
    };
  });
}

export const Categories: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryFormData | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<CategoryFilterValues>(defaultFilters);

  const { data: categoriesRaw = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategories,
  });

  const { data: stats = [] } = useQuery({
    queryKey: [...queryKeys.categoryStats, filters.startDate, filters.endDate],
    queryFn: () => fetchCategoryStats(filters.startDate || undefined, filters.endDate || undefined),
  });

  const categories = useMemo(
    () => mergeCategoriesWithStats(categoriesRaw, stats),
    [categoriesRaw, stats],
  );

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    void queryClient.invalidateQueries({ queryKey: queryKeys.categoryStats });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  };

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) => updateCategory(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      invalidate();
      setDeleteConfirm(null);
    },
    onError: (error) => alert(getApiErrorMessage(error)),
  });

  const defaultsMutation = useMutation({
    mutationFn: createDefaultCategories,
    onSuccess: invalidate,
    onError: (error) => alert(getApiErrorMessage(error)),
  });

  const filteredCategories = useMemo(() => {
    let result = [...categories];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((cat) => cat.name.toLowerCase().includes(searchLower));
    }

    if (!filters.showInactive) {
      result = result.filter((cat) => cat.isActive);
    }

    if (!filters.showZeroTransactions) {
      result = result.filter((cat) => cat.transactionCount > 0);
    }

    if (filters.minTransactions) {
      const min = parseInt(filters.minTransactions, 10);
      if (!Number.isNaN(min)) {
        result = result.filter((cat) => cat.transactionCount >= min);
      }
    }

    if (filters.minAmount) {
      const minReais = parseFloat(filters.minAmount);
      if (!Number.isNaN(minReais)) {
        result = result.filter((cat) => cat.totalSpent >= minReais);
      }
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'transactions':
          comparison = a.transactionCount - b.transactionCount;
          break;
        case 'totalSpent':
          comparison = a.totalSpent - b.totalSpent;
          break;
        default:
          comparison = 0;
      }
      return filters.sortOrder === 'ASC' ? comparison : -comparison;
    });

    return result;
  }, [categories, filters]);

  const totals = useMemo(() => {
    const active = categories.filter((c) => c.isActive).length;
    const inactive = categories.filter((c) => !c.isActive).length;
    const totalSpent = categories.reduce((sum, cat) => sum + cat.totalSpent, 0);
    const totalTransactions = categories.reduce((sum, cat) => sum + cat.transactionCount, 0);
    return { active, inactive, totalSpent, totalTransactions };
  }, [categories]);

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy' && value === 'totalSpent') return false;
    if (key === 'sortOrder' && value === 'DESC') return false;
    if (key === 'showInactive' && value === false) return false;
    if (key === 'showZeroTransactions' && value === true) return false;
    return value !== '' && value !== defaultFilters[key as keyof CategoryFilterValues];
  }).length;

  const handleSave = async (data: CategoryFormData) => {
    try {
      if (editingCategoryId) {
        await updateMutation.mutateAsync({ id: editingCategoryId, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setEditingCategory(null);
      setEditingCategoryId(null);
    } catch (error) {
      alert(getApiErrorMessage(error));
      throw error;
    }
  };

  const handleEdit = (category: CategoryView) => {
    const { id, transactionCount: _tc, totalSpent: _ts, ...categoryData } = category;
    setEditingCategory(categoryData);
    setEditingCategoryId(id);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleToggleStatus = async (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    try {
      await updateMutation.mutateAsync({
        id: categoryId,
        data: { ...category, isActive: !category.isActive },
      });
    } catch (error) {
      alert(getApiErrorMessage(error));
    }
    setActiveMenu(null);
  };

  const handleOpenNew = () => {
    setEditingCategory(null);
    setEditingCategoryId(null);
    setIsModalOpen(true);
  };

  const handleCreateDefaults = () => {
    defaultsMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card text-center py-16">
        <p className="text-gray-600">Não foi possível carregar as categorias.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Categorias</h1>
          <p className="page-subtitle mt-1">
            {totals.active} ativas • {totals.inactive} inativas
          </p>
        </div>
        <button onClick={handleOpenNew} className="btn-primary">
          <Plus size={20} />
          Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-hover stat-card-indigo border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Tags size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">Total de Categorias</p>
              <p className="text-xl font-bold text-indigo-900 dark:text-indigo-100">{categories.length}</p>
            </div>
          </div>
        </div>

        <div className="card-hover stat-card-green border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">Total em Despesas</p>
              <p className="text-xl font-bold text-green-900 dark:text-green-100">{formatReais(totals.totalSpent)}</p>
            </div>
          </div>
        </div>

        <div className="card-hover stat-card-blue border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Transações</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{totals.totalTransactions}</p>
            </div>
          </div>
        </div>
      </div>

      <CategoryFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
        totalCategories={categories.length}
        activeCategories={totals.active}
        inactiveCategories={totals.inactive}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'grid' && (
        <>
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className={`card-hover relative group ${!category.isActive ? 'opacity-60' : ''}`}
                >
                  {!category.isActive && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Inativa
                      </span>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={() => setActiveMenu(activeMenu === category.id ? null : category.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenu === category.id && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setActiveMenu(null)} />
                        <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30">
                          <button
                            onClick={() => handleEdit(category)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit3 size={14} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleStatus(category.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {category.isActive ? 'Desativar' : 'Ativar'}
                          </button>
                          <hr className="my-1 border-gray-100" />
                          <button
                            onClick={() => {
                              setDeleteConfirm(category.id);
                              setActiveMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                            Excluir
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <CategoryIcon icon={category.icon} size={24} color={category.color} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{category.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{category.transactionCount} transações</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total em despesas</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {formatReais(category.totalSpent)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: category.isActive ? '#10B981' : '#9CA3AF' }}
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={handleOpenNew}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all min-h-[200px] group"
              >
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
                  <Plus size={28} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-gray-500 font-medium group-hover:text-indigo-600 transition-colors">
                  Nova Categoria
                </p>
              </button>
            </div>
          ) : (
            <div className="card text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {filters.search || activeFiltersCount > 0 ? (
                  <Search size={40} className="text-gray-400" />
                ) : (
                  <Tags size={40} className="text-gray-400" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filters.search || activeFiltersCount > 0
                  ? 'Nenhuma categoria encontrada'
                  : 'Nenhuma categoria'}
              </h3>
              {!filters.search && activeFiltersCount === 0 && (
                <div className="flex gap-3 justify-center mt-6">
                  <button
                    onClick={handleCreateDefaults}
                    className="btn-secondary"
                    disabled={defaultsMutation.isPending}
                  >
                    Criar Categorias Padrão
                  </button>
                  <button onClick={handleOpenNew} className="btn-primary">
                    Nova Categoria
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {viewMode === 'list' && (
        <>
          {filteredCategories.length > 0 ? (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Categoria</th>
                      <th className="text-center">Transações</th>
                      <th className="text-right">Total Gasto</th>
                      <th>Status</th>
                      <th className="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr key={category.id} className="group">
                        <td>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: category.color + '20' }}
                            >
                              <CategoryIcon icon={category.icon} size={20} color={category.color} />
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{category.name}</p>
                          </div>
                        </td>
                        <td className="text-center">{category.transactionCount}</td>
                        <td className="text-right font-semibold">
                          {formatReais(category.totalSpent)}
                        </td>
                        <td>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              category.isActive
                                ? 'bg-green-50 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {category.isActive ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => setActiveMenu(activeMenu === category.id ? null : category.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {activeMenu === category.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                              <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border py-1 z-20">
                                <button onClick={() => handleEdit(category)} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50">
                                  Editar
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteConfirm(category.id);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                                >
                                  Excluir
                                </button>
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card text-center py-16">
              <p className="text-gray-500">Nenhuma categoria encontrada</p>
            </div>
          )}
        </>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
          setEditingCategoryId(null);
        }}
        onSave={handleSave}
        initialData={editingCategory}
      />

      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Excluir Categoria</h3>
            <p className="text-sm text-gray-500 mb-6">
              Categorias com transações serão desativadas em vez de removidas.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-secondary">
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                className="flex-1 btn-danger"
                disabled={deleteMutation.isPending}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
