export const queryKeys = {
  accounts: ['accounts'] as const,
  cards: ['cards'] as const,
  cardsSummary: ['cards', 'summary'] as const,
  categories: ['categories'] as const,
  categoryStats: ['categories', 'stats'] as const,
  transactions: (params?: object) => ['transactions', params] as const,
  transactionsSummary: (year: number, month?: number) =>
    ['transactions', 'summary', year, month] as const,
  dashboard: ['dashboard'] as const,
  balanceHistory: (months: number) => ['dashboard', 'balance-history', months] as const,
};
