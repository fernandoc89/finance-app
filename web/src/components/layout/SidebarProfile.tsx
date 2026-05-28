import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface SidebarProfileProps {
  userName?: string;
  userEmail?: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const SidebarProfile: React.FC<SidebarProfileProps> = React.memo(({
  userName = 'Usuário',
  userEmail = 'usuario@email.com',
  onNavigate,
  onLogout
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleProfile = useCallback(() => {
    setIsProfileOpen(prev => !prev);
  }, []);

  const closeProfile = useCallback(() => {
    setIsProfileOpen(false);
  }, []);

  const handleNavigate = useCallback((path: string) => {
    closeProfile();
    onNavigate(path);
  }, [closeProfile, onNavigate]);

  const handleLogout = useCallback(() => {
    closeProfile();
    onLogout();
  }, [closeProfile, onLogout]);

  return (
    <div className="shrink-0 p-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="relative">
        <button
          onClick={toggleProfile}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          aria-expanded={isProfileOpen}
          aria-haspopup="true"
        >
          <div className="relative shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center ring-2 ring-white">
              <User size={16} className="text-indigo-600" />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-white" />
          </div>

          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {userEmail}
            </p>
          </div>

          <ChevronDown
            size={16}
            className={`
              text-gray-400 transition-transform duration-200
              ${isProfileOpen ? 'rotate-180' : ''}
            `}
          />
        </button>

        {/* Dropdown do perfil */}
        {isProfileOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={closeProfile}
              aria-hidden="true"
            />
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>

              <button
                onClick={() => handleNavigate('/settings')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings size={16} />
                Configurações
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Sair da conta
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

SidebarProfile.displayName = 'SidebarProfile';
