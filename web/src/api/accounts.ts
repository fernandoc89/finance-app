import type { Account, CreateAccountPayload, UpdateAccountPayload } from '../types/account';
import { api } from './client';

export async function fetchAccounts(): Promise<Account[]> {
  const { data } = await api.get<Account[]>('/accounts');
  return data;
}

export async function createAccount(payload: CreateAccountPayload): Promise<Account> {
  const { data } = await api.post<Account>('/accounts', payload);
  return data;
}

export async function updateAccount(id: string, payload: UpdateAccountPayload): Promise<Account> {
  const { data } = await api.patch<Account>(`/accounts/${id}`, payload);
  return data;
}

export async function deleteAccount(id: string): Promise<void> {
  await api.delete(`/accounts/${id}`);
}
