export type CardFlag = 'visa' | 'mastercard' | 'elo' | 'amex';

export interface Card {
  id: string;
  name: string;
  flag: CardFlag;
  lastDigits: string;
  limit: number;
  currentBalance: number;
  closingDay: number;
  dueDay: number;
  color: string | null;
  createdAt: string;
}

export interface CardsSummary {
  cards: Card[];
  totalLimit: number;
  totalUsed: number;
  availableCredit: number;
  utilizationRate: number;
}

export interface CreateCardPayload {
  name: string;
  flag: CardFlag;
  lastDigits: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color?: string;
}

export type UpdateCardPayload = Partial<CreateCardPayload>;
