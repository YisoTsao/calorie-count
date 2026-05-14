'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  quantity: string;
  aiConfidence?: number | null;
  addedVia: string;
}

interface IngredientListProps {
  ingredients: Ingredient[];
  onRemove?: (id: string) => void;
  onUpdate?: (id: string, name: string, quantity: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  '蛋白質': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  '蔬菜': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '澱粉': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  '調味料': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  '乳製品': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '水果': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  '其他': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export function IngredientList({ ingredients, onRemove, onUpdate }: IngredientListProps) {
  const t = useTranslations('kitchen');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  const startEdit = (item: Ingredient) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditQuantity(item.quantity);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const cancelEdit = () => setEditingId(null);

  const commitEdit = (item: Ingredient) => {
    if (!editName.trim()) return; // 空名稱不儲存
    if (editName !== item.name || editQuantity !== item.quantity) {
      onUpdate?.(item.id, editName.trim(), editQuantity.trim());
    }
    setEditingId(null);
  };

  if (ingredients.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {t('noIngredients')}
      </p>
    );
  }

  // 依分類分組
  const grouped = ingredients.reduce<Record<string, Ingredient[]>>((acc, item) => {
    const cat = item.category || '其他';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
            {category}
          </h4>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              editingId === item.id ? (
                // ── 行內編輯模式（用容器 onBlur 偵測離開，避免 name→qty 時提早 commit）──
                <span
                  key={item.id}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${CATEGORY_COLORS[category] ?? CATEGORY_COLORS['其他']}`}
                  onBlur={(e) => {
                    // 若 focus 移到同一容器內的另一個 input，不要 commit
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      commitEdit(item);
                    }
                  }}
                >
                  <input
                    ref={nameRef}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(item);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className={`w-20 rounded border bg-white/80 px-1 text-sm focus:outline-none dark:bg-gray-800/80 ${!editName.trim() ? 'border-red-500' : 'border-transparent'}`}
                  />
                  <input
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(item);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    placeholder="數量"
                    className="w-16 rounded border border-transparent bg-white/80 px-1 text-xs focus:outline-none dark:bg-gray-800/80"
                  />
                </span>
              ) : (
                // ── 顯示模式 ──
                <Badge
                  key={item.id}
                  variant="secondary"
                  className={`cursor-pointer gap-1 px-3 py-1.5 text-sm ${CATEGORY_COLORS[category] ?? CATEGORY_COLORS['其他']}`}
                  onClick={() => onUpdate && startEdit(item)}
                >
                  {item.name}
                  <span className="text-xs opacity-70">{item.quantity}</span>
                  {item.aiConfidence != null && item.aiConfidence < 0.7 && (
                    <span className="text-xs">⚠️</span>
                  )}
                  {onRemove && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                      className="ml-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              )
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
