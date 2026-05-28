import { Calendar, CreditCard } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CardFormData) => void;
  initialData?: CardFormData | null;
}

export interface CardFormData {
  name: string;
  flag: string;
  lastDigits: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: string;
}

const initialFormData: CardFormData = {
  name: '',
  flag: 'visa',
  lastDigits: '',
  limit: 0,
  closingDay: 1,
  dueDay: 10,
  color: '#6C63FF',
};

const flagOptions = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'elo', label: 'Elo' },
  { value: 'amex', label: 'American Express' },
];

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<CardFormData>(initialFormData);
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

  const handleChange = (field: keyof CardFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do cartão é obrigatório';
    }
    if (!formData.lastDigits.trim() || formData.lastDigits.length !== 4) {
      newErrors.lastDigits = 'Digite os 4 últimos dígitos';
    }
    if (formData.limit <= 0) {
      newErrors.limit = 'Limite deve ser maior que zero';
    }
    if (formData.closingDay < 1 || formData.closingDay > 31) {
      newErrors.closingDay = 'Dia inválido (1-31)';
    }
    if (formData.dueDay < 1 || formData.dueDay > 31) {
      newErrors.dueDay = 'Dia inválido (1-31)';
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Cartão' : 'Novo Cartão'}
      description="Adicione um cartão de crédito para controlar seus gastos"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initialData ? 'Salvar Alterações' : 'Adicionar Cartão'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Preview do Cartão */}
        <div
          className="rounded-xl p-6 text-white"
          style={{
            background: `linear-gradient(135deg, ${formData.color}, ${formData.color}dd)`
          }}
        >
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-white/70 text-xs">Cartão</p>
              <p className="text-lg font-semibold">
                {formData.name || 'Nome do Cartão'}
              </p>
            </div>
            <CreditCard size={24} className="text-white/70" />
          </div>
          <div>
            <p className="text-white/70 text-xs">Limite</p>
            <p className="text-lg font-semibold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(formData.limit / 100)}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex justify-between text-xs text-white/70">
              <span>**** {formData.lastDigits || '0000'}</span>
              <span>{formData.flag.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Nome do Cartão */}
        <Input
          label="Nome do Cartão"
          placeholder="Ex: Nubank, Inter"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
        />

        {/* Bandeira */}
        <Select
          label="Bandeira"
          options={flagOptions}
          value={formData.flag}
          onChange={(e) => handleChange('flag', e.target.value)}
        />

        {/* Últimos dígitos */}
        <Input
          label="Últimos 4 dígitos"
          placeholder="1234"
          value={formData.lastDigits}
          onChange={(e) => handleChange('lastDigits', e.target.value.replace(/\D/g, '').slice(0, 4))}
          error={errors.lastDigits}
          maxLength={4}
          leftIcon={<CreditCard size={18} />}
        />

        {/* Limite */}
        <CurrencyInput
          label="Limite do Cartão"
          value={formData.limit}
          onChange={(value) => handleChange('limit', value)}
          error={errors.limit}
        />

        {/* Dias de Fechamento e Vencimento */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Dia de Fechamento"
            type="number"
            value={formData.closingDay}
            onChange={(e) => handleChange('closingDay', parseInt(e.target.value))}
            error={errors.closingDay}
            min={1}
            max={31}
            leftIcon={<Calendar size={18} />}
          />
          <Input
            label="Dia de Vencimento"
            type="number"
            value={formData.dueDay}
            onChange={(e) => handleChange('dueDay', parseInt(e.target.value))}
            error={errors.dueDay}
            min={1}
            max={31}
            leftIcon={<Calendar size={18} />}
          />
        </div>

        {/* Cor */}
        <ColorPicker
          value={formData.color}
          onChange={(color) => handleChange('color', color)}
          label="Cor do Cartão"
        />
      </form>
    </Modal>
  );
};
