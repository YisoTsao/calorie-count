'use client';

import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Food {
  id: string;
  name: string;
  nameEn?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  source: 'SYSTEM' | 'USER' | 'API';
  category: {
    id: string;
    name: string;
    nameEn?: string;
    icon?: string;
  };
  brand?: {
    id: string;
    name: string;
  };
  favoriteInfo?: {
    useCount: number;
    lastUsed: Date;
  };
  _count?: {
    favorites: number;
  };
}

interface Category {
  id: string;
  name: string;
  nameEn?: string;
  icon?: string;
  _count: {
    foods: number;
  };
}

interface FoodSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealType?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER';
  onSelectFood: (food: Food, servings: number) => void;
  onSelectFoodAndEdit?: (food: Food, servings: number) => void;
}

export function FoodSearchDialog({
  open,
  onOpenChange,
  mealType,
  onSelectFood,
  onSelectFoodAndEdit,
}: FoodSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingFavorites, setIsFetchingFavorites] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState(1);
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>('search');

  // Fetch categories on mount
  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchFavorites();
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!open || activeTab !== 'search') return;

    const timer = setTimeout(() => {
      searchFoods();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, open, activeTab]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/foods/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchFavorites = async () => {
    setIsFetchingFavorites(true);
    try {
      const response = await fetch('/api/foods/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavoriteFoods(data.favorites);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setIsFetchingFavorites(false);
    }
  };

  const searchFoods = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      params.append('limit', '20');

      const response = await fetch(`/api/foods/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setFoods(data.foods);
      }
    } catch (error) {
      console.error('Failed to search foods:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setServings(1);
  };

  const handleConfirm = () => {
    if (selectedFood) {
      onSelectFood(selectedFood, servings);
      // 重置選擇但保持 dialog 開啟,讓使用者可以繼續新增
      setSelectedFood(null);
      setServings(1);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedFood(null);
    setServings(1);
    setActiveTab('search');
    onOpenChange(false);
  };

  const renderFoodItem = (food: Food, isFavorite = false) => {
    const isSelected = selectedFood?.id === food.id;

    return (
      <div
        key={food.id}
        className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent sm:p-4 ${
          isSelected ? 'border-primary bg-accent' : 'border-border'
        }`}
        onClick={() => handleSelectFood(food)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {food.category.icon && (
                <span className="flex-shrink-0 text-base sm:text-lg">{food.category.icon}</span>
              )}
              <h4 className="truncate text-sm font-medium sm:text-base">{food.name}</h4>
              {food.nameEn && (
                <span className="hidden text-xs text-muted-foreground sm:inline sm:text-sm">
                  {food.nameEn}
                </span>
              )}
            </div>

            {food.brand && (
              <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">
                {food.brand.name}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
              <span className="font-medium text-primary">{food.calories} kcal</span>
              <span className="text-muted-foreground">蛋白質 {food.protein}g</span>
              <span className="text-muted-foreground">碳水 {food.carbs}g</span>
              <span className="text-muted-foreground">脂肪 {food.fat}g</span>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              每份 {food.servingSize} {food.servingUnit}
            </p>

            {isFavorite && food.favoriteInfo && (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  使用 {food.favoriteInfo.useCount} 次
                </Badge>
              </div>
            )}
          </div>

          {food.source === 'USER' && (
            <Badge variant="outline" className="ml-2 flex-shrink-0 text-xs">
              自訂
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex h-auto max-h-[90vh] w-[95vw] max-w-3xl flex-col gap-0 p-0 sm:w-full">
        <DialogHeader className="flex-shrink-0 px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
          <DialogTitle className="flex items-center gap-2">
            搜尋食物
            {mealType && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-sm font-normal text-muted-foreground">
                {
                  (
                    {
                      BREAKFAST: '早餐',
                      LUNCH: '午餐',
                      DINNER: '晚餐',
                      SNACK: '點心',
                      OTHER: '其他',
                    } as Record<string, string>
                  )[mealType]
                }
              </span>
            )}
          </DialogTitle>
          <DialogDescription>搜尋並選擇要加入的食物,或從常用食物中快速選擇</DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v: string) => setActiveTab(v as 'search' | 'favorites')}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-shrink-0 px-4 sm:px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">搜尋食物</TabsTrigger>
              <TabsTrigger value="favorites">常用食物</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="search"
            className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden px-4 sm:px-6"
          >
            {/* Search Input */}
            <div className="relative mb-3 flex-shrink-0 sm:mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜尋食物名稱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="mb-3 flex-shrink-0 sm:mb-4">
              <ScrollArea className="w-full">
                <div className="flex w-[69vw] gap-2 overflow-x-auto pb-2">
                  <Button
                    variant={selectedCategory === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('')}
                  >
                    全部
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.icon} {category.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Search Results */}
            <ScrollArea className="-mr-2 flex-1 pr-2 sm:-mr-4 sm:pr-4">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : foods.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground sm:text-base">
                  {searchQuery || selectedCategory ? '找不到符合的食物' : '請輸入關鍵字或選擇分類'}
                </div>
              ) : (
                <div className="h-[424px] space-y-2 pb-2">
                  {foods.map((food) => renderFoodItem(food))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent
            value="favorites"
            className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden px-4 sm:px-6"
          >
            <ScrollArea className="-mr-2 flex-1 pr-2 sm:-mr-4 sm:pr-4">
              {isFetchingFavorites ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : favoriteFoods.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground sm:text-base">
                  尚無常用食物,多次使用的食物會自動加入常用清單
                </div>
              ) : (
                <div className="h-[424px] space-y-2 pb-2">
                  {favoriteFoods.map((food) => renderFoodItem(food, true))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Selected Food Detail & Servings */}
        {selectedFood && (
          <div className="flex-shrink-0 border-t bg-muted/50 px-4 py-4 sm:px-6 sm:py-6">
            <div className="mb-3 flex items-start justify-between sm:mb-4">
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-medium">已選擇: {selectedFood.name}</h4>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  每份 {selectedFood.servingSize} {selectedFood.servingUnit}
                </p>
              </div>
              <button
                onClick={() => setSelectedFood(null)}
                className="ml-2 flex-shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:gap-4">
              <label className="flex-shrink-0 text-sm font-medium">份數:</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                  disabled={servings <= 0.5}
                >
                  -
                </Button>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={servings}
                  onChange={(e) => setServings(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                  className="w-16 text-center sm:w-20"
                />
                <Button variant="outline" size="sm" onClick={() => setServings(servings + 0.5)}>
                  +
                </Button>
              </div>
              <span className="text-xs text-muted-foreground sm:text-sm">
                = {(selectedFood.servingSize * servings).toFixed(0)} {selectedFood.servingUnit}
              </span>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-background p-3 sm:grid-cols-4 sm:gap-4 sm:p-4">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">熱量</p>
                <p className="text-sm font-medium sm:text-base">
                  {(selectedFood.calories * servings).toFixed(0)} kcal
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">蛋白質</p>
                <p className="text-sm font-medium sm:text-base">
                  {(selectedFood.protein * servings).toFixed(1)} g
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">碳水化合物</p>
                <p className="text-sm font-medium sm:text-base">
                  {(selectedFood.carbs * servings).toFixed(1)} g
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">脂肪</p>
                <p className="text-sm font-medium sm:text-base">
                  {(selectedFood.fat * servings).toFixed(1)} g
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedFood(null)} className="flex-1">
                  重新選擇
                </Button>
                <Button onClick={handleConfirm} className="flex-1">
                  加入並繼續
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    handleConfirm();
                    setTimeout(() => handleClose(), 100);
                  }}
                  variant="default"
                  className="flex-1"
                >
                  加入並完成
                </Button>
                {onSelectFoodAndEdit && (
                  <Button
                    onClick={() => {
                      if (selectedFood) {
                        onSelectFoodAndEdit(selectedFood, servings);
                      }
                    }}
                    variant="secondary"
                    className="flex-1"
                  >
                    加入並編輯
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
