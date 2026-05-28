import { X } from 'lucide-react';
import React from 'react';

interface SidebarLogoProps {
  onNavigate: (path: string) => void;
  onClose: () => void;
}

export const SidebarLogo: React.FC<SidebarLogoProps> = React.memo(({ onNavigate, onClose }) => {
  return (
    <div className="flex items-center justify-between h-14 px-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
      <button
        onClick={() => onNavigate('/')}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        aria-label="Ir para Dashboard"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <span className="text-white font-bold text-base">F</span>
        </div>
        <div>
          <span className="font-bold text-base text-gray-900 dark:text-gray-100">Finance</span>
          <span className="font-bold text-base text-indigo-600">App</span>
        </div>
      </button>

      <button
        onClick={onClose}
        className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Fechar menu"
      >
        <X size={20} />
      </button>
    </div>
  );
});

SidebarLogo.displayName = 'SidebarLogo';
