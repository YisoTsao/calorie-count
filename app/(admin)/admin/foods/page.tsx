'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';

interface Category {
  id: string;
  name: string;
  nameEn: string | null;
  nameJa: string | null;
  icon: string | null;
  order: number;
  _count?: { foods: number };
}

interface FatSecretFood {
  foodId: string;
  name: string;
  brandName: string | null;
  foodType: string | null;
  description: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Food {
  id: string;
  name: string;
  nameEn: string | null;
  nameJa: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number | null;
  servingUnit: string | null;
  category: Category | null;
  createdAt: string;
}

interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner: string | null;
  foodCategory: string | null;
  dataType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
}

const EMPTY_FORM = {
  id: '',
  name: '',
  nameEn: '',
  nameJa: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
  servingSize: 100,
  servingUnit: 'g',
  categoryId: '',
};

/** Convert USDA ALL_CAPS description to Title Case */
function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminFoodsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<typeof EMPTY_FORM | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const LIMIT = 20;

  // ── Tab state (synced to URL) ──
  const initialTab = (searchParams.get('tab') ?? 'system') as 'system' | 'usda' | 'fatsecret';
  const [tab, setTab] = useState<'system' | 'usda' | 'fatsecret'>(initialTab);

  const switchTab = (t: 'system' | 'usda' | 'fatsecret') => {
    setTab(t);
    if (t === 'system') load(); // 切換回系統食物庫時重新載入
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', t);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const [usdaQ, setUsdaQ] = useState('');
  const [usdaResults, setUsdaResults] = useState<USDAFood[]>([]);
  const [usdaTotal, setUsdaTotal] = useState(0);
  const [usdaPage, setUsdaPage] = useState(1);
  const [usdaTotalPages, setUsdaTotalPages] = useState(0);
  const [usdaLoading, setUsdaLoading] = useState(false);
  const [usdaImported, setUsdaImported] = useState<Set<number>>(new Set());
  const usdaAbort = useRef<AbortController | null>(null);

  // ── FatSecret state ──
  const [fsQ, setFsQ] = useState('');
  const [fsResults, setFsResults] = useState<FatSecretFood[]>([]);
  const [fsTotal, setFsTotal] = useState(0);
  const [fsPage, setFsPage] = useState(0);
  const [fsTotalPages, setFsTotalPages] = useState(0);
  const [fsLoading, setFsLoading] = useState(false);
  const [fsError, setFsError] = useState<string | null>(null);
  const [fsImported, setFsImported] = useState<Set<string>>(new Set());
  const fsAbort = useRef<AbortController | null>(null);

  // ── Category management state ──
  const [catDrawer, setCatDrawer] = useState(false);
  const [allCats, setAllCats] = useState<Category[]>([]);
  const [catForm, setCatForm] = useState<{
    id: string;
    name: string;
    nameEn: string;
    nameJa: string;
    icon: string;
  } | null>(null);
  const [catSaving, setCatSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(LIMIT),
      ...(debouncedQ ? { q: debouncedQ } : {}),
      ...(filterCat ? { categoryId: filterCat } : {}),
    });
    const res = await fetch(`/api/admin/foods?${params}`);
    const data = await res.json();
    setFoods(data.foods ?? []);
    setTotal(data.total ?? 0);
    if (data.categories) setCategories(data.categories);
    setLoading(false);
  }, [page, debouncedQ, filterCat]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const method = isNew ? 'POST' : 'PUT';
    const body = { ...editing, categoryId: editing.categoryId || null };
    await fetch('/api/admin/foods', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此食物？此操作無法復原。')) return;
    await fetch(`/api/admin/foods?id=${id}`, { method: 'DELETE' });
    load();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`確定要刪除選取的 ${selectedIds.size} 筆食物？此操作無法復原。`)) return;
    setBulkDeleting(true);
    await fetch('/api/admin/foods/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selectedIds] }),
    });
    setSelectedIds(new Set());
    setBulkDeleting(false);
    load();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === foods.length && foods.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(foods.map((f) => f.id)));
    }
  };

  const handleSeedJa = async () => {
    setSeeding(true);
    setSeedMsg('');
    const res = await fetch('/api/admin/seed-ja', { method: 'POST' });
    const data = await res.json();
    setSeedMsg(`✓ 更新 ${data.categoriesUpdated} 分類、${data.foodsUpdated} 食物的日文名稱`);
    setSeeding(false);
    load();
  };

  // ── USDA handlers ──
  const searchUsda = useCallback(async (keyword: string, pg = 1) => {
    if (!keyword.trim()) {
      setUsdaResults([]);
      setUsdaTotal(0);
      setUsdaTotalPages(0);
      return;
    }
    usdaAbort.current?.abort();
    const ctrl = new AbortController();
    usdaAbort.current = ctrl;
    setUsdaLoading(true);
    try {
      const res = await fetch(
        `/api/admin/usda?q=${encodeURIComponent(keyword)}&page=${pg}`,
        { signal: ctrl.signal }
      );
      const data = await res.json();
      setUsdaResults(data.foods ?? []);
      setUsdaTotal(data.totalHits ?? 0);
      setUsdaTotalPages(data.totalPages ?? 0);
      setUsdaPage(pg);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') console.error(e);
    } finally {
      setUsdaLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchUsda(usdaQ, 1), 500);
    return () => clearTimeout(t);
  }, [usdaQ, searchUsda]);

  const importUsdaFood = async (food: USDAFood) => {
    const body = {
      name: toTitleCase(food.description),
      nameEn: food.description,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      sugar: food.sugar,
      sodium: food.sodium,
      servingSize: 100,
      servingUnit: 'g',
      source: 'API',
      categoryId: null,
    };
    const res = await fetch('/api/admin/foods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setUsdaImported((prev) => new Set([...prev, food.fdcId]));
      load(); // 立即更新系統食物庫
    }
  };

  // ── FatSecret handlers ──
  const searchFs = useCallback(async (keyword: string, pg = 0) => {
    if (!keyword.trim()) {
      setFsResults([]);
      setFsTotal(0);
      setFsTotalPages(0);
      return;
    }
    fsAbort.current?.abort();
    const ctrl = new AbortController();
    fsAbort.current = ctrl;
    setFsLoading(true);
    setFsError(null);
    try {
      const res = await fetch(
        `/api/admin/fatsecret?q=${encodeURIComponent(keyword)}&page=${pg}`,
        { signal: ctrl.signal }
      );
      const data = await res.json();
      if (data.error) {
        setFsError(data.error);
        setFsResults([]);
        setFsTotal(0);
        setFsTotalPages(0);
        return;
      }
      setFsResults(data.foods ?? []);
      setFsTotal(data.totalResults ?? 0);
      setFsTotalPages(data.totalPages ?? 0);
      setFsPage(pg);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') console.error(e);
    } finally {
      setFsLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchFs(fsQ, 0), 500);
    return () => clearTimeout(t);
  }, [fsQ, searchFs]);

  const importFsFood = async (food: FatSecretFood) => {
    const body = {
      name: food.name,
      nameEn: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      servingSize: 100,
      servingUnit: 'g',
      source: 'API',
      categoryId: null,
    };
    const res = await fetch('/api/admin/foods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setFsImported((prev) => new Set([...prev, food.foodId]));
      load(); // 立即更新系統食物庫
    }
  };

  // ── Category management handlers ──
  const loadCats = useCallback(async () => {
    const res = await fetch('/api/admin/categories');
    const data = await res.json();
    setAllCats(data.categories ?? []);
  }, []);

  const openCatDrawer = () => {
    loadCats();
    setCatDrawer(true);
  };

  const saveCat = async () => {
    if (!catForm) return;
    setCatSaving(true);
    const isNew = !catForm.id;
    await fetch('/api/admin/categories', {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(isNew ? {} : { id: catForm.id }),
        name: catForm.name,
        nameEn: catForm.nameEn || null,
        nameJa: catForm.nameJa || null,
        icon: catForm.icon || null,
      }),
    });
    setCatSaving(false);
    setCatForm(null);
    loadCats();
    load(); // refresh categories in filter
  };

  const deleteCat = async (id: string) => {
    if (!confirm('確定刪除此分類？旗下食物將變為未分類。')) return;
    await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
    loadCats();
    load();
  };

  const openNew = () => {
    setEditing({ ...EMPTY_FORM });
    setIsNew(true);
  };

  const openEdit = (f: Food) => {
    setEditing({
      id: f.id,
      name: f.name,
      nameEn: f.nameEn ?? '',
      nameJa: f.nameJa ?? '',
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      servingSize: f.servingSize ?? 100,
      servingUnit: f.servingUnit ?? 'g',
      categoryId: f.category?.id ?? '',
    });
    setIsNew(false);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h1 className="font-['Manrope',sans-serif] text-2xl font-bold text-white">食物資料庫</h1>
          <p className="mt-1 text-sm text-slate-400">共 {total.toLocaleString()} 筆系統食物</p>
        </div>
        <div className="flex items-center gap-2">
          {/* <button onClick={handleSeedJa} ...> */}
          <button
            onClick={openCatDrawer}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700"
          >
            <Icon icon="mdi:tag-multiple-outline" className="text-base" />
            管理分類
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4648d4] to-[#6063ee] px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
          >
            <Icon icon="mdi:plus" className="text-base" />
            新增食物
          </button>
        </div>
      </div>

      {seedMsg && (
        <div className="rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400">
          {seedMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex w-fit gap-1 rounded-xl bg-slate-900/60 p-1">
        {(
          [
            { key: 'system', label: '系統食物庫', icon: 'mdi:database-outline' },
            { key: 'usda', label: 'USDA 匯入', icon: 'mdi:database-import-outline' },
            { key: 'fatsecret', label: 'FatSecret 匯入', icon: 'mdi:food-variant' },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-[#4648d4] !text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon icon={t.icon} className="text-base" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== System Foods Tab ===== */}
      {tab === 'system' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Icon
                icon="mdi:magnify"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-500"
              />
              <input
                type="text"
                placeholder="搜尋食物名稱..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
              />
            </div>
            <select
              value={filterCat}
              onChange={(e) => {
                setFilterCat(e.target.value);
                setPage(1);
              }}
              className="rounded-xl bg-slate-900/60 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
            >
              <option value="">所有分類</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk action toolbar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-[#4648d4]/10 px-4 py-2.5">
              <span className="flex-1 text-sm text-[#6063ee]">已選取 {selectedIds.size} 筆</span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-slate-400 transition-colors hover:text-white"
              >
                取消選取
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-50"
              >
                <Icon icon="mdi:trash-can-outline" className="text-sm" />
                {bulkDeleting ? '刪除中...' : `刪除 ${selectedIds.size} 筆`}
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-2xl bg-slate-900/60">
            {loading ? (
              <div className="space-y-3 p-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
                ))}
              </div>
            ) : foods.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Icon icon="mdi:food-off-outline" className="mx-auto mb-3 text-4xl" />
                <p>找不到食物</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-800/60">
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={foods.length > 0 && selectedIds.size === foods.length}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-[#4648d4] focus:ring-[#4648d4]/50"
                        />
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">食物</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">分類</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-500">熱量</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-500">蛋白質</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-500">碳水</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-500">脂肪</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {foods.map((f) => (
                      <tr
                        key={f.id}
                        className={`transition-colors hover:bg-slate-800/30 ${selectedIds.has(f.id) ? 'bg-[#4648d4]/5' : ''}`}
                      >
                        <td className="w-10 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(f.id)}
                            onChange={() => toggleSelect(f.id)}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-[#4648d4] focus:ring-[#4648d4]/50"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">{f.name}</p>
                          <div className="mt-0.5 flex gap-2">
                            {f.nameEn && <span className="text-xs text-slate-500">{f.nameEn}</span>}
                            {f.nameJa && (
                              <span className="text-xs text-slate-500">/ {f.nameJa}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {f.category?.name ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-300">{f.calories} kcal</td>
                        <td className="px-4 py-3 text-right text-xs text-slate-400">
                          {f.protein}g
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-slate-400">{f.carbs}g</td>
                        <td className="px-4 py-3 text-right text-xs text-slate-400">{f.fat}g</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(f)}
                              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-700 hover:text-white"
                            >
                              <Icon icon="mdi:pencil-outline" className="text-base" />
                            </button>
                            <button
                              onClick={() => handleDelete(f.id)}
                              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Icon icon="mdi:trash-can-outline" className="text-base" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
              >
                <Icon icon="mdi:chevron-left" />
              </button>
              <span className="text-sm text-slate-400">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
              >
                <Icon icon="mdi:chevron-right" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== USDA Import Tab ===== */}
      {tab === 'usda' && (
        <div className="space-y-5">
          <div className="space-y-1 rounded-2xl bg-slate-900/60 p-5">
            <p className="text-sm font-medium text-slate-300">USDA FoodData Central</p>
            <p className="text-xs text-slate-500">
              搜尋美國農業部食物資料庫（Foundation + SR Legacy），所有數值基準為每 100g。
              匯入後可在系統食物庫中編輯分類與名稱。
            </p>
          </div>

          {/* USDA search input */}
          <div className="relative">
            <Icon
              icon="mdi:magnify"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-500"
            />
            <input
              type="text"
              placeholder="輸入英文關鍵字，例如: apple, chicken breast..."
              value={usdaQ}
              onChange={(e) => setUsdaQ(e.target.value)}
              className="w-full rounded-xl bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
            />
          </div>

          {/* USDA results */}
          {usdaLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-800/50" />
              ))}
            </div>
          ) : usdaResults.length === 0 && usdaQ.length >= 2 ? (
            <div className="py-12 text-center text-slate-500">
              <Icon icon="mdi:database-search-outline" className="mx-auto mb-2 text-4xl" />
              <p>找不到結果</p>
            </div>
          ) : usdaResults.length > 0 ? (
            <>
              <p className="text-xs text-slate-500">
                共找到 {usdaTotal.toLocaleString()} 筆，顯示第 {(usdaPage - 1) * 25 + 1}–{Math.min(usdaPage * 25, usdaTotal)} 筆
              </p>
              <div className="overflow-hidden rounded-2xl bg-slate-900/60">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-800/60">
                        <th className="px-5 py-3 text-left font-medium text-slate-500">食物名稱</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-500">分類</th>
                        <th className="px-4 py-3 text-right font-medium text-slate-500">熱量</th>
                        <th className="px-4 py-3 text-right font-medium text-slate-500">
                          P · C · F
                        </th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {usdaResults.map((f) => {
                        const imported = usdaImported.has(f.fdcId);
                        return (
                          <tr
                            key={f.fdcId}
                            className={`transition-colors ${imported ? 'opacity-50' : 'hover:bg-slate-800/30'}`}
                          >
                            <td className="px-5 py-3">
                              <p className="text-sm font-medium text-white">
                                {toTitleCase(f.description)}
                              </p>
                              {f.brandOwner && (
                                <p className="mt-0.5 text-xs text-slate-500">{f.brandOwner}</p>
                              )}
                              <span className="mt-1 inline-block rounded bg-[#4648d4]/10 px-1.5 py-0.5 text-xs text-[#6063ee]">
                                {f.dataType}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400">
                              {f.foodCategory ?? '—'}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-slate-300">
                              {f.calories} kcal
                            </td>
                            <td className="px-4 py-3 text-right text-xs text-slate-400">
                              <span className="text-blue-400">{f.protein}g</span>
                              {' · '}
                              <span className="text-amber-400">{f.carbs}g</span>
                              {' · '}
                              <span className="text-rose-400">{f.fat}g</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => importUsdaFood(f)}
                                disabled={imported}
                                className={`ml-auto flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                  imported
                                    ? 'cursor-default bg-emerald-500/10 text-emerald-400'
                                    : 'bg-[#4648d4]/20 text-[#6063ee] hover:bg-[#4648d4]/30'
                                }`}
                              >
                                <Icon
                                  icon={imported ? 'mdi:check' : 'mdi:database-arrow-down-outline'}
                                  className="text-base"
                                />
                                {imported ? '已匯入' : '匯入'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* USDA Pagination */}
              {usdaTotalPages > 1 && (
                <div className="flex items-center justify-end gap-2">
                  <button
                    disabled={usdaPage <= 1}
                    onClick={() => searchUsda(usdaQ, usdaPage - 1)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                  >
                    <Icon icon="mdi:chevron-left" />
                  </button>
                  <span className="text-sm text-slate-400">
                    {usdaPage} / {usdaTotalPages}
                  </span>
                  <button
                    disabled={usdaPage >= usdaTotalPages}
                    onClick={() => searchUsda(usdaQ, usdaPage + 1)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                  >
                    <Icon icon="mdi:chevron-right" />
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* ===== FatSecret Import Tab ===== */}
      {tab === 'fatsecret' && (
        <div className="space-y-5">
          <div className="space-y-1 rounded-2xl bg-slate-900/60 p-5">
            <p className="text-sm font-medium text-slate-300">FatSecret Platform API</p>
            <p className="text-xs text-slate-500">
              搜尋 FatSecret 全球食物資料庫，每份數值以 100g 為基準。
            </p>
          </div>

          <div className="relative">
            <Icon
              icon="mdi:magnify"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-500"
            />
            <input
              type="text"
              placeholder="輸入食物名稱，例如: apple, salmon, tofu..."
              value={fsQ}
              onChange={(e) => setFsQ(e.target.value)}
              className="w-full rounded-xl bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
            />
          </div>

          {/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(fsQ) && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-400">
              <Icon icon="mdi:information-outline" className="mt-0.5 flex-shrink-0" />
              <span>FatSecret 資料庫以英文為主，中文查詢結果可能不準確，建議改用英文搜尋。</span>
            </div>
          )}

          {fsLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-800/50" />
              ))}
            </div>
          ) : fsError ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4">
              <div className="flex items-start gap-3">
                <Icon
                  icon="mdi:alert-circle-outline"
                  className="mt-0.5 flex-shrink-0 text-xl text-red-400"
                />
                <div>
                  <p className="text-sm font-medium text-red-300">FatSecret API 錯誤</p>
                  <p className="mt-0.5 text-xs text-red-400/80">{fsError}</p>
                  {fsError.includes('IP') && (
                    <p className="mt-2 text-xs text-slate-400">
                      請登入{' '}
                      <a
                        href="https://platform.fatsecret.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 underline"
                      >
                        platform.fatsecret.com
                      </a>{' '}
                      → My Account → Applications → Edit → 清空 IP whitelist 後重試。
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : fsResults.length === 0 && fsQ.length >= 2 ? (
            <div className="py-12 text-center text-slate-500">
              <Icon icon="mdi:database-search-outline" className="mx-auto mb-2 text-4xl" />
              <p>找不到結果</p>
            </div>
          ) : fsResults.length > 0 ? (
            <>
              <p className="text-xs text-slate-500">
                共找到 {fsTotal.toLocaleString()} 筆，顯示第 {fsPage * 25 + 1}–{Math.min((fsPage + 1) * 25, fsTotal)} 筆
              </p>
              <div className="overflow-hidden rounded-2xl bg-slate-900/60">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-800/60">
                        <th className="px-5 py-3 text-left font-medium text-slate-500">食物名稱</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-500">類型</th>
                        <th className="px-4 py-3 text-right font-medium text-slate-500">熱量</th>
                        <th className="px-4 py-3 text-right font-medium text-slate-500">
                          P · C · F
                        </th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {fsResults.map((f) => {
                        const imported = fsImported.has(f.foodId);
                        return (
                          <tr
                            key={f.foodId}
                            className={`transition-colors ${imported ? 'opacity-50' : 'hover:bg-slate-800/30'}`}
                          >
                            <td className="px-5 py-3">
                              <p className="text-sm font-medium text-white">{f.name}</p>
                              {f.brandName && (
                                <p className="mt-0.5 text-xs text-slate-500">{f.brandName}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400">
                              {f.foodType ?? '—'}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-slate-300">
                              {f.calories} kcal
                            </td>
                            <td className="px-4 py-3 text-right text-xs">
                              <span className="text-blue-400">{f.protein}g</span>
                              {' · '}
                              <span className="text-amber-400">{f.carbs}g</span>
                              {' · '}
                              <span className="text-rose-400">{f.fat}g</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => importFsFood(f)}
                                disabled={imported}
                                className={`ml-auto flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                  imported
                                    ? 'cursor-default bg-emerald-500/10 text-emerald-400'
                                    : 'bg-[#4648d4]/20 text-[#6063ee] hover:bg-[#4648d4]/30'
                                }`}
                              >
                                <Icon
                                  icon={imported ? 'mdi:check' : 'mdi:database-arrow-down-outline'}
                                  className="text-base"
                                />
                                {imported ? '已匯入' : '匯入'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* FatSecret Pagination */}
              {fsTotalPages > 1 && (
                <div className="flex items-center justify-end gap-2">
                  <button
                    disabled={fsPage <= 0}
                    onClick={() => searchFs(fsQ, fsPage - 1)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                  >
                    <Icon icon="mdi:chevron-left" />
                  </button>
                  <span className="text-sm text-slate-400">
                    {fsPage + 1} / {fsTotalPages}
                  </span>
                  <button
                    disabled={fsPage >= fsTotalPages - 1}
                    onClick={() => searchFs(fsQ, fsPage + 1)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                  >
                    <Icon icon="mdi:chevron-right" />
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* ===== Category Management Drawer ===== */}
      {catDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setCatDrawer(false);
              setCatForm(null);
            }}
          />
          <div className="relative flex h-full w-full max-w-md flex-col bg-slate-900 shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <h2 className="font-['Manrope',sans-serif] font-semibold text-white">管理分類</h2>
              <button
                onClick={() => {
                  setCatDrawer(false);
                  setCatForm(null);
                }}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <Icon icon="mdi:close" />
              </button>
            </div>

            {/* Category list */}
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {allCats.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl bg-slate-800/60 px-4 py-3"
                >
                  {c.icon && <span className="text-xl">{c.icon}</span>}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{c.name}</p>
                    <p className="text-xs text-slate-500">{c._count?.foods ?? 0} 筆食物</p>
                  </div>
                  <div className="flex flex-shrink-0 gap-1">
                    <button
                      onClick={() =>
                        setCatForm({
                          id: c.id,
                          name: c.name,
                          nameEn: c.nameEn ?? '',
                          nameJa: c.nameJa ?? '',
                          icon: c.icon ?? '',
                        })
                      }
                      className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-700 hover:text-white"
                    >
                      <Icon icon="mdi:pencil-outline" className="text-base" />
                    </button>
                    <button
                      onClick={() => deleteCat(c.id)}
                      className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Icon icon="mdi:trash-can-outline" className="text-base" />
                    </button>
                  </div>
                </div>
              ))}
              {allCats.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">尚無分類</p>
              )}
            </div>

            {/* Add / edit form */}
            <div className="space-y-3 border-t border-slate-800 p-4">
              {catForm === null ? (
                <button
                  onClick={() => setCatForm({ id: '', name: '', nameEn: '', nameJa: '', icon: '' })}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4648d4]/20 py-2.5 text-sm font-medium text-[#6063ee] transition-colors hover:bg-[#4648d4]/30"
                >
                  <Icon icon="mdi:plus" />
                  新增分類
                </button>
              ) : (
                <>
                  <p className="text-xs font-medium text-slate-400">
                    {catForm.id ? '編輯分類' : '新增分類'}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-1">
                      <label className="mb-1 block text-xs text-slate-500">Emoji</label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="🥩"
                        value={catForm.icon}
                        onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                        className="w-full rounded-xl bg-slate-800 px-3 py-2 text-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="mb-1 block text-xs text-slate-500">分類名稱 *</label>
                      <input
                        type="text"
                        placeholder="例：肉類"
                        value={catForm.name}
                        onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                        className="w-full rounded-xl bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs text-slate-500">英文名稱</label>
                      <input
                        type="text"
                        placeholder="Meat"
                        value={catForm.nameEn}
                        onChange={(e) => setCatForm({ ...catForm, nameEn: e.target.value })}
                        className="w-full rounded-xl bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-500">日文名稱</label>
                      <input
                        type="text"
                        placeholder="肉類"
                        value={catForm.nameJa}
                        onChange={(e) => setCatForm({ ...catForm, nameJa: e.target.value })}
                        className="w-full rounded-xl bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCatForm(null)}
                      className="flex-1 rounded-xl bg-slate-800 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700"
                    >
                      取消
                    </button>
                    <button
                      onClick={saveCat}
                      disabled={catSaving || !catForm.name}
                      className="flex-1 rounded-xl bg-gradient-to-r from-[#4648d4] to-[#6063ee] py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      {catSaving ? '儲存中…' : '儲存'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          />
          <div className="relative my-4 w-full max-w-lg space-y-5 rounded-2xl bg-slate-900/90 p-6 shadow-2xl backdrop-blur-[12px]">
            <div className="flex items-center justify-between">
              <h2 className="font-['Manrope',sans-serif] font-semibold text-white">
                {isNew ? '新增食物' : '編輯食物'}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <Icon icon="mdi:close" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  { key: 'name', label: '名稱（繁中）', cls: 'sm:col-span-1' },
                  { key: 'nameEn', label: '英文名稱', cls: 'sm:col-span-1' },
                  { key: 'nameJa', label: '日文名稱', cls: 'sm:col-span-1' },
                ] as const
              ).map(({ key, label, cls }) => (
                <div key={key} className={cls}>
                  <label className="mb-1 block text-xs text-slate-400">{label}</label>
                  <input
                    type="text"
                    value={editing[key]}
                    onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                    className="w-full rounded-xl bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
                  />
                </div>
              ))}
            </div>

            {/* Nutrition */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  { key: 'calories', label: '熱量 (kcal)' },
                  { key: 'protein', label: '蛋白質 (g)' },
                  { key: 'carbs', label: '碳水化合物 (g)' },
                  { key: 'fat', label: '脂肪 (g)' },
                  { key: 'fiber', label: '膳食纖維 (g)' },
                  { key: 'sugar', label: '糖 (g)' },
                  { key: 'sodium', label: '鈉 (mg)' },
                ] as const
              ).map(({ key, label }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs text-slate-400">{label}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={editing[key]}
                    onChange={(e) =>
                      setEditing({ ...editing, [key]: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-xl bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs text-slate-400">每份大小</label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min="0"
                    value={editing.servingSize}
                    onChange={(e) =>
                      setEditing({ ...editing, servingSize: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-xl bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
                  />
                  <input
                    type="text"
                    value={editing.servingUnit}
                    placeholder="g"
                    onChange={(e) => setEditing({ ...editing, servingUnit: e.target.value })}
                    className="w-16 rounded-xl bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="mb-1 block text-xs text-slate-400">分類</label>
              <select
                value={editing.categoryId}
                onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })}
                className="w-full rounded-xl bg-slate-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
              >
                <option value="">未分類</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !editing.name}
              className="w-full rounded-xl bg-gradient-to-r from-[#4648d4] to-[#6063ee] py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              {saving ? '儲存中…' : isNew ? '新增食物' : '儲存變更'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
