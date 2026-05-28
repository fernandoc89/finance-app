import React from 'react';
import { SidebarLogo } from './SidebarLogo';
import { SidebarNav } from './SidebarNav';
import { SidebarProfile } from './SidebarProfile';
import type { MenuItem } from './types';

interface SidebarProps {
  isOpen: boolean;
  menuItems: MenuItem[];
  isActiveRoute: (path: string) => boolean;
  onNavigate: (path: string) => void;
  onClose: () => void;
  onLogout: () => void;
  userName?: string;
  userEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({
  isOpen,
  menuItems,
  isActiveRoute,
  onNavigate,
  onClose,
  onLogout,
  userName,
  userEmail,
}) => {
  return (
    <aside
      className={`
        fixed top-0 left-0 z-30 h-screen w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      aria-label="Navegação principal"
    >
      <SidebarLogo onNavigate={onNavigate} onClose={onClose} />
      <SidebarNav
        items={menuItems}
        currentPath={''}
        onNavigate={onNavigate}
        isActiveRoute={isActiveRoute}
      />
      <SidebarProfile
        userName={userName}
        userEmail={userEmail}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
