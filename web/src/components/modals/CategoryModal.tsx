import { Tag } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { CategoryIcon } from '../ui/CategoryIcon';
import { ColorPicker } from '../ui/ColorPicker';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => void;
  initialData?: CategoryFormData | null;
}

export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
}

const initialFormData: CategoryFormData = {
  name: '',
  icon: 'tag',
  color: '#6C63FF',
  isActive: true,
};

// Emojis populares para categorias
const POPULAR_ICONS = [
  '🍕', '🚗', '🏠', '💊', '📚', '🎮', '🛒', '📱',
  '✈️', '🎬', '💼', '💰', '🎵', '🏋️', '🐱', '☕',
  '🍺', '👕', '💄', '🎁', '🔧', '🌍', '📈', '🎓',
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
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

  const handleChange = (field: keyof CategoryFormData, value: string | number | boolean) => {
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
      newErrors.name = 'Nome da categoria é obrigatório';
    }
    if (!formData.icon) {
      newErrors.icon = 'Selecione um ícone';
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
      title={initialData ? 'Editar Categoria' : 'Nova Categoria'}
      description="Crie categorias para organizar suas transações"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initialData ? 'Salvar Alterações' : 'Criar Categoria'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Preview da Categoria */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: formData.color + '20' }}
          >
            {formData.icon ? (
              <CategoryIcon icon={formData.icon} size={28} color={formData.color} />
            ) : (
              <Tag size={24} className="text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {formData.name || 'Nome da Categoria'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formData.isActive ? 'Ativa' : 'Inativa'}
            </p>
          </div>
        </div>

        {/* Nome */}
        <Input
          label="Nome da Categoria"
          placeholder="Ex: Alimentação, Transporte"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          leftIcon={<Tag size={18} />}
        />

        {/* Seletor de Ícones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ícone
          </label>
          <div className="grid grid-cols-8 gap-2">
            {POPULAR_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => handleChange('icon', icon)}
                className={`
                  w-10 h-10 flex items-center justify-center rounded-lg text-lg
                  transition-all duration-200 hover:scale-110
                  ${formData.icon === icon
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500 scale-110'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
                aria-label={`Ícone ${icon}`}
              >
                {icon}
              </button>
            ))}
          </div>
          {errors.icon && (
            <p className="mt-1 text-xs text-red-600">{errors.icon}</p>
          )}
        </div>

        {/* Cor */}
        <ColorPicker
          value={formData.color}
          onChange={(color) => handleChange('color', color)}
          label="Cor da Categoria"
        />

        {/* Status */}
        <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoria Ativa</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Categorias inativas não aparecem nas listas
            </p>
          </div>
        </label>
      </form>
    </Modal>
  );
};
