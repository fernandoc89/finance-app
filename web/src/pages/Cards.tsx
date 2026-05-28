import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Edit3, Loader2, MoreVertical, Plus, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { createCard, deleteCard, fetchCards, updateCard } from '../api/cards';
import { queryKeys } from '../api/queryKeys';
import { CardModal, type CardFormData } from '../components/modals';
import { CreditCardPreview } from '../components/ui/CreditCardPreview';
import type { Card } from '../types/card';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { centsToReais, formatReais, reaisToCents } from '../utils/money';

function cardToFormData(card: Card): CardFormData {
  return {
    name: card.name,
    flag: card.flag,
    lastDigits: card.lastDigits,
    limit: reaisToCents(Number(card.limit)),
    closingDay: card.closingDay,
    dueDay: card.dueDay,
    color: card.color ?? '#6C63FF',
  };
}

function formDataToPayload(data: CardFormData) {
  return {
    name: data.name,
    flag: data.flag as Card['flag'],
    lastDigits: data.lastDigits,
    limit: centsToReais(data.limit),
    closingDay: data.closingDay,
    dueDay: data.dueDay,
    color: data.color,
  };
}

export const Cards: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardFormData | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: cards = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.cards,
    queryFn: fetchCards,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.cards });
    void queryClient.invalidateQueries({ queryKey: queryKeys.cardsSummary });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  };

  const createMutation = useMutation({
    mutationFn: createCard,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CardFormData }) =>
      updateCard(id, formDataToPayload(data)),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCard,
    onSuccess: () => {
      invalidate();
      setDeleteConfirm(null);
    },
    onError: (error) => alert(getApiErrorMessage(error)),
  });

  const totals = useMemo(() => {
    const totalLimit = cards.reduce((sum, card) => sum + Number(card.limit), 0);
    const totalUsed = cards.reduce((sum, card) => sum + Number(card.currentBalance), 0);
    return {
      totalLimit,
      totalUsed,
      available: totalLimit - totalUsed,
      utilizationRate: totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0,
    };
  }, [cards]);

  const handleSave = async (data: CardFormData) => {
    setSaveError(null);
    try {
      if (editingCardId) {
        await updateMutation.mutateAsync({ id: editingCardId, data });
      } else {
        await createMutation.mutateAsync(formDataToPayload(data));
      }
      setEditingCard(null);
      setEditingCardId(null);
    } catch (error) {
      setSaveError(getApiErrorMessage(error));
      throw error;
    }
  };

  const handleEdit = (card: Card) => {
    setEditingCard(cardToFormData(card));
    setEditingCardId(card.id);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleOpenNew = () => {
    setEditingCard(null);
    setEditingCardId(null);
    setSaveError(null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card text-center py-16">
        <p className="text-gray-600">Não foi possível carregar os cartões.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Cartões</h1>
          <p className="page-subtitle mt-1">{cards.length} cartões cadastrados</p>
        </div>
        <button onClick={handleOpenNew} className="btn-primary">
          <Plus size={20} />
          Novo Cartão
        </button>
      </div>

      {cards.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CreditCard size={24} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Resumo dos Cartões</p>
              <p className="text-3xl text-white font-bold">
                {formatReais(totals.totalUsed)}
                <span className="text-lg font-normal text-white/70">
                  {' '}
                  de {formatReais(totals.totalLimit)}
                </span>
              </p>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/70">Utilização Total</span>
              <span className="font-medium">{totals.utilizationRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${Math.min(totals.utilizationRate, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-white/70 text-xs">Limite Total</p>
              <p className="text-lg text-white font-semibold">{formatReais(totals.totalLimit)}</p>
            </div>
            <div>
              <p className="text-white/70 text-xs">Utilizado</p>
              <p className="text-lg text-red-300 font-semibold">{formatReais(totals.totalUsed)}</p>
            </div>
            <div>
              <p className="text-white/70 text-xs">Disponível</p>
              <p className="text-lg text-green-300 font-semibold">{formatReais(totals.available)}</p>
            </div>
          </div>
        </div>
      )}

      {cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <CreditCardPreview
              key={card.id}
              name={card.name}
              flag={card.flag}
              lastDigits={card.lastDigits}
              limit={reaisToCents(Number(card.limit))}
              currentBalance={reaisToCents(Number(card.currentBalance))}
              closingDay={card.closingDay}
              dueDay={card.dueDay}
              color={card.color ?? '#6C63FF'}
              onClick={() => handleEdit(card)}
            >
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === card.id ? null : card.id);
                  }}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  <MoreVertical size={16} />
                </button>

                {activeMenu === card.id && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(null);
                      }}
                    />
                    <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(card);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit3 size={14} />
                        Editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(card.id);
                          setActiveMenu(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Excluir
                      </button>
                    </div>
                  </>
                )}
              </div>
            </CreditCardPreview>
          ))}

          <button
            onClick={handleOpenNew}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all min-h-[260px] group"
          >
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
              <Plus size={28} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <p className="text-gray-500 font-medium group-hover:text-indigo-600 transition-colors">
              Adicionar Cartão
            </p>
          </button>
        </div>
      ) : (
        <div className="card text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum cartão cadastrado</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Adicione seus cartões de crédito para controlar gastos e faturas.
          </p>
          <button onClick={handleOpenNew} className="btn-primary">
            <Plus size={20} />
            Adicionar Primeiro Cartão
          </button>
        </div>
      )}

      <CardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(null);
          setEditingCardId(null);
          setSaveError(null);
        }}
        onSave={handleSave}
        initialData={editingCard}
      />
      {saveError && (
        <p className="text-sm text-red-600 text-center">{saveError}</p>
      )}

      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Excluir Cartão</h3>
            <p className="text-sm text-gray-500 mb-6">
              Cartões com fatura em aberto não podem ser excluídos.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-secondary">
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                className="flex-1 btn-danger"
                disabled={deleteMutation.isPending}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
