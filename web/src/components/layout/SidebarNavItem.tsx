import React from 'react';
import type { MenuItem } from './types';

interface SidebarNavItemProps {
  item: MenuItem;
  isActive: boolean;
  onNavigate: (path: string) => void;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = React.memo(({
  item,
  isActive,
  onNavigate
}) => {
  const Icon = item.icon;

  return (
    <li>
      <button
        onClick={() => onNavigate(item.path)}
        className={`
          w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group
          ${isActive
            ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
          }
        `}
        aria-current={isActive ? 'page' : undefined}
        title={item.description}
      >
        <Icon
          size={20}
          className={`
            transition-transform duration-200 group-hover:scale-110
            ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}
          `}
        />
        <span className="flex-1 text-left">{item.label}</span>
        {isActive && (
          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
        )}
      </button>
    </li>
  );
});

SidebarNavItem.displayName = 'SidebarNavItem';
