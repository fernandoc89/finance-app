import React from 'react';

interface DesktopHeaderProps {
  isScrolled: boolean;
  children?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = React.memo(({
  isScrolled,
  children,
  trailing,
}) => {
  return (
    <header className={`
      hidden lg:flex sticky top-0 z-10 items-center justify-between h-12 px-6
      transition-shadow duration-200
      ${isScrolled ? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-100 dark:border-gray-700' : 'bg-transparent'}
    `}>
      <div className="flex items-center gap-3">
        {children}
      </div>
      {trailing && <div className="flex items-center">{trailing}</div>}
    </header>
  );
});

DesktopHeader.displayName = 'DesktopHeader';
