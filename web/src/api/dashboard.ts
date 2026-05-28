import type { BalanceHistoryItem, DashboardData } from '../types/dashboard';
import { api } from './client';

export async function fetchDashboard(): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>('/dashboard');
  return data;
}

export async function fetchBalanceHistory(months = 6): Promise<BalanceHistoryItem[]> {
  const { data } = await api.get<BalanceHistoryItem[]>('/dashboard/balance-history', {
    params: { months },
  });
  return data;
}
