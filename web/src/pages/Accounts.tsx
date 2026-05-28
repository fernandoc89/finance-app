import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Edit3,
  Landmark,
  Loader2,
  MoreVertical,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import React, { useState } from 'react';
import { createAccount, deleteAccount, fetchAccounts, updateAccount } from '../api/accounts';
import { queryKeys } from '../api/queryKeys';
import type { Account, AccountType, CreateAccountPayload } from '../types/account';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { formatReais } from '../utils/money';

const ACCOUNT_COLORS = ['#820AD1', '#EC7000', '#000000', '#6C63FF', '#4ECDC4', '#FF6B6B'];

interface AccountFormState {
  name: string;
  type: AccountType | '';
  balance: string;
  bank: string;
  color: string;
}

const emptyForm: AccountFormState = {
  name: '',
  type: '',
  balance: '',
  bank: '',
  color: ACCOUNT_COLORS[0],
};

export const Accounts: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<AccountFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: accounts = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.accounts,
    queryFn: fetchAccounts,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateAccountPayload) => createAccount(payload),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (error) => setFormError(getApiErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateAccountPayload }) =>
      updateAccount(id, payload),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (error) => setFormError(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      invalidate();
      setDeleteConfirm(null);
    },
    onError: (error) => alert(getApiErrorMessage(error)),
  });

  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const openCreateModal = () => {
    setEditingAccount(null);
    setForm(emptyForm);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setForm({
      name: account.name,
      type: account.type,
      balance: String(account.balance),
      bank: account.bank,
      color: account.color ?? ACCOUNT_COLORS[0],
    });
    setFormError(null);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim() || !form.type || !form.bank.trim()) {
      setFormError('Preencha todos os campos obrigatórios.');
      return;
    }

    const payload: CreateAccountPayload = {
      name: form.name.trim(),
      type: form.type,
      balance: parseFloat(form.balance) || 0,
      bank: form.bank.trim(),
      color: form.color,
    };

    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getAccountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      checking: 'Conta Corrente',
      savings: 'Poupança',
      investment: 'Investimento',
    };
    return labels[type] || type;
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Wallet size={24} />;
      case 'savings':
        return <TrendingUp size={24} />;
      case 'investment':
        return <TrendingDown size={24} />;
      default:
        return <Landmark size={24} />;
    }
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
        <p className="text-gray-600">Não foi possível carregar as contas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Contas</h1>
          <p className="page-subtitle mt-1">Gerencie suas contas bancárias</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus size={20} />
          Nova Conta
        </button>
      </div>

      {accounts.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Landmark size={24} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Saldo Total</p>
              <p className="text-3xl text-white font-bold">{formatReais(totalBalance)}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-white/70 text-xs">Contas</p>
              <p className="text-lg text-white font-semibold">{accounts.length}</p>
            </div>
            <div>
              <p className="text-white/70 text-xs">Média</p>
              <p className="text-lg text-white font-semibold">
                {formatReais(totalBalance / accounts.length)}
              </p>
            </div>
            <div>
              <p className="text-white/70 text-xs">Maior saldo</p>
              <p className="text-lg text-white font-semibold">
                {formatReais(Math.max(...accounts.map((a) => Number(a.balance))))}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="card-hover relative">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setActiveMenu(activeMenu === account.id ? null : account.id)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MoreVertical size={20} />
              </button>

              {activeMenu === account.id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => openEditModal(account)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setDeleteConfirm(account.id);
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: (account.color ?? '#6C63FF') + '15' }}
              >
                <div style={{ color: account.color ?? '#6C63FF' }}>
                  {getAccountIcon(account.type)}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{account.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{account.bank}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Saldo Atual</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatReais(Number(account.balance))}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">{getAccountTypeLabel(account.type)}</span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: account.color ?? '#6C63FF' }}
              />
            </div>
          </div>
        ))}

        <button
          onClick={openCreateModal}
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all min-h-[220px] group"
        >
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
            <Plus size={28} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <p className="text-gray-500 font-medium group-hover:text-indigo-600 transition-colors">
            Adicionar Conta
          </p>
        </button>
      </div>

      {accounts.length === 0 && (
        <div className="card text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Landmark size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma conta cadastrada</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Adicione suas contas bancárias para começar a gerenciar suas finanças.
          </p>
          <button onClick={openCreateModal} className="btn-primary">
            <Plus size={20} />
            Adicionar Primeira Conta
          </button>
        </div>
      )}

      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={closeModal} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl z-50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {editingAccount ? 'Editar Conta' : 'Nova Conta'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {formError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
              )}

              <div>
                <label className="form-label">Nome da Conta</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ex: Conta Corrente"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label">Tipo de Conta</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, type: e.target.value as AccountType }))
                  }
                >
                  <option value="">Selecione...</option>
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Poupança</option>
                  <option value="investment">Investimento</option>
                </select>
              </div>

              <div>
                <label className="form-label">Saldo Inicial</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0,00"
                  value={form.balance}
                  onChange={(e) => setForm((prev) => ({ ...prev, balance: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label">Banco</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ex: Nubank"
                  value={form.bank}
                  onChange={(e) => setForm((prev) => ({ ...prev, bank: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label">Cor</label>
                <div className="flex gap-2">
                  {ACCOUNT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        form.color === color
                          ? 'border-indigo-500 ring-2 ring-indigo-400'
                          : 'border-white ring-2 ring-gray-200 hover:ring-indigo-400'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 btn-secondary">
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Salvando...'
                    : editingAccount
                      ? 'Salvar'
                      : 'Criar Conta'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Excluir Conta</h3>
            <p className="text-sm text-gray-500 mb-6">
              Tem certeza? Contas com transações vinculadas não podem ser removidas.
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
