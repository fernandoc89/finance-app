import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CreditCard, DollarSign, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchBalanceHistory, fetchDashboard } from '../api/dashboard';
import { queryKeys } from '../api/queryKeys';
import { DashboardFilters, type DashboardFilterValues } from '../components/filters/DashboardFilters';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { formatReais } from '../utils/money';

const CHART_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const defaultFilters: DashboardFilterValues = {
  startDate: '',
  endDate: '',
  accountId: '',
  cardId: '',
  categoryIds: [],
  compareWithPrevious: false,
  groupBy: 'month',
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [filters, setFilters] = useState<DashboardFilterValues>(defaultFilters);
  const [historyMonths, setHistoryMonths] = useState(6);

  const { data: dashboard, isLoading, isError } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchDashboard,
  });

  const { data: balanceHistory = [] } = useQuery({
    queryKey: queryKeys.balanceHistory(historyMonths),
    queryFn: () => fetchBalanceHistory(historyMonths),
  });

  const filterOptions = useMemo(() => {
    if (!dashboard) {
      return { categories: [], accounts: [], cards: [] };
    }

    return {
      categories: dashboard.expensesByCategory.map((item) => ({
        value: item.category.id,
        label: item.category.name,
        color: item.category.color,
      })),
      accounts: dashboard.accounts.map((account) => ({
        value: account.id,
        label: `${account.name} - ${account.bank}`,
      })),
      cards: dashboard.cards.cards.map((card) => ({
        value: card.id,
        label: `${card.name} **** ${card.lastDigits}`,
        color: card.color ?? '#6366F1',
      })),
    };
  }, [dashboard]);

  const summaryCards = useMemo(() => {
    if (!dashboard) return [];

    return [
      {
        title: 'Saldo Total',
        value: formatReais(dashboard.totalBalance),
        icon: DollarSign,
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-900/40',
      },
      {
        title: 'Receitas do Mês',
        value: formatReais(dashboard.monthlyIncome),
        icon: TrendingUp,
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/40',
      },
      {
        title: 'Despesas do Mês',
        value: formatReais(dashboard.monthlyExpenses),
        icon: TrendingDown,
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/40',
      },
      {
        title: 'Limite Cartões',
        value: formatReais(dashboard.cards.totalLimit),
        icon: CreditCard,
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-900/40',
        used: formatReais(dashboard.cards.totalUsed),
      },
    ];
  }, [dashboard]);

  const expensesChartData = useMemo(
    () =>
      (dashboard?.expensesByCategory ?? []).map((item) => ({
        name: item.category.name,
        value: Number(item.total),
        color: item.category.color,
      })),
    [dashboard],
  );

  const formatTransactionDate = (date: string) =>
    new Date(date).toLocaleDateString('pt-BR');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="card text-center py-16">
        <p className="text-gray-600">Não foi possível carregar o dashboard. Tente novamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">
          Olá, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="page-subtitle mt-1">Bem-vindo ao seu painel financeiro</p>
      </div>

      <DashboardFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
        categories={filterOptions.categories}
        accounts={filterOptions.accounts}
        cards={filterOptions.cards}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="card-hover">
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <Icon className={card.color} size={22} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{card.value}</p>
                {'used' in card && card.used && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Utilizado: {card.used}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Balanço Mensal</h3>
            <select
              className="form-control text-sm px-3 py-1.5"
              value={historyMonths}
              onChange={(e) => setHistoryMonths(Number(e.target.value))}
            >
              <option value={6}>Últimos 6 meses</option>
              <option value={12}>Último ano</option>
            </select>
          </div>
          <div className="h-64">
            {balanceHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={balanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }}
                    tickFormatter={(v) => formatReais(v)}
                  />
                  <Tooltip formatter={(value) => formatReais(Number(value ?? 0))} />
                  <Legend />
                  <Bar dataKey="income" name="Receitas" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                <p className="text-gray-400 dark:text-gray-500 text-sm">Sem dados para o período</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Despesas por Categoria</h3>
            <Link
              to="/categories"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              Ver todas
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="h-64">
            {expensesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                  >
                    {expensesChartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatReais(Number(value ?? 0))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                <p className="text-gray-400 dark:text-gray-500 text-sm">Nenhuma despesa no mês atual</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Transações Recentes</h3>
          <Link
            to="/transactions"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
          >
            Ver todas
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Data</th>
                <th className="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recentTransactions.length > 0 ? (
                dashboard.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="font-medium">{transaction.description}</td>
                    <td>{transaction.category?.name ?? '-'}</td>
                    <td>{formatTransactionDate(transaction.date)}</td>
                    <td
                      className={`text-right font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatReais(Number(transaction.amount))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <div className="text-center py-8">
                      <DollarSign size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Nenhuma transação recente</p>
                      <Link
                        to="/transactions"
                        className="text-sm text-indigo-600 hover:text-indigo-700 mt-1 inline-block"
                      >
                        Adicionar transação
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
