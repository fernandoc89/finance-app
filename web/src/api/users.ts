import type { User } from '../types/auth';
import { api } from './client';

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<User> {
  const { data } = await api.patch<User>('/users/me/password', payload);
  return data;
}
