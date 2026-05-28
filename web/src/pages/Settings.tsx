import { useMutation } from '@tanstack/react-query';
import { Check, Lock, Moon, Sun, User } from 'lucide-react';
import React, { useState } from 'react';
import { changePassword } from '../api/users';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { Theme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError(null);
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 4000);
    },
    onError: (error) => {
      setPasswordSuccess(false);
      setPasswordError(getApiErrorMessage(error));
    },
  });

  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    passwordMutation.mutate({ currentPassword, newPassword });
  };

  const handleThemeChange = (next: Theme) => {
    setTheme(next);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Configurações</h1>
        <p className="page-subtitle text-sm mt-1">
          Personalize sua experiência e gerencie sua conta
        </p>
      </div>

      {/* Perfil */}
      <section className="card dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center">
            <User size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Perfil</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Informações da sua conta</p>
          </div>
        </div>

        <dl className="space-y-3">
          <div>
            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Nome
            </dt>
            <dd className="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              E-mail
            </dt>
            <dd className="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{user?.email}</dd>
          </div>
        </dl>
      </section>

      {/* Aparência */}
      <section className="card dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center">
            <Sun size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Aparência</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Escolha o tema da interface</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`
              flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
              ${theme === 'light'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }
            `}
            aria-pressed={theme === 'light'}
          >
            <Sun
              size={24}
              className={theme === 'light' ? 'text-indigo-600' : 'text-gray-400'}
            />
            <span
              className={`text-sm font-medium ${theme === 'light' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}
            >
              Claro
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`
              flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
              ${theme === 'dark'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }
            `}
            aria-pressed={theme === 'dark'}
          >
            <Moon
              size={24}
              className={theme === 'dark' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}
            />
            <span
              className={`text-sm font-medium ${theme === 'dark' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}
            >
              Escuro
            </span>
          </button>
        </div>
      </section>

      {/* Senha */}
      <section className="card dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
            <Lock size={20} className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Segurança</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Altere sua senha de acesso</p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm">
            <Check size={16} />
            Senha alterada com sucesso!
          </div>
        )}

        {passwordError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Senha atual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            leftIcon={<Lock size={16} />}
          />

          <Input
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            leftIcon={<Lock size={16} />}
          />

          <Input
            label="Confirmar nova senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            leftIcon={<Lock size={16} />}
          />

          <div className="pt-2">
            <Button
              type="submit"
              isLoading={passwordMutation.isPending}
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              Alterar senha
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};
