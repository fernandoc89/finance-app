import type { TransactionFormData } from '../components/modals/TransactionModal';
import type { CreateTransactionPayload, Transaction } from '../types/transaction';
import { centsToReais, reaisToCents } from './money';

export function transactionToFormData(transaction: Transaction): TransactionFormData & { id: string } {
  const date =
    typeof transaction.date === 'string'
      ? transaction.date.split('T')[0]
      : new Date(transaction.date).toISOString().split('T')[0];

  return {
    id: transaction.id,
    description: transaction.description,
    amount: reaisToCents(Number(transaction.amount)),
    type: transaction.type,
    paymentMethod: transaction.paymentMethod,
    date,
    categoryId: transaction.category?.id ?? '',
    accountId: transaction.account?.id ?? '',
    cardId: transaction.card?.id ?? '',
    isRecurring: Boolean(transaction.installments && transaction.installments > 1),
    installments: transaction.installments ?? 1,
  };
}

export function formDataToCreatePayload(form: TransactionFormData): CreateTransactionPayload {
  const payload: CreateTransactionPayload = {
    description: form.description,
    amount: centsToReais(form.amount),
    type: form.type,
    paymentMethod: form.paymentMethod,
    date: form.date,
    categoryId: form.categoryId,
    isRecurring: form.isRecurring,
  };

  if (form.paymentMethod === 'credit') {
    if (form.cardId) {
      payload.cardId = form.cardId;
    }
    if (form.isRecurring && form.installments && form.installments > 1) {
      payload.installments = form.installments;
    }
  } else if (['pix', 'debit', 'ted'].includes(form.paymentMethod) && form.accountId) {
    payload.accountId = form.accountId;
  }

  return payload;
}
