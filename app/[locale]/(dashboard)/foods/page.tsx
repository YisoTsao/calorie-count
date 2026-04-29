'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Search,
  Plus,
  Heart,
  Filter,
  Pencil,
  Trash2,
  Leaf,
  Apple,
  Drumstick,
  Fish,
  Egg,
  Wheat,
  Bean,
  Nut,
  Coffee,
  Cookie,
  FlaskConical,
  Hamburger,
  UtensilsCrossed,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// Map category names to Lucide icons for consistent visual style
const CATEGORY_ICON_MAP: Record<string, { icon: LucideIcon; color: string }> = {
  蔬菜類: { icon: Leaf, color: 'text-green-600' },
  水果類: { icon: Apple, color: 'text-red-500' },
  肉類: { icon: Drumstick, color: 'text-amber-700' },
  海鮮類: { icon: Fish, color: 'text-blue-500' },
  蛋奶類: { icon: Egg, color: 'text-yellow-500' },
  五穀雜糧: { icon: Wheat, color: 'text-amber-600' },
  豆類: { icon: Bean, color: 'text-green-700' },
  堅果類: { icon: Nut, color: 'text-amber-800' },
  飲料: { icon: Coffee, color: 'text-brown-600' },
  零食點心: { icon: Cookie, color: 'text-orange-500' },
  調味料: { icon: FlaskConical, color: 'text-purple-500' },
  速食: { icon: Hamburger, color: 'text-red-600' },
};

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const mapping = CATEGORY_ICON_MAP[name];
  if (mapping) {
    const IconComp = mapping.icon;
    return <IconComp className={`${className || 'h-5 w-5'} ${mapping.color}`} />;
  }
  return <UtensilsCrossed className={`${className || 'h-5 w-5'} text-gray-500`} />;
}

interface Food {
  id: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  servingSize: number;
  servingUnit: string;
  source: 'SYSTEM' | 'USER' | 'API';
  category: {
    id: string;
    name: string;
    nameEn?: string;
    nameJa?: string;
    icon?: string;
  };
  brand?: {
    id: string;
    name: string;
  };
  _count?: {
    favorites: number;
  };
  isFavorite?: boolean;
}

interface Category {
  id: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  icon?: string;
  _count: {
    foods: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const SOURCE_LABELS = {
  SYSTEM: 'system',
  USER: 'user',
  API: 'API',
};

export default function FoodsPage() {
  const t = useTranslations('foods');
  const tc = useTranslations('common');
  const locale = useLocale();

  const getLocalizedName = (
    name: string,
    nameEn?: string | null,
    nameJa?: string | null
  ): string => {
    if (locale === 'ja') return nameJa || nameEn || name;
    if (locale === 'en') return nameEn || name;
    return name;
  };
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newFood, setNewFood] = useState({
    name: '',
    nameEn: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    servingSize: 100,
    servingUnit: 'g',
    categoryId: '',
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch foods when search params change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFoods();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, selectedSource, pagination.page]);

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

  const fetchFoods = async () => {
    setIsLoading(true);
    try {
      // 如果選擇「我的最愛」,使用不同的 API
      if (selectedCategory === 'favorites') {
        const response = await fetch('/api/foods/favorites');
        if (response.ok) {
          const data = await response.json();
          let favoriteFoods = (data.favorites || []).map((food: Food) => ({
            ...food,
            isFavorite: true,
          }));

          // 如果有選擇來源,進行篩選
          if (selectedSource && selectedSource !== 'all') {
            favoriteFoods = favoriteFoods.filter((food: Food) => food.source === selectedSource);
          }

          // 如果有搜尋關鍵字,進行篩選
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            favoriteFoods = favoriteFoods.filter(
              (food: Food) =>
                food.name.toLowerCase().includes(query) ||
                (food.nameEn && food.nameEn.toLowerCase().includes(query))
            );
          }

          setFoods(favoriteFoods);
          setPagination({
            page: 1,
            limit: 20,
            total: favoriteFoods.length,
            totalPages: 1,
          });
        }
      } else {
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);
        if (selectedCategory && selectedCategory !== 'all') {
          params.append('categoryId', selectedCategory);
        }
        if (selectedSource && selectedSource !== 'all') {
          params.append('source', selectedSource);
        }
        params.append('page', pagination.page.toString());
        params.append('limit', pagination.limit.toString());

        const response = await fetch(`/api/foods/search?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setFoods(data.foods);
          setPagination(data.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to fetch foods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFood = async () => {
    // 先驗證
    const errors = validateForm(newFood);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const response = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFood),
      });

      if (response.ok) {
        alert(t('addSuccess'));
        setIsCreateDialogOpen(false);
        setFormErrors({});
        fetchFoods();
        // Reset form
        setNewFood({
          name: '',
          nameEn: '',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          servingSize: 100,
          servingUnit: 'g',
          categoryId: '',
        });
      } else {
        const error = await response.json();
        alert(t('addFailed', { error: error.error || '?' }));
      }
    } catch (error) {
      console.error('Failed to create food:', error);
      alert(t('addFailed', { error: '?' }));
    }
  };

  const handleToggleFavorite = async (foodId: string) => {
    try {
      // 取得當前狀態
      const currentFood = foods.find((f) => f.id === foodId);
      const newIsFavorite = !currentFood?.isFavorite;

      // 先樂觀更新 UI
      setFoods((prevFoods) =>
        prevFoods.map((food) =>
          food.id === foodId ? { ...food, isFavorite: newIsFavorite } : food
        )
      );

      const response = await fetch('/api/foods/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodId,
          isFavorite: newIsFavorite,
        }),
      });

      if (response.ok) {
        // 如果在我的最愛分類且取消收藏,重新載入以移除該項目
        if (selectedCategory === 'favorites' && !newIsFavorite) {
          await fetchFoods();
        }
      } else {
        // 如果失敗,還原狀態
        setFoods((prevFoods) =>
          prevFoods.map((food) =>
            food.id === foodId ? { ...food, isFavorite: !newIsFavorite } : food
          )
        );
        const errorData = await response.json();
        console.error('Toggle favorite failed:', errorData);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // 如果失敗,還原狀態
      setFoods((prevFoods) =>
        prevFoods.map((food) =>
          food.id === foodId ? { ...food, isFavorite: !food.isFavorite } : food
        )
      );
    }
  };

  // 表單驗證函數
  const validateForm = (data: typeof newFood): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.name.trim()) {
      errors.name = t('validation.name');
    }
    if (!data.categoryId) {
      errors.categoryId = t('validation.category');
    }
    if (data.servingSize <= 0) {
      errors.servingSize = t('validation.servingSize');
    }
    if (!data.servingUnit.trim()) {
      errors.servingUnit = t('validation.servingUnit');
    }
    if (data.calories < 0) {
      errors.calories = t('validation.calories');
    }
    if (data.protein < 0) {
      errors.protein = t('validation.protein');
    }
    if (data.carbs < 0) {
      errors.carbs = t('validation.carbs');
    }
    if (data.fat < 0) {
      errors.fat = t('validation.fat');
    }

    return errors;
  };

  // 開啟編輯對話框
  const openEditDialog = (food: Food) => {
    setEditingFood(food);
    setNewFood({
      name: food.name,
      nameEn: food.nameEn || '',
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber || 0,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      categoryId: food.category.id,
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  // 編輯食物
  const handleEditFood = async () => {
    if (!editingFood) return;

    const errors = validateForm(newFood);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const response = await fetch(`/api/foods/${editingFood.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFood),
      });

      if (response.ok) {
        alert(t('updateSuccess'));
        setIsEditDialogOpen(false);
        setEditingFood(null);
        setFormErrors({});
        fetchFoods();
        // Reset form
        setNewFood({
          name: '',
          nameEn: '',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          servingSize: 100,
          servingUnit: 'g',
          categoryId: '',
        });
      } else {
        const error = await response.json();
        alert(t('updateFailed', { error: error.error || '?' }));
      }
    } catch (error) {
      console.error('Failed to edit food:', error);
      alert(t('updateFailed', { error: '?' }));
    }
  };

  // 刪除食物
  const handleDeleteFood = async (foodId: string, foodName: string) => {
    if (!confirm(t('confirmDelete', { name: foodName }))) return;

    try {
      const response = await fetch(`/api/foods/${foodId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert(t('deleteSuccess'));
        fetchFoods();
      } else {
        const error = await response.json();
        alert(t('deleteFailed', { error: error.error || '?' }));
      }
    } catch (error) {
      console.error('Failed to delete food:', error);
      alert(t('deleteFailed', { error: '?' }));
    }
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('subtitle2')}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('addCustomFood')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('addCustomFood')}</DialogTitle>
              <DialogDescription>{t('addCustomFoodDesc')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Multilingual note */}
              <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                {t('customFoodNote')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('foodName')} *</Label>
                  <Input
                    id="name"
                    value={newFood.name}
                    onChange={(e) => {
                      setNewFood({ ...newFood, name: e.target.value });
                      if (formErrors.name) {
                        setFormErrors({ ...formErrors, name: '' });
                      }
                    }}
                    placeholder={t('foodNamePlaceholder')}
                    className={formErrors.name ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-muted-foreground">{t('foodNameHint')}</p>
                  {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameEn">{t('foodNameEn')}</Label>
                  <Input
                    id="nameEn"
                    value={newFood.nameEn}
                    onChange={(e) => setNewFood({ ...newFood, nameEn: e.target.value })}
                    placeholder={t('foodNameEnPlaceholder')}
                  />
                  <p className="text-xs text-muted-foreground">{t('foodNameEnHint')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t('category')}</Label>
                <Select
                  value={newFood.categoryId}
                  onValueChange={(value: string) => {
                    setNewFood({ ...newFood, categoryId: value });
                    if (formErrors.categoryId) {
                      setFormErrors({ ...formErrors, categoryId: '' });
                    }
                  }}
                >
                  <SelectTrigger className={formErrors.categoryId ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="inline-flex items-center gap-1.5">
                          <CategoryIcon name={category.name} className="h-4 w-4" /> {category.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.categoryId && (
                  <p className="text-sm text-red-500">{formErrors.categoryId}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="servingSize">{t('servingSizeLabel')}</Label>
                  <Input
                    id="servingSize"
                    type="number"
                    value={newFood.servingSize}
                    onChange={(e) => {
                      setNewFood({
                        ...newFood,
                        servingSize: parseFloat(e.target.value) || 0,
                      });
                      if (formErrors.servingSize) {
                        setFormErrors({ ...formErrors, servingSize: '' });
                      }
                    }}
                    className={formErrors.servingSize ? 'border-red-500' : ''}
                  />
                  {formErrors.servingSize && (
                    <p className="text-sm text-red-500">{formErrors.servingSize}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servingUnit">{t('servingUnit')}</Label>
                  <Input
                    id="servingUnit"
                    value={newFood.servingUnit}
                    onChange={(e) => {
                      setNewFood({ ...newFood, servingUnit: e.target.value });
                      if (formErrors.servingUnit) {
                        setFormErrors({ ...formErrors, servingUnit: '' });
                      }
                    }}
                    placeholder={t('servingUnitPlaceholder')}
                    className={formErrors.servingUnit ? 'border-red-500' : ''}
                  />
                  {formErrors.servingUnit && (
                    <p className="text-sm text-red-500">{formErrors.servingUnit}</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-3 font-medium">{t('nutritionInfo')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">{t('caloriesLabel')}</Label>
                    <Input
                      id="calories"
                      type="number"
                      step="0.1"
                      value={newFood.calories}
                      onChange={(e) => {
                        setNewFood({
                          ...newFood,
                          calories: parseFloat(e.target.value) || 0,
                        });
                        if (formErrors.calories) {
                          setFormErrors({ ...formErrors, calories: '' });
                        }
                      }}
                      className={formErrors.calories ? 'border-red-500' : ''}
                    />
                    {formErrors.calories && (
                      <p className="text-sm text-red-500">{formErrors.calories}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protein">{t('proteinLabel')}</Label>
                    <Input
                      id="protein"
                      type="number"
                      step="0.1"
                      value={newFood.protein}
                      onChange={(e) => {
                        setNewFood({
                          ...newFood,
                          protein: parseFloat(e.target.value) || 0,
                        });
                        if (formErrors.protein) {
                          setFormErrors({ ...formErrors, protein: '' });
                        }
                      }}
                      className={formErrors.protein ? 'border-red-500' : ''}
                    />
                    {formErrors.protein && (
                      <p className="text-sm text-red-500">{formErrors.protein}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbs">{t('carbsLabel')}</Label>
                    <Input
                      id="carbs"
                      type="number"
                      step="0.1"
                      value={newFood.carbs}
                      onChange={(e) => {
                        setNewFood({
                          ...newFood,
                          carbs: parseFloat(e.target.value) || 0,
                        });
                        if (formErrors.carbs) {
                          setFormErrors({ ...formErrors, carbs: '' });
                        }
                      }}
                      className={formErrors.carbs ? 'border-red-500' : ''}
                    />
                    {formErrors.carbs && <p className="text-sm text-red-500">{formErrors.carbs}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat">{t('fatLabel')}</Label>
                    <Input
                      id="fat"
                      type="number"
                      step="0.1"
                      value={newFood.fat}
                      onChange={(e) => {
                        setNewFood({
                          ...newFood,
                          fat: parseFloat(e.target.value) || 0,
                        });
                        if (formErrors.fat) {
                          setFormErrors({ ...formErrors, fat: '' });
                        }
                      }}
                      className={formErrors.fat ? 'border-red-500' : ''}
                    />
                    {formErrors.fat && <p className="text-sm text-red-500">{formErrors.fat}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fiber">{t('fiberLabel')}</Label>
                    <Input
                      id="fiber"
                      type="number"
                      step="0.1"
                      value={newFood.fiber}
                      onChange={(e) =>
                        setNewFood({
                          ...newFood,
                          fiber: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setFormErrors({});
                  }}
                  className="flex-1"
                >
                  {tc('cancel')}
                </Button>
                <Button onClick={handleCreateFood} className="flex-1">
                  {t('addButton')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Food Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('editFoodTitle')}</DialogTitle>
              <DialogDescription>{t('editFoodDesc')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">{t('foodName')} *</Label>
                  <Input
                    id="edit-name"
                    value={newFood.name}
                    onChange={(e) => {
                      setNewFood({ ...newFood, name: e.target.value });
                      if (formErrors.name) {
                        setFormErrors({ ...formErrors, name: '' });
                      }
                    }}
                    placeholder={t('foodNamePlaceholder')}
                    className={formErrors.name ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-muted-foreground">{t('foodNameHint')}</p>
                  {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-nameEn">{t('foodNameEn')}</Label>
                  <Input
                    id="edit-nameEn"
                    value={newFood.nameEn}
                    onChange={(e) => setNewFood({ ...newFood, nameEn: e.target.value })}
                    placeholder={t('foodNameEnPlaceholder')}
                  />
                  <p className="text-xs text-muted-foreground">{t('foodNameEnHint')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">{t('category')}</Label>
                <Select
                  value={newFood.categoryId}
                  onValueChange={(value: string) => {
                    setNewFood({ ...newFood, categoryId: value });
                    if (formErrors.categoryId) {
                      setFormErrors({ ...formErrors, categoryId: '' });
                    }
                  }}
                >
                  <SelectTrigger className={formErrors.categoryId ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="inline-flex items-center gap-1.5">
                          <CategoryIcon name={category.name} className="h-4 w-4" /> {category.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.categoryId && (
                  <p className="text-sm text-red-500">{formErrors.categoryId}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-servingSize">{t('servingSizeLabel')}</Label>
                  <Input
                    id="edit-servingSize"
                    type="number"
                    value={newFood.servingSize}
                    onChange={(e) => {
                      setNewFood({
                        ...newFood,
                        servingSize: parseFloat(e.target.value) || 0,
                      });
                      if (formErrors.servingSize) {
                        setFormErrors({ ...formErrors, servingSize: '' });
                      }
                    }}
                    className={formErrors.servingSize ? 'border-red-500' : ''}
                  />
                  {formErrors.servingSize && (
                    <p className="text-sm text-red-500">{formErrors.servingSize}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-servingUnit">{t('servingUnit')}</Label>
                  <Input
                    id="edit-servingUnit"
                    value={newFood.servingUnit}
                    onChange={(e) => {
                      setNewFood({ ...newFood, servingUnit: e.target.value });
                      if (formErrors.servingUnit) {
                        setFormErrors({ ...formErrors, servingUnit: '' });
                      }
                    }}
                    placeholder={t('servingUnitPlaceholder')}
                    className={formErrors.servingUnit ? 'border-red-500' : ''}
                  />
                  {formErrors.servingUnit && (
                    <p className="text-sm text-red-500">{formErrors.servingUnit}</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-3 font-medium">{t('nutritionInfo')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-calories">{t('caloriesLabel')}</Label>
                    <Input
                      id="edit-calories"
                      type="number"
                      step="0.1"
                      value={newFood.calories}
                      onChange={(e) => {
                        setNewFood({
                          ...newFood,
                          calories: parseFloat(e.target.value) || 0,
                        });
                        if (formErrors.calories) {
                          setFormErrors({ ...formErrors, calories: '' });
                        }
                      }}
                      className={formErrors.calories ? 'border-red-500' : ''}
                    />
                    {formErrors.calories && (
                      <p className="text-sm text-red-500">{formErrors.calories}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-protein">{t('proteinLabel')}</Label>
                    <Input
                      id="edit-protein"
                      type="number"
                      step="0.1"
                      value={newFood.protein}
                      onChange={(e) => {
                        setNewFood({
                          ...newFood,
                          protein: parseFloat(e.target.value) || 0,
                        });
                        if (formErrors.protein) {
                          setFormErrors({ ...formErrors, protein: '' });
                        }
                      }}
                      className={formErrors.protein ? 'border-red-500' : ''}
                    />
                    {formErrors.protein && (
                      <p className="text-sm text-red-500">{formErrors.protein}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-carbs">{t('carbsLabel')}</Label>
                    <Input
                      id="edit-carbs"
                      type="number"
                      step="0.1"
                      value={newFood.carbs}
                      onChange={(e) => {
                        setNewFood({
                          ...newFood,
                          carbs: parseFloat(e.target.value) || 0,
                        });
                        if (formErrors.carbs) {
                          setFormErrors({ ...formErrors, carbs: '' });
                        }
                      }}
                      className={formErrors.carbs ? 'border-red-500' : ''}
                    />
                    {formErrors.carbs && <p className="text-sm text-red-500">{formErrors.carbs}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-fat">{t('fatLabel')}</Label>
                    <Input
                      id="edit-fat"
                      type="number"
                      step="0.1"
                      value={newFood.fat}
                      onChange={(e) => {
                        setNewFood({
                          ...newFood,
                          fat: parseFloat(e.target.value) || 0,
                        });
                        if (formErrors.fat) {
                          setFormErrors({ ...formErrors, fat: '' });
                        }
                      }}
                      className={formErrors.fat ? 'border-red-500' : ''}
                    />
                    {formErrors.fat && <p className="text-sm text-red-500">{formErrors.fat}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-fiber">{t('fiberLabel')}</Label>
                    <Input
                      id="edit-fiber"
                      type="number"
                      step="0.1"
                      value={newFood.fiber}
                      onChange={(e) =>
                        setNewFood({
                          ...newFood,
                          fiber: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingFood(null);
                    setFormErrors({});
                  }}
                  className="flex-1"
                >
                  {tc('cancel')}
                </Button>
                <Button onClick={handleEditFood} className="flex-1">
                  {t('saveChanges')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder={t('allCategories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allCategories')}</SelectItem>
                    <SelectItem value="favorites">{t('myFavorites')}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="inline-flex items-center gap-1.5">
                          <CategoryIcon name={category.name} className="h-4 w-4" />{' '}
                          {getLocalizedName(category.name, category.nameEn, category.nameJa)} (
                          {category._count.foods})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select
                  value={selectedSource}
                  onValueChange={(value) => {
                    setSelectedSource(value);
                    setPagination({
                      ...pagination,
                      page: 1,
                      limit: 20,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('allSources')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allSources')}</SelectItem>
                    <SelectItem value="SYSTEM">{t('systemFoods')}</SelectItem>
                    <SelectItem value="USER">{t('customFoods')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {t('foundItems', { total: pagination.total })}
          {searchQuery && t('searchingFor', { query: searchQuery })}
        </span>
        <span>{t('pageOf', { page: pagination.page, total: pagination.totalPages })}</span>
      </div>

      {/* Foods Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : foods.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p className="mb-2 text-lg">{t('noFoods')}</p>
              <p className="text-sm">{t('noFoodsHint')}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {foods.length
            ? foods.map((food) => (
                <Card key={food?.id} className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CategoryIcon name={food?.category?.name} className="h-5 w-5" />
                          <CardTitle className="text-lg">
                            {getLocalizedName(food?.name, food?.nameEn, food?.nameJa)}
                          </CardTitle>
                        </div>
                        {/* Show secondary name if different from primary */}
                        {(() => {
                          const primary = getLocalizedName(food?.name, food?.nameEn, food?.nameJa);
                          const secondary = primary === food?.name ? food?.nameEn : food?.name;
                          return secondary && secondary !== primary ? (
                            <p className="mt-0.5 text-sm text-muted-foreground">{secondary}</p>
                          ) : null;
                        })()}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleFavorite(food?.id)}
                          title={food?.isFavorite ? t('removeFavorite') : t('addFavorite')}
                          className={food?.isFavorite ? 'text-red-500' : ''}
                        >
                          <Heart className={`h-4 w-4 ${food?.isFavorite ? 'fill-current' : ''}`} />
                        </Button>

                        {/* 只對自訂食物顯示編輯/刪除按鈕 */}
                        {food?.source === 'USER' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(food)}
                              title={tc('edit')}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteFood(food?.id, food?.name)}
                              title={tc('delete')}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Brand */}
                    {food?.brand && (
                      <p className="text-sm text-muted-foreground">{food?.brand?.name}</p>
                    )}

                    {/* Nutrition Info */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('caloriesShort')}</span>
                        <span className="font-medium">{food?.calories} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('proteinShort')}</span>
                        <span className="font-medium">{food?.protein} g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('carbsShort')}</span>
                        <span className="font-medium">{food?.carbs} g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('fatShort')}</span>
                        <span className="font-medium">{food?.fat} g</span>
                      </div>
                    </div>

                    {/* Serving Size */}
                    <p className="text-xs text-muted-foreground">
                      {t('perServingLabel', { size: food?.servingSize, unit: food?.servingUnit })}
                    </p>

                    {/* Tags */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getLocalizedName(
                          food?.category?.name,
                          food?.category?.nameEn,
                          food?.category?.nameJa
                        )}
                      </Badge>
                      <Badge
                        variant={food?.source === 'USER' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {food?.source === 'SYSTEM'
                          ? t('sourceSystem')
                          : food?.source === 'USER'
                            ? t('sourceUser')
                            : food.source}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            : null}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
          >
            {t('prevPage')}
          </Button>
          <div className="flex items-center px-4">
            {t('pageOf', { page: pagination.page, total: pagination.totalPages })}
          </div>
          <Button
            variant="outline"
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page === pagination.totalPages}
          >
            {t('nextPage')}
          </Button>
        </div>
      )}
    </div>
  );
}
