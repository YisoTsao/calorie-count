"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Heart,
  Filter,
  Loader2,
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Map category names to Lucide icons for consistent visual style
const CATEGORY_ICON_MAP: Record<string, { icon: LucideIcon; color: string }> = {
  "蔬菜類": { icon: Leaf, color: "text-green-600" },
  "水果類": { icon: Apple, color: "text-red-500" },
  "肉類": { icon: Drumstick, color: "text-amber-700" },
  "海鮮類": { icon: Fish, color: "text-blue-500" },
  "蛋奶類": { icon: Egg, color: "text-yellow-500" },
  "五穀雜糧": { icon: Wheat, color: "text-amber-600" },
  "豆類": { icon: Bean, color: "text-green-700" },
  "堅果類": { icon: Nut, color: "text-amber-800" },
  "飲料": { icon: Coffee, color: "text-brown-600" },
  "零食點心": { icon: Cookie, color: "text-orange-500" },
  "調味料": { icon: FlaskConical, color: "text-purple-500" },
  "速食": { icon: Hamburger, color: "text-red-600" },
};

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const mapping = CATEGORY_ICON_MAP[name];
  if (mapping) {
    const IconComp = mapping.icon;
    return <IconComp className={`${className || "w-5 h-5"} ${mapping.color}`} />;
  }
  return <UtensilsCrossed className={`${className || "w-5 h-5"} text-gray-500`} />;
}

interface Food {
  id: string;
  name: string;
  nameEn?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  servingSize: number;
  servingUnit: string;
  source: "SYSTEM" | "USER" | "API";
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
  _count?: {
    favorites: number;
  };
  isFavorite?: boolean;
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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const SOURCE_LABELS = {
  SYSTEM: "系統",
  USER: "自訂",
  API: "API",
};

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
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
    name: "",
    nameEn: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    servingSize: 100,
    servingUnit: "g",
    categoryId: "",
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
      const response = await fetch("/api/foods/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchFoods = async () => {
    setIsLoading(true);
    try {
      // 如果選擇「我的最愛」,使用不同的 API
      if (selectedCategory === "favorites") {
        const response = await fetch("/api/foods/favorites");
        if (response.ok) {
          const data = await response.json();
          let favoriteFoods = (data.favorites || []).map((food: Food) => ({
            ...food,
            isFavorite: true,
          }));

          // 如果有選擇來源,進行篩選
          if (selectedSource && selectedSource !== "all") {
            favoriteFoods = favoriteFoods.filter(
              (food: Food) => food.source === selectedSource,
            );
          }

          // 如果有搜尋關鍵字,進行篩選
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            favoriteFoods = favoriteFoods.filter(
              (food: Food) =>
                food.name.toLowerCase().includes(query) ||
                (food.nameEn && food.nameEn.toLowerCase().includes(query)),
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
        if (searchQuery) params.append("q", searchQuery);
        if (selectedCategory && selectedCategory !== "all") {
          params.append("categoryId", selectedCategory);
        }
        if (selectedSource && selectedSource !== "all") {
          params.append("source", selectedSource);
        }
        params.append("page", pagination.page.toString());
        params.append("limit", pagination.limit.toString());

        const response = await fetch(`/api/foods/search?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setFoods(data.foods);
          setPagination(data.pagination);
        }
      }
    } catch (error) {
      console.error("Failed to fetch foods:", error);
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
      const response = await fetch("/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFood),
      });

      if (response.ok) {
        alert("食物新增成功!");
        setIsCreateDialogOpen(false);
        setFormErrors({});
        fetchFoods();
        // Reset form
        setNewFood({
          name: "",
          nameEn: "",
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          servingSize: 100,
          servingUnit: "g",
          categoryId: "",
        });
      } else {
        const error = await response.json();
        alert(`新增失敗: ${error.error || "未知錯誤"}`);
      }
    } catch (error) {
      console.error("Failed to create food:", error);
      alert("新增失敗,請稍後再試");
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
          food.id === foodId ? { ...food, isFavorite: newIsFavorite } : food,
        ),
      );

      const response = await fetch("/api/foods/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodId,
          isFavorite: newIsFavorite,
        }),
      });

      if (response.ok) {
        // 如果在我的最愛分類且取消收藏,重新載入以移除該項目
        if (selectedCategory === "favorites" && !newIsFavorite) {
          await fetchFoods();
        }
      } else {
        // 如果失敗,還原狀態
        setFoods((prevFoods) =>
          prevFoods.map((food) =>
            food.id === foodId ? { ...food, isFavorite: !newIsFavorite } : food,
          ),
        );
        const errorData = await response.json();
        console.error("Toggle favorite failed:", errorData);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      // 如果失敗,還原狀態
      setFoods((prevFoods) =>
        prevFoods.map((food) =>
          food.id === foodId ? { ...food, isFavorite: !food.isFavorite } : food,
        ),
      );
    }
  };

  // 表單驗證函數
  const validateForm = (data: typeof newFood): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.name.trim()) {
      errors.name = "請輸入食物名稱";
    }
    if (!data.categoryId) {
      errors.categoryId = "請選擇食物分類";
    }
    if (data.servingSize <= 0) {
      errors.servingSize = "每份大小必須大於 0";
    }
    if (!data.servingUnit.trim()) {
      errors.servingUnit = "請輸入單位";
    }
    if (data.calories < 0) {
      errors.calories = "熱量不能為負數";
    }
    if (data.protein < 0) {
      errors.protein = "蛋白質不能為負數";
    }
    if (data.carbs < 0) {
      errors.carbs = "碳水化合物不能為負數";
    }
    if (data.fat < 0) {
      errors.fat = "脂肪不能為負數";
    }

    return errors;
  };

  // 開啟編輯對話框
  const openEditDialog = (food: Food) => {
    setEditingFood(food);
    setNewFood({
      name: food.name,
      nameEn: food.nameEn || "",
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFood),
      });

      if (response.ok) {
        alert("食物已更新!");
        setIsEditDialogOpen(false);
        setEditingFood(null);
        setFormErrors({});
        fetchFoods();
        // Reset form
        setNewFood({
          name: "",
          nameEn: "",
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          servingSize: 100,
          servingUnit: "g",
          categoryId: "",
        });
      } else {
        const error = await response.json();
        alert(`更新失敗: ${error.error || "未知錯誤"}`);
      }
    } catch (error) {
      console.error("Failed to edit food:", error);
      alert("更新失敗,請稍後再試");
    }
  };

  // 刪除食物
  const handleDeleteFood = async (foodId: string, foodName: string) => {
    if (!confirm(`確定要刪除「${foodName}」嗎?`)) return;

    try {
      const response = await fetch(`/api/foods/${foodId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("食物已刪除");
        fetchFoods();
      } else {
        const error = await response.json();
        alert(`刪除失敗: ${error.error || "未知錯誤"}`);
      }
    } catch (error) {
      console.error("Failed to delete food:", error);
      alert("刪除失敗,請稍後再試");
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">食物資料庫</h1>
          <p className="text-muted-foreground mt-1">瀏覽和管理食物營養資訊</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增自訂食物
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>新增自訂食物</DialogTitle>
              <DialogDescription>
                建立您自己的食物資料,方便日後快速新增
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">食物名稱 *</Label>
                  <Input
                    id="name"
                    value={newFood.name}
                    onChange={(e) => {
                      setNewFood({ ...newFood, name: e.target.value });
                      if (formErrors.name) {
                        setFormErrors({ ...formErrors, name: "" });
                      }
                    }}
                    placeholder="例: 雞胸肉"
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameEn">英文名稱</Label>
                  <Input
                    id="nameEn"
                    value={newFood.nameEn}
                    onChange={(e) =>
                      setNewFood({ ...newFood, nameEn: e.target.value })
                    }
                    placeholder="例: Chicken Breast"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">食物分類 *</Label>
                <Select
                  value={newFood.categoryId}
                  onValueChange={(value: string) => {
                    setNewFood({ ...newFood, categoryId: value });
                    if (formErrors.categoryId) {
                      setFormErrors({ ...formErrors, categoryId: "" });
                    }
                  }}
                >
                  <SelectTrigger
                    className={formErrors.categoryId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="選擇分類" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="inline-flex items-center gap-1.5"><CategoryIcon name={category.name} className="w-4 h-4" /> {category.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.categoryId && (
                  <p className="text-sm text-red-500">
                    {formErrors.categoryId}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="servingSize">每份大小 *</Label>
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
                        setFormErrors({ ...formErrors, servingSize: "" });
                      }
                    }}
                    className={formErrors.servingSize ? "border-red-500" : ""}
                  />
                  {formErrors.servingSize && (
                    <p className="text-sm text-red-500">
                      {formErrors.servingSize}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servingUnit">單位 *</Label>
                  <Input
                    id="servingUnit"
                    value={newFood.servingUnit}
                    onChange={(e) => {
                      setNewFood({ ...newFood, servingUnit: e.target.value });
                      if (formErrors.servingUnit) {
                        setFormErrors({ ...formErrors, servingUnit: "" });
                      }
                    }}
                    placeholder="例: g, ml, 份"
                    className={formErrors.servingUnit ? "border-red-500" : ""}
                  />
                  {formErrors.servingUnit && (
                    <p className="text-sm text-red-500">
                      {formErrors.servingUnit}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">營養資訊 (每份)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">熱量 (kcal) *</Label>
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
                          setFormErrors({ ...formErrors, calories: "" });
                        }
                      }}
                      className={formErrors.calories ? "border-red-500" : ""}
                    />
                    {formErrors.calories && (
                      <p className="text-sm text-red-500">
                        {formErrors.calories}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protein">蛋白質 (g) *</Label>
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
                          setFormErrors({ ...formErrors, protein: "" });
                        }
                      }}
                      className={formErrors.protein ? "border-red-500" : ""}
                    />
                    {formErrors.protein && (
                      <p className="text-sm text-red-500">
                        {formErrors.protein}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbs">碳水化合物 (g) *</Label>
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
                          setFormErrors({ ...formErrors, carbs: "" });
                        }
                      }}
                      className={formErrors.carbs ? "border-red-500" : ""}
                    />
                    {formErrors.carbs && (
                      <p className="text-sm text-red-500">{formErrors.carbs}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat">脂肪 (g) *</Label>
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
                          setFormErrors({ ...formErrors, fat: "" });
                        }
                      }}
                      className={formErrors.fat ? "border-red-500" : ""}
                    />
                    {formErrors.fat && (
                      <p className="text-sm text-red-500">{formErrors.fat}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fiber">膳食纖維 (g)</Label>
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
                  取消
                </Button>
                <Button onClick={handleCreateFood} className="flex-1">
                  新增食物
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Food Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>編輯食物</DialogTitle>
              <DialogDescription>修改您自訂食物的資料</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">食物名稱 *</Label>
                  <Input
                    id="edit-name"
                    value={newFood.name}
                    onChange={(e) => {
                      setNewFood({ ...newFood, name: e.target.value });
                      if (formErrors.name) {
                        setFormErrors({ ...formErrors, name: "" });
                      }
                    }}
                    placeholder="例: 雞胸肉"
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-nameEn">英文名稱</Label>
                  <Input
                    id="edit-nameEn"
                    value={newFood.nameEn}
                    onChange={(e) =>
                      setNewFood({ ...newFood, nameEn: e.target.value })
                    }
                    placeholder="例: Chicken Breast"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">食物分類 *</Label>
                <Select
                  value={newFood.categoryId}
                  onValueChange={(value: string) => {
                    setNewFood({ ...newFood, categoryId: value });
                    if (formErrors.categoryId) {
                      setFormErrors({ ...formErrors, categoryId: "" });
                    }
                  }}
                >
                  <SelectTrigger
                    className={formErrors.categoryId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="選擇分類" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="inline-flex items-center gap-1.5"><CategoryIcon name={category.name} className="w-4 h-4" /> {category.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.categoryId && (
                  <p className="text-sm text-red-500">
                    {formErrors.categoryId}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-servingSize">每份大小 *</Label>
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
                        setFormErrors({ ...formErrors, servingSize: "" });
                      }
                    }}
                    className={formErrors.servingSize ? "border-red-500" : ""}
                  />
                  {formErrors.servingSize && (
                    <p className="text-sm text-red-500">
                      {formErrors.servingSize}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-servingUnit">單位 *</Label>
                  <Input
                    id="edit-servingUnit"
                    value={newFood.servingUnit}
                    onChange={(e) => {
                      setNewFood({ ...newFood, servingUnit: e.target.value });
                      if (formErrors.servingUnit) {
                        setFormErrors({ ...formErrors, servingUnit: "" });
                      }
                    }}
                    placeholder="例: g, ml, 份"
                    className={formErrors.servingUnit ? "border-red-500" : ""}
                  />
                  {formErrors.servingUnit && (
                    <p className="text-sm text-red-500">
                      {formErrors.servingUnit}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">營養資訊 (每份)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-calories">熱量 (kcal) *</Label>
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
                          setFormErrors({ ...formErrors, calories: "" });
                        }
                      }}
                      className={formErrors.calories ? "border-red-500" : ""}
                    />
                    {formErrors.calories && (
                      <p className="text-sm text-red-500">
                        {formErrors.calories}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-protein">蛋白質 (g) *</Label>
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
                          setFormErrors({ ...formErrors, protein: "" });
                        }
                      }}
                      className={formErrors.protein ? "border-red-500" : ""}
                    />
                    {formErrors.protein && (
                      <p className="text-sm text-red-500">
                        {formErrors.protein}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-carbs">碳水化合物 (g) *</Label>
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
                          setFormErrors({ ...formErrors, carbs: "" });
                        }
                      }}
                      className={formErrors.carbs ? "border-red-500" : ""}
                    />
                    {formErrors.carbs && (
                      <p className="text-sm text-red-500">{formErrors.carbs}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-fat">脂肪 (g) *</Label>
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
                          setFormErrors({ ...formErrors, fat: "" });
                        }
                      }}
                      className={formErrors.fat ? "border-red-500" : ""}
                    />
                    {formErrors.fat && (
                      <p className="text-sm text-red-500">{formErrors.fat}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-fiber">膳食纖維 (g)</Label>
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
                  取消
                </Button>
                <Button onClick={handleEditFood} className="flex-1">
                  儲存變更
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜尋食物名稱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="所有分類" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有分類</SelectItem>
                    <SelectItem value="favorites">❤️ 我的最愛</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="inline-flex items-center gap-1.5"><CategoryIcon name={category.name} className="w-4 h-4" /> {category.name} ({category._count.foods})</span>
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
                    <SelectValue placeholder="所有來源" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有來源</SelectItem>
                    <SelectItem value="SYSTEM">系統食物</SelectItem>
                    <SelectItem value="USER">自訂食物</SelectItem>
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
          找到 {pagination.total} 項食物
          {searchQuery && ` (搜尋: "${searchQuery}")`}
        </span>
        <span>
          第 {pagination.page} / {pagination.totalPages} 頁
        </span>
      </div>

      {/* Foods Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : foods.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">找不到符合的食物</p>
              <p className="text-sm">請嘗試調整搜尋條件或新增自訂食物</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foods.map((food) => (
            <Card key={food.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CategoryIcon name={food.category.name} className="w-5 h-5" />
                      <CardTitle className="text-lg">{food.name}</CardTitle>
                    </div>
                    {food.nameEn && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {food.nameEn}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleFavorite(food.id)}
                      title={food.isFavorite ? "取消收藏" : "加入最愛"}
                      className={food.isFavorite ? "text-red-500" : ""}
                    >
                      <Heart
                        className={`h-4 w-4 ${food.isFavorite ? "fill-current" : ""}`}
                      />
                    </Button>

                    {/* 只對自訂食物顯示編輯/刪除按鈕 */}
                    {food.source === "USER" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(food)}
                          title="編輯"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteFood(food.id, food.name)}
                          title="刪除"
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
                {food.brand && (
                  <p className="text-sm text-muted-foreground">
                    {food.brand.name}
                  </p>
                )}

                {/* Nutrition Info */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">熱量</span>
                    <span className="font-medium">{food.calories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">蛋白質</span>
                    <span className="font-medium">{food.protein} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">碳水</span>
                    <span className="font-medium">{food.carbs} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">脂肪</span>
                    <span className="font-medium">{food.fat} g</span>
                  </div>
                </div>

                {/* Serving Size */}
                <p className="text-xs text-muted-foreground">
                  每份 {food.servingSize} {food.servingUnit}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {food.category.name}
                  </Badge>
                  <Badge
                    variant={food.source === "USER" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {SOURCE_LABELS[food.source]}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page - 1 })
            }
            disabled={pagination.page === 1}
          >
            上一頁
          </Button>
          <div className="flex items-center px-4">
            第 {pagination.page} / {pagination.totalPages} 頁
          </div>
          <Button
            variant="outline"
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page + 1 })
            }
            disabled={pagination.page === pagination.totalPages}
          >
            下一頁
          </Button>
        </div>
      )}
    </div>
  );
}
