import type { Card, CardsSummary, CreateCardPayload, UpdateCardPayload } from '../types/card';
import { api } from './client';

export async function fetchCards(): Promise<Card[]> {
  const { data } = await api.get<Card[]>('/cards');
  return data;
}

export async function fetchCardsSummary(): Promise<CardsSummary> {
  const { data } = await api.get<CardsSummary>('/cards/summary');
  return data;
}

export async function createCard(payload: CreateCardPayload): Promise<Card> {
  const { data } = await api.post<Card>('/cards', payload);
  return data;
}

export async function updateCard(id: string, payload: UpdateCardPayload): Promise<Card> {
  const { data } = await api.patch<Card>(`/cards/${id}`, payload);
  return data;
}

export async function deleteCard(id: string): Promise<void> {
  await api.delete(`/cards/${id}`);
}
