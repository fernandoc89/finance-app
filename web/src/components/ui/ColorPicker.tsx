import React from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
  label?: string;
}

const DEFAULT_COLORS = [
  '#6C63FF', '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
  '#F7DC6F', '#82E0AA', '#85C1E9', '#BB8FCE',
  '#F0B27A', '#E74C3C', '#3498DB', '#2ECC71',
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFFFFF', '#000000',
  '#FFA500', '#800080', '#008000', '#000080',
  '#800000', '#008080', '#808000', '#808080',
  '#FFC0CB', '#90EE90', '#D3D3D3', '#D3D3D3',
  '#D3D3D3', '#D3D3D3', '#D3D3D3', '#D3D3D3',
  '#D3D3D3', '#D3D3D3', '#D3D3D3', '#D3D3D3',
];

export const ColorPicker: React.FC<ColorPickerProps> = React.memo(({
  value,
  onChange,
  colors = DEFAULT_COLORS,
  label = 'Cor',
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`
              w-8 h-8 rounded-full transition-all duration-200
              hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${value === color
                ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                : 'hover:ring-2 hover:ring-offset-2 hover:ring-gray-300'
              }
            `}
            style={{ backgroundColor: color }}
            aria-label={`Cor ${color}`}
            aria-pressed={value === color}
          />
        ))}
      </div>
    </div>
  );
});

ColorPicker.displayName = 'ColorPicker';
