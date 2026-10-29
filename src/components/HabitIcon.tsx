import React from 'react';
import * as LucideIcons from 'lucide-react';

interface HabitIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export const AVAILABLE_ICONS = [
  'BookOpen',
  'Dumbbell',
  'Droplets',
  'Brain',
  'Sun',
  'Moon',
  'Flame',
  'Sparkles',
  'GraduationCap',
  'CheckSquare',
  'Heart',
  'Smile',
  'Coffee',
  'Music',
  'Code',
  'PenTool',
  'Target',
  'Zap',
  'Apple',
  'Bed',
  'Compass',
  'Footprints',
  'Leaf',
  'Timer',
];

export const AVAILABLE_COLORS = [
  '#8B5CF6', // Primary violet
  '#A78BFA', // Light violet
  '#22D3EE', // Cyan
  '#34D399', // Success green
  '#FBBF24', // Amber
  '#F87171', // Red
  '#F472B6', // Pink
  '#60A5FA', // Blue
  '#38BDF8', // Sky
  '#A3E635', // Lime
];

export const HabitIcon: React.FC<HabitIconProps> = ({ name, className = 'w-5 h-5', style }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Sparkles;
  return <IconComponent className={className} style={style} />;
};
