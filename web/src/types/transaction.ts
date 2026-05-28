import type { Account } from './account';
import type { Card } from './card';
import type { Category } from './category';

export type TransactionType = 'income' | 'expense' | 'transfer';
export type PaymentMethod = 'pix' | 'debit' | 'credit' | 'money' | 'ted';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  date: string;
  isRecurring: boolean;
  installments: number | null;
  currentInstallment: number | null;
  category: Category;
  account: Account | null;
  card: Card | null;
  createdAt: string;
}

export interface TransactionsListResponse {
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateTransactionPayload {
  description: string;
  amount: number;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  date: string;
  categoryId: string;
  accountId?: string;
  cardId?: string;
  isRecurring?: boolean;
  installments?: number;
}

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>;

export interface QueryTransactionsParams {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  paymentMethod?: PaymentMethod;
  accountId?: string;
  cardId?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface MonthlySummary {
  income: { total: number; count: number };
  expense: { total: number; count: number };
  balance: number;
}
