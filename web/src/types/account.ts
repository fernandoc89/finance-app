export type AccountType = 'checking' | 'savings' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  bank: string;
  color: string | null;
  createdAt: string;
}

export interface CreateAccountPayload {
  name: string;
  type: AccountType;
  balance: number;
  bank: string;
  color?: string;
}

export type UpdateAccountPayload = Partial<CreateAccountPayload>;
