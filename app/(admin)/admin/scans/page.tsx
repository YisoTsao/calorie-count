'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';

type Status = 'PROCESSING' | 'COMPLETED' | 'FAILED';

interface FoodItem {
  id: string;
  name: string;
  nameEn: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionSize: number;
  portionUnit: string;
  confidence: number | null;
}

interface ScanRecord {
  id: string;
  status: Status;
  confidence: number | null;
  imageUrl: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  foods: FoodItem[];
  _count: { foods: number };
}

const STATUS_LABEL: Record<Status, string> = {
  PROCESSING: '處理中',
  COMPLETED: '已完成',
  FAILED: '失敗',
};

const STATUS_COLOR: Record<Status, string> = {
  PROCESSING: 'text-amber-400 bg-amber-500/10',
  COMPLETED: 'text-emerald-400 bg-emerald-500/10',
  FAILED: 'text-red-400 bg-red-500/10',
};

export default function AdminScansPage() {
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const LIMIT = 20;

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
      ...(status ? { status } : {}),
    });
    const res = await fetch(`/api/admin/scans?${params}`);
    const data = await res.json();
    setRecords(data.records ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, debouncedQ, status]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.ceil(total / LIMIT);

  const totalCalories = (foods: FoodItem[]) =>
    foods.reduce((sum, f) => sum + f.calories, 0).toFixed(0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Manrope',sans-serif] text-2xl font-bold text-white">AI 掃描記錄</h1>
          <p className="mt-1 text-sm text-slate-400">共 {total.toLocaleString()} 筆掃描記錄</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon
            icon="mdi:magnify"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-500"
          />
          <input
            type="text"
            placeholder="搜尋會員姓名或 Email..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-xl bg-slate-900/60 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
        >
          <option value="">所有狀態</option>
          <option value="PROCESSING">處理中</option>
          <option value="COMPLETED">已完成</option>
          <option value="FAILED">失敗</option>
        </select>
      </div>

      {/* Records */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-800/50" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/60 p-12 text-center text-slate-500">
            <Icon icon="mdi:image-search-outline" className="mx-auto mb-3 text-4xl" />
            <p>找不到掃描記錄</p>
          </div>
        ) : (
          records.map((rec) => (
            <div key={rec.id} className="overflow-hidden rounded-2xl bg-slate-900/60">
              {/* Record header row */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* 掃描圖片 */}
                <div
                  className="relative h-14 w-14 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-slate-700 transition-opacity hover:opacity-80"
                  onClick={() => rec.imageUrl && setLightbox(rec.imageUrl)}
                  title={rec.imageUrl ? '點擊放大' : '尚無圖片'}
                >
                  {rec.imageUrl ? (
                    <Image
                      src={rec.imageUrl}
                      alt="掃描圖片"
                      fill
                      className="object-cover"
                      sizes="56px"
                      unoptimized={rec.imageUrl.includes('?')}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-800">
                      <Icon icon="mdi:image-off-outline" className="text-xl text-slate-600" />
                    </div>
                  )}
                </div>

                {/* 會員資訊 */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-700">
                    {rec.user.image ? (
                      <Image
                        src={rec.user.image}
                        alt={rec.user.name ?? ''}
                        fill
                        className="object-cover"
                        sizes="32px"
                        unoptimized={rec.user.image.includes('?')}
                      />
                    ) : (
                      <span className="text-xs font-medium text-slate-300">
                        {(rec.user.name ?? rec.user.email ?? '?')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {rec.user.name ?? '未命名'}
                    </p>
                    <p className="truncate text-xs text-slate-500">{rec.user.email}</p>
                  </div>
                </div>

                {/* 統計資訊 */}
                <div className="hidden flex-shrink-0 text-right sm:block">
                  <p className="text-sm font-medium text-white">
                    {rec._count.foods} 項食物
                  </p>
                  {rec.status === 'COMPLETED' && rec.foods.length > 0 && (
                    <p className="text-xs text-slate-400">{totalCalories(rec.foods)} kcal 合計</p>
                  )}
                </div>

                {/* 信心度 */}
                {rec.confidence != null && (
                  <div className="hidden flex-shrink-0 text-right sm:block">
                    <p className="text-xs text-slate-500">信心度</p>
                    <p className="text-sm font-medium text-white">
                      {(rec.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                )}

                {/* 狀態 */}
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[rec.status]}`}
                >
                  {STATUS_LABEL[rec.status]}
                </span>

                {/* 時間 */}
                <div className="hidden flex-shrink-0 text-right sm:block">
                  <p className="text-xs text-slate-400">
                    {new Date(rec.createdAt).toLocaleDateString('zh-TW')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(rec.createdAt).toLocaleTimeString('zh-TW', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* 展開按鈕 */}
                {rec.foods.length > 0 && (
                  <button
                    onClick={() => setExpanded(expanded === rec.id ? null : rec.id)}
                    className="flex-shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
                    title="展開食物列表"
                  >
                    <Icon
                      icon={expanded === rec.id ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                      className="text-base"
                    />
                  </button>
                )}
              </div>

              {/* Expanded food list */}
              {expanded === rec.id && rec.foods.length > 0 && (
                <div className="border-t border-slate-800/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-800/40">
                        <th className="px-5 py-2 text-left text-xs font-medium text-slate-500">食物名稱</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">份量</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">熱量</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">蛋白質</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">碳水</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">脂肪</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">信心</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {rec.foods.map((food) => (
                        <tr key={food.id} className="hover:bg-slate-800/20">
                          <td className="px-5 py-2.5">
                            <p className="font-medium text-white">{food.name}</p>
                            {food.nameEn && (
                              <p className="text-xs text-slate-500">{food.nameEn}</p>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs text-slate-400">
                            {food.portionSize} {food.portionUnit}
                          </td>
                          <td className="px-4 py-2.5 text-right text-sm font-medium text-white">
                            {food.calories.toFixed(0)} kcal
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs text-blue-400">
                            {food.protein.toFixed(1)}g
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs text-amber-400">
                            {food.carbs.toFixed(1)}g
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs text-rose-400">
                            {food.fat.toFixed(1)}g
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs text-slate-500">
                            {food.confidence != null
                              ? `${(food.confidence * 100).toFixed(0)}%`
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* 合計列 */}
                    <tfoot>
                      <tr className="border-t border-slate-700/60 bg-slate-800/30">
                        <td className="px-5 py-2 text-xs font-medium text-slate-400" colSpan={2}>
                          合計
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-bold text-white">
                          {totalCalories(rec.foods)} kcal
                        </td>
                        <td className="px-4 py-2 text-right text-xs font-medium text-blue-400">
                          {rec.foods.reduce((s, f) => s + f.protein, 0).toFixed(1)}g
                        </td>
                        <td className="px-4 py-2 text-right text-xs font-medium text-amber-400">
                          {rec.foods.reduce((s, f) => s + f.carbs, 0).toFixed(1)}g
                        </td>
                        <td className="px-4 py-2 text-right text-xs font-medium text-rose-400">
                          {rec.foods.reduce((s, f) => s + f.fat, 0).toFixed(1)}g
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          ))
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

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="掃描圖片"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
