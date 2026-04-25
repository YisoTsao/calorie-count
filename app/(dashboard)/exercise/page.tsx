'use client';

import { useState, useEffect } from 'react';
import { Activity, Plus, Edit, Trash2, X } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Exercise {
  id: string;
  type: string;
  duration: number; // 分鐘
  calories: number;
  date: Date;
  notes?: string;
}

const EXERCISE_TYPES = [
  { value: '跑步', icon: '🏃', caloriesPerMin: 7 },
  { value: '騎車', icon: '🚴', caloriesPerMin: 6 },
  { value: '游泳', icon: '🏊', caloriesPerMin: 8 },
  { value: '重訓', icon: '🏋️', caloriesPerMin: 5 },
  { value: '瑜珈', icon: '🧘', caloriesPerMin: 3 },
  { value: '健走', icon: '🚶', caloriesPerMin: 4 },
  { value: '籃球', icon: '🏀', caloriesPerMin: 7 },
  { value: '羽球', icon: '🏸', caloriesPerMin: 6 },
  { value: '自訂', icon: '✏️', caloriesPerMin: 5 },
];

const CUSTOM_OPTION = '自訂';

// Exercise type color mapping for stacked chart
const EXERCISE_COLORS: Record<string, string> = {
  跑步: '#ef4444',
  騎車: '#3b82f6',
  游泳: '#06b6d4',
  重訓: '#8b5cf6',
  瑜珈: '#10b981',
  健走: '#f59e0b',
  籃球: '#f97316',
  羽球: '#ec4899',
};
const EXTRA_COLORS = ['#14b8a6', '#a855f7', '#64748b', '#e11d48', '#0ea5e9', '#84cc16', '#d946ef'];

/* eslint-disable @typescript-eslint/no-explicit-any */
function ExerciseChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const filtered = payload.filter((entry: any) => entry.value > 0);
  if (filtered.length === 0) return null;
  const total = filtered.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg">
      <p className="mb-1.5 font-semibold text-gray-900">📅 {label}</p>
      <div className="space-y-1">
        {filtered.map((entry: any) => {
          const typeInfo = EXERCISE_TYPES.find((t) => t.value === entry.dataKey);
          return (
            <div key={entry.dataKey} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: entry.fill }}
              />
              <span>
                {typeInfo?.icon || '🏃'} {entry.dataKey}: {entry.value} 分鐘
              </span>
            </div>
          );
        })}
      </div>
      {filtered.length > 1 && (
        <p className="mt-1.5 border-t pt-1.5 text-xs text-gray-500">合計: {total} 分鐘</p>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function ExercisePage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'30d' | '3m' | '6m' | '1y' | '2y' | 'all' | 'custom'>(
    '30d'
  );
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [formData, setFormData] = useState({
    type: '跑步',
    customType: '',
    duration: '',
    notes: '',
  });

  const loadExercises = async () => {
    try {
      let url = '/api/exercise?limit=1000';

      const today = new Date();
      let startDate = '';
      let endDate = today.toISOString().split('T')[0];

      switch (dateRange) {
        case '30d':
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];
          break;
        case '3m':
          startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];
          break;
        case '6m':
          startDate = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];
          break;
        case '1y':
          startDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];
          break;
        case '2y':
          startDate = new Date(today.getTime() - 730 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];
          break;
        case 'all':
          // No date filter
          break;
        case 'custom':
          if (customStartDate && customEndDate) {
            startDate = customStartDate;
            endDate = customEndDate;
          }
          break;
      }

      if (dateRange !== 'all' && startDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setExercises(data.data?.exercises || []);
    } catch (error) {
      console.error('載入運動記錄失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, customStartDate, customEndDate]);

  // 統計
  const weekExercises = (() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return exercises.filter((ex) => new Date(ex.date) >= weekAgo);
  })();
  const weekCount = weekExercises.length;
  const weekDuration = weekExercises.reduce((sum, ex) => sum + ex.duration, 0);
  const weekCalories = weekExercises.reduce((sum, ex) => sum + ex.calories, 0);

  const getEffectiveType = () =>
    formData.type === CUSTOM_OPTION ? formData.customType.trim() : formData.type;

  const getEffectiveCaloriesPerMin = () =>
    EXERCISE_TYPES.find((t) => t.value === formData.type)?.caloriesPerMin ?? 5;

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveType = getEffectiveType();
    if (!effectiveType) return;

    const duration = parseInt(formData.duration);
    const calories = duration * getEffectiveCaloriesPerMin();

    try {
      const res = await fetch('/api/exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: effectiveType,
          duration,
          calories,
          notes: formData.notes || undefined,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({ type: '跑步', customType: '', duration: '', notes: '' });
        loadExercises();
      }
    } catch (error) {
      console.error('新增運動失敗:', error);
    }
  };

  const handleEditExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExercise) return;

    const effectiveType = getEffectiveType();
    if (!effectiveType) return;

    const duration = parseInt(formData.duration);
    const calories = duration * getEffectiveCaloriesPerMin();

    try {
      const res = await fetch(`/api/exercise?id=${editingExercise.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: effectiveType,
          duration,
          calories,
          notes: formData.notes || undefined,
        }),
      });

      if (res.ok) {
        setShowEditModal(false);
        setEditingExercise(null);
        setFormData({ type: '跑步', customType: '', duration: '', notes: '' });
        loadExercises();
      }
    } catch (error) {
      console.error('更新運動失敗:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這筆記錄嗎?')) return;

    try {
      const res = await fetch(`/api/exercise?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadExercises();
      }
    } catch (error) {
      console.error('刪除失敗:', error);
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    const isPreset = EXERCISE_TYPES.some(
      (t) => t.value !== CUSTOM_OPTION && t.value === exercise.type
    );
    setFormData({
      type: isPreset ? exercise.type : CUSTOM_OPTION,
      customType: isPreset ? '' : exercise.type,
      duration: exercise.duration.toString(),
      notes: exercise.notes || '',
    });
    setShowEditModal(true);
  };

  // 動態圖表標題
  const getChartTitle = () => {
    switch (dateRange) {
      case '30d':
        return '運動時長趨勢 (最近 30 天)';
      case '3m':
        return '運動時長趨勢 (最近 3 個月)';
      case '6m':
        return '運動時長趨勢 (最近 6 個月)';
      case '1y':
        return '運動時長趨勢 (最近 1 年)';
      case '2y':
        return '運動時長趨勢 (最近 2 年)';
      case 'all':
        return '運動時長趨勢 (全部記錄)';
      case 'custom':
        if (customStartDate && customEndDate) {
          return `運動時長趨勢 (${customStartDate} ~ ${customEndDate})`;
        }
        return '運動時長趨勢 (自訂區間)';
      default:
        return '運動時長趨勢';
    }
  };

  // 圖表數據 - 顯示所有篩選後的記錄
  const chartData = (() => {
    // 根據日期範圍決定圖表顯示天數
    let days = 7;
    if (dateRange === '3m') days = 90;
    else if (dateRange === '6m') days = 180;
    else if (dateRange === '1y') days = 365;
    else if (dateRange === '2y') days = 730;
    else if (dateRange === 'all')
      days = 365; // 全部記錄顯示最近一年
    else if (dateRange === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    }

    return Array.from({ length: Math.min(days, 365) }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (Math.min(days, 365) - 1 - i));
      date.setHours(0, 0, 0, 0);

      const dayExercises = exercises.filter((ex) => {
        const exDate = new Date(ex.date);
        exDate.setHours(0, 0, 0, 0);
        return exDate.getTime() === date.getTime();
      });

      const totalDuration = dayExercises.reduce((sum, ex) => sum + ex.duration, 0);

      return {
        date: date.toLocaleDateString('zh-TW', {
          month: '2-digit',
          day: '2-digit',
        }),
        duration: totalDuration,
        exercises: dayExercises,
      };
    });
  })();

  // 圖表上運動類型篩選
  const uniqueTypes = [...new Set(exercises.map((e) => e.type))];

  const filteredChartData = chartData.map((d) => {
    if (selectedType === 'all') return d;
    const filtered = d.exercises.filter((e) => e.type === selectedType);
    return {
      ...d,
      duration: filtered.reduce((s, e) => s + e.duration, 0),
      exercises: filtered,
    };
  });

  // Stacked bar chart — each exercise type gets its own colored bar segment
  const activeChartTypes = [
    ...new Set(filteredChartData.flatMap((d) => d.exercises.map((e) => e.type))),
  ].sort((a, b) => {
    const iA = EXERCISE_TYPES.findIndex((t) => t.value === a);
    const iB = EXERCISE_TYPES.findIndex((t) => t.value === b);
    return (iA === -1 ? 99 : iA) - (iB === -1 ? 99 : iB);
  });

  const stackedChartData = filteredChartData.map((d) => {
    const entry: Record<string, unknown> = {
      date: d.date,
      exercises: d.exercises,
    };
    for (const type of activeChartTypes) {
      entry[type] = d.exercises
        .filter((e) => e.type === type)
        .reduce((sum, e) => sum + e.duration, 0);
    }
    return entry;
  });

  // Derive selected day data reactively from current exercises
  const selectedDayData = selectedDayDate
    ? (filteredChartData.find((d) => d.date === selectedDayDate) ?? null)
    : null;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleBarClick = (data: any) => {
    if (data?.payload?.date) {
      const dayData = filteredChartData.find((d) => d.date === data.payload.date);
      if (dayData && dayData.exercises.length > 0) {
        setSelectedDayDate(data.payload.date as string);
      }
    }
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <Activity className="h-8 w-8 text-amber-600" />
            運動記錄
          </h1>
          <p className="mt-2 text-gray-600">
            本週: {weekCount} 次 · 總時長: {weekDuration} 分鐘
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-white transition-colors hover:bg-amber-700"
        >
          <Plus className="h-5 w-5" />
          新增運動
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <span className="text-sm text-gray-600">本週運動次數</span>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {weekCount} <span className="text-lg text-gray-500">次</span>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <span className="text-sm text-gray-600">本週運動時長</span>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {weekDuration} <span className="text-lg text-gray-500">分鐘</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">平均每天 {Math.round(weekDuration / 7)} 分鐘</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <span className="text-sm text-gray-600">本週消耗熱量</span>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {weekCalories ? Number(weekCalories.toFixed(0)) : 0}{' '}
            <span className="text-lg text-gray-500">kcal</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-900">{getChartTitle()}</h2>

        {/* Date Range Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDateRange('30d')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${dateRange === '30d' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              最近 30 天
            </button>
            <button
              onClick={() => setDateRange('3m')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${dateRange === '3m' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              最近 3 個月
            </button>
            <button
              onClick={() => setDateRange('6m')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${dateRange === '6m' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              最近 6 個月
            </button>
            <button
              onClick={() => setDateRange('1y')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${dateRange === '1y' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              最近 1 年
            </button>
            <button
              onClick={() => setDateRange('custom')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${dateRange === 'custom' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              自訂區間
            </button>
          </div>

          {/* 運動類型篩選 */}
          {uniqueTypes.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selectedType === 'all' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
              >
                全部類型
              </button>
              {uniqueTypes.map((type) => {
                const info = EXERCISE_TYPES.find((t) => t.value === type);
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selectedType === type ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                  >
                    {info?.icon || '🏃'} {type}
                  </button>
                );
              })}
            </div>
          )}

          {/* Custom Date Picker */}
          {dateRange === 'custom' && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg bg-purple-50 p-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">開始日期:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <span className="text-gray-500">~</span>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">結束日期:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              {customStartDate && customEndDate && (
                <span className="text-sm font-medium text-purple-700">
                  (
                  {Math.ceil(
                    (new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) /
                      (24 * 60 * 60 * 1000)
                  ) + 1}{' '}
                  天)
                </span>
              )}
            </div>
          )}

          <div className="text-sm text-gray-600">總共有 {exercises.length} 筆運動記錄</div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stackedChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip content={<ExerciseChartTooltip />} />
            {activeChartTypes.length > 1 && (
              <Legend
                formatter={(value) => {
                  const info = EXERCISE_TYPES.find((t) => t.value === value);
                  return `${info?.icon || '🏃'} ${value}`;
                }}
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              />
            )}
            {activeChartTypes.map((type, i) => (
              <Bar
                key={type}
                dataKey={type}
                stackId="stack"
                fill={EXERCISE_COLORS[type] || EXTRA_COLORS[i % EXTRA_COLORS.length]}
                radius={i === activeChartTypes.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                cursor="pointer"
                onClick={handleBarClick}
                name={type}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-3 text-center text-xs text-gray-400">
          💡 點擊柱狀可查看該日運動詳情並進行編輯或刪除
        </p>

        {/* Selected Day Detail Panel */}
        {selectedDayData && selectedDayData.exercises.length > 0 && (
          <div className="animate-in fade-in mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 duration-200">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">{selectedDayData.date} 的運動記錄</h4>
              <button
                onClick={() => setSelectedDayDate(null)}
                className="rounded-full p-1 transition-colors hover:bg-amber-100"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              {selectedDayData.exercises.map((ex) => {
                const typeInfo = EXERCISE_TYPES.find((t) => t.value === ex.type);
                const typeColor = EXERCISE_COLORS[ex.type] || '#6b7280';
                return (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                        style={{ backgroundColor: `${typeColor}18` }}
                      >
                        {typeInfo?.icon || '🏃'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{ex.type}</p>
                        <p className="text-sm text-gray-500">
                          {ex.duration} 分鐘 · {ex.calories.toFixed(0)} kcal
                        </p>
                        {ex.notes && <p className="mt-0.5 text-xs text-gray-400">📝 {ex.notes}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(ex)}
                        className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        編輯
                      </button>
                      <button
                        onClick={() => handleDelete(ex.id)}
                        className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        刪除
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 border-t border-amber-200 pt-2 text-xs text-gray-400">
              總計 {selectedDayData.duration} 分鐘
            </p>
          </div>
        )}
      </div>

      {/* Quick Add Buttons */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-sm font-medium text-gray-700">💡 快速記錄</h3>
        <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
          {EXERCISE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                setFormData({ ...formData, type: type.value });
                setShowAddModal(true);
              }}
              className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-amber-50"
            >
              <span className="text-2xl">{type.icon}</span>
              <span className="text-xs text-gray-700">{type.value}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="mb-4 text-xl font-bold text-gray-900">新增運動記錄</h3>
            <form onSubmit={handleAddExercise} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">運動類型</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value,
                      customType: '',
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                >
                  {EXERCISE_TYPES.filter((t) => t.value !== CUSTOM_OPTION).map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.value}
                    </option>
                  ))}
                  <option value={CUSTOM_OPTION}>✏️ 自訂類型</option>
                </select>
                {formData.type === CUSTOM_OPTION && (
                  <input
                    type="text"
                    value={formData.customType}
                    onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                    placeholder="輸入運動名稱"
                    required
                    className="mt-2 w-full rounded-lg border border-amber-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                  />
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  運動時長 (分鐘) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                  required
                  min="1"
                />
                {formData.duration && (
                  <p className="mt-1 text-sm text-gray-500">
                    預估消耗: {parseInt(formData.duration) * getEffectiveCaloriesPerMin()} kcal
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">備註</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-amber-600 px-4 py-2 text-white transition-colors hover:bg-amber-700"
                >
                  新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="mb-4 text-xl font-bold text-gray-900">編輯運動記錄</h3>
            <form onSubmit={handleEditExercise} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">運動類型</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value,
                      customType: '',
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                >
                  {EXERCISE_TYPES.filter((t) => t.value !== CUSTOM_OPTION).map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.value}
                    </option>
                  ))}
                  <option value={CUSTOM_OPTION}>✏️ 自訂類型</option>
                </select>
                {formData.type === CUSTOM_OPTION && (
                  <input
                    type="text"
                    value={formData.customType}
                    onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                    placeholder="輸入運動名稱"
                    required
                    className="mt-2 w-full rounded-lg border border-amber-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                  />
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  運動時長 (分鐘) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                  required
                  min="1"
                />
                {formData.duration && (
                  <p className="mt-1 text-sm text-gray-500">
                    預估消耗: {parseInt(formData.duration) * getEffectiveCaloriesPerMin()} kcal
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">備註</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingExercise(null);
                    setFormData({
                      type: '跑步',
                      customType: '',
                      duration: '',
                      notes: '',
                    });
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
