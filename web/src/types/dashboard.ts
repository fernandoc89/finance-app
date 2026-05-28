import type { Account } from './account';
import type { CardsSummary } from './card';
import type { CategoryStat } from './category';
import type { Transaction } from './transaction';

export interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;
  accounts: Account[];
  cards: CardsSummary;
  recentTransactions: Transaction[];
  expensesByCategory: CategoryStat[];
}

export interface BalanceHistoryItem {
  month: string;
  income: number;
  expense: number;
  balance: number;
}
