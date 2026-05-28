import {
  Calendar
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface SelectOption {
  value: string;
  label: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TransactionFormData) => void;
  initialData?: TransactionFormData | null;
  categories?: SelectOption[];
  accounts?: SelectOption[];
  cards?: SelectOption[];
}

export interface TransactionFormData {
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  paymentMethod: 'pix' | 'debit' | 'credit' | 'money' | 'ted';
  date: string;
  categoryId: string;
  accountId?: string;
  cardId?: string;
  isRecurring: boolean;
  installments?: number;
  notes?: string;
}

const initialFormData: TransactionFormData = {
  description: '',
  amount: 0,
  type: 'expense',
  paymentMethod: 'pix',
  date: new Date().toISOString().split('T')[0],
  categoryId: '',
  accountId: '',
  cardId: '',
  isRecurring: false,
  installments: 1,
  notes: '',
};

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories = [],
  accounts = [],
  cards = [],
}) => {
  const [formData, setFormData] = useState<TransactionFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setTimeout(() => {
        setFormData(initialData);
      }, 0);
    } else {
      setTimeout(() => {
        setFormData(initialFormData);
      }, 0);
    }
    setTimeout(() => {
      setErrors({});
    }, 0);
  }, [initialData, isOpen]);

  const handleChange = (field: keyof TransactionFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    if (formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Categoria é obrigatória';
    }
    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    // Validar conta/cartão conforme método de pagamento
    if (formData.paymentMethod === 'credit' && !formData.cardId) {
      newErrors.cardId = 'Cartão é obrigatório para pagamentos com crédito';
    }
    if (['pix', 'debit', 'ted'].includes(formData.paymentMethod) && !formData.accountId) {
      newErrors.accountId = 'Conta é obrigatória para este método de pagamento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await Promise.resolve(onSave(formData));
      onClose();
    } catch {
      // Erro tratado pelo componente pai
    }
  };

  const typeOptions = [
    { value: 'income', label: 'Receita' },
    { value: 'expense', label: 'Despesa' },
    { value: 'transfer', label: 'Transferência' },
  ];

  const paymentMethodOptions = [
    { value: 'pix', label: 'PIX' },
    { value: 'debit', label: 'Débito' },
    { value: 'credit', label: 'Crédito' },
    { value: 'money', label: 'Dinheiro' },
    { value: 'ted', label: 'TED' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Transação' : 'Nova Transação'}
      description="Registre uma receita, despesa ou transferência"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initialData ? 'Salvar Alterações' : 'Criar Transação'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo */}
        <div>
          <label className="form-label mb-2">
            Tipo de Transação
          </label>
          <div className="grid grid-cols-3 gap-2">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('type', option.value)}
                className={`
                  px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${formData.type === option.value
                    ? option.value === 'income'
                      ? 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-2 border-green-500'
                      : option.value === 'expense'
                        ? 'bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-2 border-red-500'
                        : 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-2 border-blue-500'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Descrição */}
        <Input
          label="Descrição"
          placeholder="Ex: Supermercado"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={errors.description}
        />

        {/* Valor e Data */}
        <div className="grid grid-cols-2 gap-4">
          <CurrencyInput
            label="Valor"
            value={formData.amount}
            onChange={(value) => handleChange('amount', value)}
            error={errors.amount}
          />
          <Input
            label="Data"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            error={errors.date}
            leftIcon={<Calendar size={18} />}
          />
        </div>

        {/* Categoria */}
        <Select
          label="Categoria"
          options={categories}
          value={formData.categoryId}
          onChange={(e) => handleChange('categoryId', e.target.value)}
          error={errors.categoryId}
          placeholder="Selecione uma categoria"
        />

        {/* Método de Pagamento */}
        <Select
          label="Método de Pagamento"
          options={paymentMethodOptions}
          value={formData.paymentMethod}
          onChange={(e) => handleChange('paymentMethod', e.target.value)}
        />

        {/* Conta (se não for crédito) */}
        {formData.paymentMethod !== 'credit' && (
          <Select
            label="Conta"
            options={accounts}
            value={formData.accountId}
            onChange={(e) => handleChange('accountId', e.target.value)}
            error={errors.accountId}
            placeholder="Selecione uma conta"
          />
        )}

        {/* Cartão (se for crédito) */}
        {formData.paymentMethod === 'credit' && (
          <Select
            label="Cartão de Crédito"
            options={cards}
            value={formData.cardId}
            onChange={(e) => handleChange('cardId', e.target.value)}
            error={errors.cardId}
            placeholder="Selecione um cartão"
          />
        )}

        {/* Parcelamento (apenas crédito) */}
        {formData.paymentMethod === 'credit' && (
          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => handleChange('isRecurring', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Parcelar compra</span>
            </label>

            {formData.isRecurring && (
              <Input
                type="number"
                label="Número de Parcelas"
                value={formData.installments}
                onChange={(e) => handleChange('installments', parseInt(e.target.value))}
                min={2}
                max={48}
              />
            )}
          </div>
        )}

        {/* Observações */}
        <div>
          <label className="form-label">
            Observações (opcional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={2}
            className="form-control w-full py-2.5 px-3 resize-none"
            placeholder="Adicione uma observação..."
          />
        </div>
      </form>
    </Modal>
  );
};
