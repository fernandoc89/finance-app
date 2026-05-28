import { AlertCircle, CreditCard } from 'lucide-react';
import React from 'react';

interface CreditCardPreviewProps {
  name: string;
  flag: string;
  lastDigits: string;
  limit: number;
  currentBalance: number;
  closingDay: number;
  dueDay: number;
  color: string;
  onClick?: () => void;
  className?: string;
  showActions?: boolean;
  children?: React.ReactNode;
}

export const CreditCardPreview: React.FC<CreditCardPreviewProps> = React.memo(({
  name,
  flag,
  lastDigits,
  limit,
  currentBalance,
  closingDay,
  dueDay,
  color,
  onClick,
  className = '',
  showActions = true,
  children,
}) => {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const getFlagLabel = (flagName: string) => {
    const labels: Record<string, string> = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      elo: 'Elo',
      amex: 'American Express',
    };
    return labels[flagName] || flagName;
  };

  const getUtilizationRate = () => {
    if (limit === 0) return 0;
    return (currentBalance / limit) * 100;
  };

  const getUtilizationColor = () => {
    const rate = getUtilizationRate();
    if (rate >= 80) return 'bg-red-500';
    if (rate >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const utilizationRate = getUtilizationRate();

  return (
    <div
      className={`relative cursor-pointer group ${className}`}
      onClick={onClick}
    >
      {/* Card Visual */}
      <div
        className="relative rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] min-h-[260px] flex flex-col justify-between"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        }}
      >
        {/* Ações (menu, botões) */}
        {showActions && children && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {children}
          </div>
        )}

        {/* Indicador de fatura alta */}
        {utilizationRate >= 80 && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
              <AlertCircle size={12} />
              <span>Limite próximo</span>
            </div>
          </div>
        )}

        {/* Conteúdo do Cartão */}
        <div>
          {/* Bandeira e Nome */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/70 text-xs font-medium">
                {getFlagLabel(flag)}
              </p>
              <p className="text-lg text-white font-bold mt-1">{name}</p>
            </div>
            <CreditCard size={24} className="text-white/70" />
          </div>

          {/* Número do Cartão */}
          <p className="text-white/50 text-xs mb-3 font-mono">
            **** **** **** {lastDigits}
          </p>

          {/* Saldo Atual */}
          <div className="mb-3">
            <p className="text-white/70 text-xs mb-1">Fatura Atual</p>
            <p className="text-2xl text-white font-bold">
              {formatCurrency(currentBalance)}
            </p>
          </div>

          {/* Barra de Progresso */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>Limite utilizado</span>
              <span className="font-medium">{utilizationRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${getUtilizationColor()}`}
                style={{ width: `${Math.min(utilizationRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Limite Total */}
          <p className="text-xs text-white/70">
            Limite: {formatCurrency(limit)}
          </p>
        </div>

        {/* Datas */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex justify-between text-xs text-white/70 font-medium">
            <span>Fecha: dia {closingDay}</span>
            <span>Vence: dia {dueDay}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

CreditCardPreview.displayName = 'CreditCardPreview';
