import React from 'react';
import { DesktopHeader } from './DesktopHeader';
import { MobileHeader } from './MobileHeader';

interface HeaderProps {
  isScrolled: boolean;
  onMenuClick: () => void;
  desktopContent?: React.ReactNode;
  mobileLogo?: React.ReactNode;
  notificationBell?: React.ReactNode;
  title?: string;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  isScrolled,
  onMenuClick,
  desktopContent,
  mobileLogo,
  notificationBell,
  title,
}) => {
  return (
    <>
      {/* Header Desktop */}
      <DesktopHeader
        isScrolled={isScrolled}
        trailing={notificationBell}
      >
        {desktopContent}
      </DesktopHeader>

      {/* Header Mobile */}
      <MobileHeader
        onMenuClick={onMenuClick}
        logo={mobileLogo}
        title={title}
      />
    </>
  );
});

Header.displayName = 'Header';
