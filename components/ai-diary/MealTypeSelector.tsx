'use client';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER';

interface MealTypeSelectorProps {
  suggested: MealType;
  selected: MealType;
  onSelect: (type: MealType) => void;
}

const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER'];
const MEAL_ICONS: Record<MealType, string> = {
  BREAKFAST: '🌅',
  LUNCH: '☀️',
  DINNER: '🌙',
  SNACK: '🍪',
  OTHER: '🍽️',
};

export function MealTypeSelector({ suggested, selected, onSelect }: MealTypeSelectorProps) {
  const t = useTranslations('meals');

  return (
    <div className="flex flex-wrap gap-2">
      {MEAL_TYPES.map((type) => (
        <Button
          key={type}
          variant={selected === type ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(type)}
          className="text-xs"
        >
          {MEAL_ICONS[type]} {t(`types.${type.toLowerCase()}`)}
          {type === suggested && selected !== type && (
            <span className="ml-1 text-[10px] opacity-60">AI</span>
          )}
        </Button>
      ))}
    </div>
  );
}
