import React from 'react';
import { SidebarNavItem } from './SidebarNavItem';
import type { MenuItem } from './types';

interface SidebarNavProps {
  items: MenuItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
  isActiveRoute: (path: string) => boolean;
}

export const SidebarNav: React.FC<SidebarNavProps> = React.memo(({
  items,
  onNavigate,
  isActiveRoute
}) => {
  return (
    <nav className="flex-1 overflow-y-auto mt-3 px-3">
      <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Menu Principal
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <SidebarNavItem
            key={item.path}
            item={item}
            isActive={isActiveRoute(item.path)}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </nav>
  );
});

SidebarNav.displayName = 'SidebarNav';
