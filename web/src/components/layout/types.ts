import type { LucideIcon } from 'lucide-react';

export interface MenuItem {
  label: string;
  icon: LucideIcon;
  path: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LayoutContextType {
  isSidebarOpen: boolean;
  isScrolled: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  handleNavigate: (path: string) => void;
  currentPage?: MenuItem;
}
