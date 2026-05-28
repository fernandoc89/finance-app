import type {
  CreateTransactionPayload,
  MonthlySummary,
  QueryTransactionsParams,
  Transaction,
  TransactionsListResponse,
  UpdateTransactionPayload,
} from '../types/transaction';
import { api } from './client';

export async function fetchTransactions(
  params?: QueryTransactionsParams,
): Promise<TransactionsListResponse> {
  const { data } = await api.get<TransactionsListResponse>('/transactions', { params });
  return data;
}

export async function fetchMonthlySummary(
  year: number,
  month?: number,
): Promise<MonthlySummary> {
  const { data } = await api.get<MonthlySummary>('/transactions/summary', {
    params: { year, month },
  });
  return data;
}

export async function createTransaction(
  payload: CreateTransactionPayload,
): Promise<Transaction> {
  const { data } = await api.post<Transaction>('/transactions', payload);
  return data;
}

export async function updateTransaction(
  id: string,
  payload: UpdateTransactionPayload,
): Promise<Transaction> {
  const { data } = await api.patch<Transaction>(`/transactions/${id}`, payload);
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await api.delete(`/transactions/${id}`);
}
