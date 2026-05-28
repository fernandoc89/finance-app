import {
  ArrowDownUp,
  CreditCard,
  Landmark,
  LayoutDashboard,
  Tags,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Footer } from './Footer';
import { Header } from './Header';
import { NotificationBell } from './NotificationBell';
import { Sidebar } from './Sidebar';
import type { MenuItem } from './types';

const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
    description: 'Visão geral',
  },
  {
    label: 'Transações',
    icon: ArrowDownUp,
    path: '/transactions',
    description: 'Receitas e despesas',
  },
  {
    label: 'Contas',
    icon: Landmark,
    path: '/accounts',
    description: 'Contas bancárias',
  },
  {
    label: 'Cartões',
    icon: CreditCard,
    path: '/cards',
    description: 'Cartões de crédito',
  },
  {
    label: 'Categorias',
    icon: Tags,
    path: '/categories',
    description: 'Organize seus gastos',
  },
];

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const previousPathname = useRef(location.pathname);

  const isActiveRoute = useCallback((path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
    setIsSidebarOpen(false);
  }, [navigate]);

  // Fechar sidebar ao mudar de rota
  useEffect(() => {
    if (previousPathname.current !== location.pathname) {
      previousPathname.current = location.pathname;
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Detectar scroll com performance otimizada
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = useCallback(() => {
    signOut();
    navigate('/login');
  }, [signOut, navigate]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Página atual para mostrar no header desktop
  const currentPage = MENU_ITEMS.find(item => isActiveRoute(item.path));
  const isSettingsPage = location.pathname === '/settings';
  const pageTitle = isSettingsPage ? 'Configurações' : currentPage?.label;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Overlay para mobile quando sidebar está aberta */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        menuItems={MENU_ITEMS}
        isActiveRoute={isActiveRoute}
        onNavigate={handleNavigate}
        onClose={closeSidebar}
        onLogout={handleLogout}
        userName={user?.name}
        userEmail={user?.email}
      />

      {/* Conteúdo Principal */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header (Desktop + Mobile) */}
        <Header
          isScrolled={isScrolled}
          onMenuClick={toggleSidebar}
          notificationBell={<NotificationBell />}
          desktopContent={
            pageTitle && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {pageTitle}
                </h2>
              </div>
            )
          }
          title="FinanceApp"
        />

        {/* Conteúdo da Página */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 animate-fade-in">
          {children || <Outlet />}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};
