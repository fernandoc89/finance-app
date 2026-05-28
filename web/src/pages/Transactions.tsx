import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownUp,
  Edit3,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { fetchAccounts } from '../api/accounts';
import { fetchCards } from '../api/cards';
import { fetchCategories } from '../api/categories';
import { queryKeys } from '../api/queryKeys';
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from '../api/transactions';
import { TransactionFilters, type TransactionFilterValues } from '../components/filters/TransactinFilters';
import { type TransactionFormData, TransactionModal } from '../components/modals';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import type { QueryTransactionsParams, Transaction } from '../types/transaction';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { formatReais } from '../utils/money';
import { formDataToCreatePayload, transactionToFormData } from '../utils/transactionMappers';

const ACTION_MENU_WIDTH = 144;
const ACTION_MENU_HEIGHT = 88;

interface MenuPosition {
  top: number;
  left: number;
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

export const Transactions: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<
    (TransactionFormData & { id: string }) | null
  >(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilterValues>(defaultFilters);

  const queryParams = useMemo((): QueryTransactionsParams => {
    const params: QueryTransactionsParams = {
      page: 1,
      limit: 100,
      sortBy: filters.sortBy || 'date',
      sortOrder: filters.sortOrder,
    };

    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.type) params.type = filters.type as QueryTransactionsParams['type'];
    if (filters.paymentMethod) {
      params.paymentMethod = filters.paymentMethod as QueryTransactionsParams['paymentMethod'];
    }
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.accountId) params.accountId = filters.accountId;
    if (filters.cardId) params.cardId = filters.cardId;

    return params;
  }, [filters]);

  const { data: transactionsResponse, isLoading, isError } = useQuery({
    queryKey: queryKeys.transactions(queryParams),
    queryFn: () => fetchTransactions(queryParams),
  });

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategories,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: queryKeys.accounts,
    queryFn: fetchAccounts,
  });

  const { data: cards = [] } = useQuery({
    queryKey: queryKeys.cards,
    queryFn: fetchCards,
  });

  const transactions = transactionsResponse?.data ?? [];
  const totalCount = transactionsResponse?.meta.total ?? 0;

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((c) => c.isActive)
        .map((c) => ({ value: c.id, label: c.name, color: c.color })),
    [categories],
  );

  const accountOptions = useMemo(
    () => accounts.map((a) => ({ value: a.id, label: `${a.name} - ${a.bank}` })),
    [accounts],
  );

  const cardOptions = useMemo(
    () =>
      cards.map((c) => ({
        value: c.id,
        label: `${c.name} **** ${c.lastDigits}`,
        color: c.color ?? '#6C63FF',
      })),
    [cards],
  );

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['transactions'] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    void queryClient.invalidateQueries({ queryKey: queryKeys.cards });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    void queryClient.invalidateQueries({ queryKey: queryKeys.categoryStats });
  };

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionFormData }) =>
      updateTransaction(id, formDataToCreatePayload(data)),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      invalidate();
      setDeleteConfirm(null);
    },
    onError: (error) => alert(getApiErrorMessage(error)),
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        !filters.search ||
        transaction.description.toLowerCase().includes(filters.search.toLowerCase());

      const amount = Number(transaction.amount);
      const minOk =
        !filters.minAmount || amount >= parseFloat(filters.minAmount);
      const maxOk =
        !filters.maxAmount || amount <= parseFloat(filters.maxAmount);

      return matchesSearch && minOk && maxOk;
    });
  }, [transactions, filters.search, filters.minAmount, filters.maxAmount]);

  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  const handleSave = async (data: TransactionFormData) => {
    try {
      if (editingTransaction?.id) {
        await updateMutation.mutateAsync({ id: editingTransaction.id, data });
      } else {
        await createMutation.mutateAsync(formDataToCreatePayload(data));
      }
      setEditingTransaction(null);
    } catch (error) {
      alert(getApiErrorMessage(error));
      throw error;
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transactionToFormData(transaction));
    setIsModalOpen(true);
    closeActionMenu();
  };

  const handleOpenNew = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const closeActionMenu = () => {
    setActiveMenu(null);
    setMenuPosition(null);
  };

  const openActionMenu = (
    transactionId: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (activeMenu === transactionId) {
      closeActionMenu();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const gap = 4;
    let top = rect.bottom + gap;
    let left = rect.right - ACTION_MENU_WIDTH;

    if (top + ACTION_MENU_HEIGHT > window.innerHeight) {
      top = rect.top - ACTION_MENU_HEIGHT - gap;
    }
    if (left < 8) {
      left = 8;
    }

    setMenuPosition({ top, left });
    setActiveMenu(transactionId);
  };

  const activeMenuTransaction = useMemo(
    () => filteredTransactions.find((t) => t.id === activeMenu),
    [filteredTransactions, activeMenu],
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR');

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      pix: 'PIX',
      debit: 'Débito',
      credit: 'Crédito',
      money: 'Dinheiro',
      ted: 'TED',
    };
    return labels[method] || method;
  };

  const getAccountOrCardLabel = (transaction: Transaction) => {
    if (transaction.account) {
      return `${transaction.account.name} - ${transaction.account.bank}`;
    }
    if (transaction.card) {
      return `${transaction.card.name} **** ${transaction.card.lastDigits}`;
    }
    return '-';
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
        <p className="text-gray-600">Não foi possível carregar as transações.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Transações</h1>
          <p className="page-subtitle mt-1">{totalCount} transações encontradas</p>
        </div>
        <button onClick={handleOpenNew} className="btn-primary">
          <Plus size={20} />
          Nova Transação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-hover stat-card-green border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">Receitas</p>
              <p className="text-xl font-bold text-green-900 dark:text-green-100">{formatReais(totals.income)}</p>
            </div>
          </div>
        </div>

        <div className="card-hover stat-card-red border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <TrendingDown size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">Despesas</p>
              <p className="text-xl font-bold text-red-900 dark:text-red-100">{formatReais(totals.expense)}</p>
            </div>
          </div>
        </div>

        <div
          className={`card-hover border-2 ${
            totals.balance >= 0 ? 'stat-card-blue' : 'stat-card-orange'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                totals.balance >= 0 ? 'bg-blue-500' : 'bg-orange-500'
              }`}
            >
              <ArrowDownUp size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Balanço</p>
              <p
                className={`text-xl font-bold ${
                  totals.balance >= 0
                    ? 'text-blue-900 dark:text-blue-100'
                    : 'text-orange-900 dark:text-orange-100'
                }`}
              >
                {formatReais(Math.abs(totals.balance))}
              </p>
            </div>
          </div>
        </div>
      </div>

      <TransactionFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
        categories={categoryOptions}
        accounts={accountOptions}
        cards={cardOptions}
      />

      <div className="card p-0">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Conta/Cartão</th>
                  <th>Data</th>
                  <th className="text-right">Valor</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          {transaction.type === 'income' ? (
                            <TrendingUp size={16} className="text-green-600" />
                          ) : (
                            <TrendingDown size={16} className="text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {getPaymentMethodLabel(transaction.paymentMethod)}
                            {transaction.installments && transaction.installments > 1 &&
                              ` • ${transaction.installments}x`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: (transaction.category?.color ?? '#6B7280') + '20',
                          color: transaction.category?.color ?? '#6B7280',
                        }}
                      >
                        {transaction.category?.icon && (
                          <CategoryIcon
                            icon={transaction.category.icon}
                            size={14}
                            color={transaction.category.color}
                          />
                        )}
                        {transaction.category?.name ?? '-'}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getAccountOrCardLabel(transaction)}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(transaction.date)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span
                        className={`text-sm font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatReais(Number(transaction.amount))}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="relative">
                        <button
                          onClick={(e) => openActionMenu(transaction.id, e)}
                          className={`p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all ${
                            activeMenu === transaction.id
                              ? 'opacity-100'
                              : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma transação</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.type
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando sua primeira transação'}
            </p>
            {!filters.search && !filters.type && (
              <button onClick={handleOpenNew} className="btn-primary">
                <Plus size={20} />
                Nova Transação
              </button>
            )}
          </div>
        )}
      </div>

      {activeMenu && menuPosition && activeMenuTransaction && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeActionMenu} />
          <div
            className="fixed z-50 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <button
              onClick={() => handleEdit(activeMenuTransaction)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Edit3 size={14} />
              Editar
            </button>
            <button
              onClick={() => {
                setDeleteConfirm(activeMenuTransaction.id);
                closeActionMenu();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
              Excluir
            </button>
          </div>
        </>
      )}

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSave}
        initialData={editingTransaction}
        categories={categoryOptions}
        accounts={accountOptions}
        cards={cardOptions}
      />

      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Excluir Transação</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Esta ação não pode ser desfeita.</p>
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
