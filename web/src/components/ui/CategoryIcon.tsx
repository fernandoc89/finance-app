import {
  Briefcase,
  Car,
  Film,
  GraduationCap,
  HeartPulse,
  Home,
  Laptop,
  MoreHorizontal,
  Repeat,
  ShoppingCart,
  Tag,
  TrendingUp,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import React from 'react';

/** Mapeamento dos ícones padrão do backend (Material Design names) para Lucide */
const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  restaurant: Utensils,
  'directions-car': Car,
  home: Home,
  'local-hospital': HeartPulse,
  school: GraduationCap,
  movie: Film,
  'shopping-cart': ShoppingCart,
  subscriptions: Repeat,
  work: Briefcase,
  laptop: Laptop,
  'trending-up': TrendingUp,
  'more-horiz': MoreHorizontal,
  tag: Tag,
};

function isEmojiIcon(icon: string): boolean {
  if (CATEGORY_ICON_MAP[icon]) {
    return false;
  }
  try {
    return /\p{Extended_Pictographic}/u.test(icon);
  } catch {
    return icon.length <= 2;
  }
}

interface CategoryIconProps {
  icon: string;
  size?: number;
  color?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = React.memo(({
  icon,
  size = 20,
  color,
  className = '',
}) => {
  if (isEmojiIcon(icon)) {
    return (
      <span
        className={className}
        style={{ fontSize: size, lineHeight: 1 }}
        role="img"
        aria-hidden
      >
        {icon}
      </span>
    );
  }

  const IconComponent = CATEGORY_ICON_MAP[icon] ?? Tag;

  return (
    <IconComponent
      size={size}
      className={className}
      style={color ? { color } : undefined}
      aria-hidden
    />
  );
});

CategoryIcon.displayName = 'CategoryIcon';
