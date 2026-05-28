import { Bell } from 'lucide-react';
import React from 'react';

interface NotificationBellProps {
  hasNotifications?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = React.memo(({
  hasNotifications = true,
  onClick,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 ${className}`}
      aria-label={`Notificações${hasNotifications ? ' - Você tem notificações não lidas' : ''}`}
    >
      <Bell size={18} />
      {hasNotifications && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
      )}
    </button>
  );
});

NotificationBell.displayName = 'NotificationBell';
