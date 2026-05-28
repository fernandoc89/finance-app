import { Menu } from 'lucide-react';
import React from 'react';

interface MobileHeaderProps {
  onMenuClick: () => void;
  logo?: React.ReactNode;
  title?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = React.memo(({
  onMenuClick,
  logo,
  title = 'FinanceApp',
}) => {
  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 lg:hidden">
      <div className="flex items-center justify-between h-12 px-4">
        {/* Botão do menu hamburguer */}
        <button
          onClick={onMenuClick}
          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        {/* Logo e título */}
        {logo || (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{title}</span>
          </div>
        )}
      </div>
    </header>
  );
});

MobileHeader.displayName = 'MobileHeader';
