"use client";

import { useState, useEffect } from "react";
import { Activity, Plus, Edit, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Exercise {
  id: string;
  type: string;
  duration: number; // 分鐘
  calories: number;
  date: Date;
  notes?: string;
}

const EXERCISE_TYPES = [
  { value: "跑步", icon: "🏃", caloriesPerMin: 7 },
  { value: "騎車", icon: "🚴", caloriesPerMin: 6 },
  { value: "游泳", icon: "🏊", caloriesPerMin: 8 },
  { value: "重訓", icon: "🏋️", caloriesPerMin: 5 },
  { value: "瑜珈", icon: "🧘", caloriesPerMin: 3 },
  { value: "健走", icon: "🚶", caloriesPerMin: 4 },
  { value: "籃球", icon: "🏀", caloriesPerMin: 7 },
  { value: "羽球", icon: "🏸", caloriesPerMin: 6 },
  { value: "自訂", icon: "✏️", caloriesPerMin: 5 },
];

const CUSTOM_OPTION = "自訂";

// Exercise type color mapping for stacked chart
const EXERCISE_COLORS: Record<string, string> = {
  跑步: "#ef4444",
  騎車: "#3b82f6",
  游泳: "#06b6d4",
  重訓: "#8b5cf6",
  瑜珈: "#10b981",
  健走: "#f59e0b",
  籃球: "#f97316",
  羽球: "#ec4899",
};
const EXTRA_COLORS = [
  "#14b8a6",
  "#a855f7",
  "#64748b",
  "#e11d48",
  "#0ea5e9",
  "#84cc16",
  "#d946ef",
];

/* eslint-disable @typescript-eslint/no-explicit-any */
function ExerciseChartTooltip({ active, payload, label }: any) {
  const t = useTranslations('exercise');
  if (!active || !payload?.length) return null;
  const filtered = payload.filter((entry: any) => entry.value > 0);
  if (filtered.length === 0) return null;
  const total = filtered.reduce(
    (sum: number, entry: any) => sum + (entry.value || 0),
    0,
  );
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-sm">
      <p className="font-semibold text-gray-900 mb-1.5">📅 {label}</p>
      <div className="space-y-1">
        {filtered.map((entry: any) => {
          const typeInfo = EXERCISE_TYPES.find(
            (t) => t.value === entry.dataKey,
          );
          return (
            <div key={entry.dataKey} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: entry.fill }}
              />
              <span>
                {typeInfo?.icon || "🏃"} {entry.dataKey}: {entry.value} {t('minutesUnit')}
              </span>
            </div>
          );
        })}
      </div>
      {filtered.length > 1 && (
        <p className="text-xs text-gray-500 mt-1.5 pt-1.5 border-t">
          {t('weekSummary', { count: total, duration: total })}
        </p>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function ExercisePage() {
  const t = useTranslations('exercise');
  const tc = useTranslations('common');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<
    "30d" | "3m" | "6m" | "1y" | "2y" | "all" | "custom"
  >("30d");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [formData, setFormData] = useState({
    type: "跑步",
    customType: "",
    duration: "",
    notes: "",
  });

  const loadExercises = async () => {
    try {
      let url = "/api/exercise?limit=1000";

      const today = new Date();
      let startDate = "";
      let endDate = today.toISOString().split("T")[0];

      switch (dateRange) {
        case "30d":
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];
          break;
        case "3m":
          startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];
          break;
        case "6m":
          startDate = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];
          break;
        case "1y":
          startDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];
          break;
        case "2y":
          startDate = new Date(today.getTime() - 730 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];
          break;
        case "all":
          // No date filter
          break;
        case "custom":
          if (customStartDate && customEndDate) {
            startDate = customStartDate;
            endDate = customEndDate;
          }
          break;
      }

      if (dateRange !== "all" && startDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setExercises(data.data?.exercises || []);
    } catch (error) {
      console.error("載入運動記錄失敗:", error);
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

  // Safe type name: only call t() for preset types; show raw value for custom DB types
  const getTypeName = (type: string): string =>
    EXERCISE_TYPES.find((et) => et.value === type) ? t(`types.${type}`) : type;

  const getEffectiveType = () =>
    formData.type === CUSTOM_OPTION
      ? formData.customType.trim()
      : formData.type;

  const getEffectiveCaloriesPerMin = () =>
    EXERCISE_TYPES.find((t) => t.value === formData.type)?.caloriesPerMin ?? 5;

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveType = getEffectiveType();
    if (!effectiveType) return;

    const duration = parseInt(formData.duration);
    const calories = duration * getEffectiveCaloriesPerMin();

    try {
      const res = await fetch("/api/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: effectiveType,
          duration,
          calories,
          date: new Date().toLocaleDateString("en-CA"), // local YYYY-MM-DD, avoids UTC offset
          notes: formData.notes || undefined,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({ type: "跑步", customType: "", duration: "", notes: "" });
        loadExercises();
      }
    } catch (error) {
      console.error("新增運動失敗:", error);
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
        setFormData({ type: "跑步", customType: "", duration: "", notes: "" });
        loadExercises();
      }
    } catch (error) {
      console.error("更新運動失敗:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      const res = await fetch(`/api/exercise?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadExercises();
      }
    } catch (error) {
      console.error("刪除失敗:", error);
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    const isPreset = EXERCISE_TYPES.some(
      (t) => t.value !== CUSTOM_OPTION && t.value === exercise.type,
    );
    setFormData({
      type: isPreset ? exercise.type : CUSTOM_OPTION,
      customType: isPreset ? "" : exercise.type,
      duration: exercise.duration.toString(),
      notes: exercise.notes || "",
    });
    setShowEditModal(true);
  };

  // 動態圖表標題
  const getChartTitle = () => {
    switch (dateRange) {
      case "30d":
        return t('subtitle') + ' (' + t('periodLabels.30d') + ')';
      case "3m":
        return t('subtitle') + ' (' + t('periodLabels.3m') + ')';
      case "6m":
        return t('subtitle') + ' (' + t('periodLabels.6m') + ')';
      case "1y":
        return t('subtitle') + ' (' + t('periodLabels.1y') + ')';
      case "2y":
        return t('subtitle') + '';
      case "all":
        return t('subtitle');
      case "custom":
        if (customStartDate && customEndDate) {
          return t('subtitle') + ` (${customStartDate} ~ ${customEndDate})`;
        }
        return t('subtitle') + ' (' + t('periodLabels.custom') + ')';
      default:
        return t('subtitle');
    }
  };

  // 圖表數據 - 顯示所有篩選後的記錄
  const chartData = (() => {
    // 根據日期範圍決定圖表顯示天數
    let days = 7;
    if (dateRange === "3m") days = 90;
    else if (dateRange === "6m") days = 180;
    else if (dateRange === "1y") days = 365;
    else if (dateRange === "2y") days = 730;
    else if (dateRange === "all")
      days = 365; // 全部記錄顯示最近一年
    else if (dateRange === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      days = Math.ceil(
        (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
      );
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

      const totalDuration = dayExercises.reduce(
        (sum, ex) => sum + ex.duration,
        0,
      );

      return {
        date: date.toLocaleDateString("zh-TW", {
          month: "2-digit",
          day: "2-digit",
        }),
        duration: totalDuration,
        exercises: dayExercises,
      };
    });
  })();

  // 圖表上運動類型篩選
  const uniqueTypes = [...new Set(exercises.map((e) => e.type))];

  const filteredChartData = chartData.map((d) => {
    if (selectedType === "all") return d;
    const filtered = d.exercises.filter((e) => e.type === selectedType);
    return {
      ...d,
      duration: filtered.reduce((s, e) => s + e.duration, 0),
      exercises: filtered,
    };
  });

  // Stacked bar chart — each exercise type gets its own colored bar segment
  const activeChartTypes = [
    ...new Set(
      filteredChartData.flatMap((d) => d.exercises.map((e) => e.type)),
    ),
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
      const dayData = filteredChartData.find(
        (d) => d.date === data.payload.date,
      );
      if (dayData && dayData.exercises.length > 0) {
        setSelectedDayDate(data.payload.date as string);
      }
    }
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">{tc('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-amber-600" />
            {t('title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('weekSummary', { count: weekCount, duration: weekDuration })}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {tc('add')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <span className="text-sm text-gray-600">{t('weekCount')}</span>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {weekCount} <span className="text-lg text-gray-500">{t('timesUnit')}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <span className="text-sm text-gray-600">{t('weekDuration')}</span>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {weekDuration} <span className="text-lg text-gray-500">{t('minutesUnit')}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {t('avgPerDay', { min: Math.round(weekDuration / 7) })}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <span className="text-sm text-gray-600">{t('weekCalories')}</span>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {weekCalories ? Number(weekCalories.toFixed(0)) : 0}{" "}
            <span className="text-lg text-gray-500">kcal</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {getChartTitle()}
        </h2>

        {/* Date Range Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDateRange("30d")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === "30d" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {t('periodLabels.30d')}
            </button>
            <button
              onClick={() => setDateRange("3m")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === "3m" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {t('periodLabels.3m')}
            </button>
            <button
              onClick={() => setDateRange("6m")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === "6m" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {t('periodLabels.6m')}
            </button>
            <button
              onClick={() => setDateRange("1y")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === "1y" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {t('periodLabels.1y')}
            </button>
            <button
              onClick={() => setDateRange("custom")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === "custom" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {t('periodLabels.custom')}
            </button>
          </div>

          {/* 運動類型篩選 */}
          {uniqueTypes.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedType === "all" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
              >
                {t('allTypes')}
              </button>
              {uniqueTypes.map((type) => {
                const info = EXERCISE_TYPES.find((t) => t.value === type);
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedType === type ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
                  >
                    {info?.icon || "🏃"} {type}
                  </button>
                );
              })}
            </div>
          )}

          {/* Custom Date Picker */}
          {dateRange === "custom" && (
            <div className="flex flex-wrap items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('customDateStart')}
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <span className="text-gray-500">~</span>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('customDateEnd')}
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              {customStartDate && customEndDate && (
                <span className="text-sm text-purple-700 font-medium">
                  (
                  {Math.ceil(
                    (new Date(customEndDate).getTime() -
                      new Date(customStartDate).getTime()) /
                      (24 * 60 * 60 * 1000),
                  ) + 1}{" "}
                  {t('daysUnit')}
                </span>
              )}
            </div>
          )}

          <div className="text-sm text-gray-600">
{t('totalCount', { count: exercises.length })}
          </div>
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
                  return `${info?.icon || "🏃"} ${info ? t(`types.${value}`) : value}`;
                }}
                wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              />
            )}
            {activeChartTypes.map((type, i) => (
              <Bar
                key={type}
                dataKey={type}
                stackId="stack"
                fill={
                  EXERCISE_COLORS[type] || EXTRA_COLORS[i % EXTRA_COLORS.length]
                }
                radius={
                  i === activeChartTypes.length - 1
                    ? [4, 4, 0, 0]
                    : [0, 0, 0, 0]
                }
                cursor="pointer"
                onClick={handleBarClick}
                name={type}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 mt-3 text-center">
{t('chartHint')}
        </p>

        {/* Selected Day Detail Panel */}
        {selectedDayData && selectedDayData.exercises.length > 0 && (
          <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">
{t('weekSummary', { count: selectedDayData.exercises.length, duration: selectedDayData.date })}
              </h4>
              <button
                onClick={() => setSelectedDayDate(null)}
                className="p-1 hover:bg-amber-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              {selectedDayData.exercises.map((ex) => {
                const typeInfo = EXERCISE_TYPES.find(
                  (t) => t.value === ex.type,
                );
                const typeColor = EXERCISE_COLORS[ex.type] || "#6b7280";
                return (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${typeColor}18` }}
                      >
                        {typeInfo?.icon || "🏃"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{getTypeName(ex.type)}</p>
                        <p className="text-sm text-gray-500">
                          {ex.duration} {t('minutesUnit')} · {ex.calories.toFixed(0)} kcal
                        </p>
                        {ex.notes && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            📝 {ex.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(ex)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        {tc('edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(ex.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {tc('delete')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-amber-200">
              {t('minutesUnit')}: {selectedDayData.duration}
            </p>
          </div>
        )}
      </div>

      {/* Quick Add Buttons */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">{t('quickRecord')}</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {EXERCISE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                setFormData({ ...formData, type: type.value });
                setShowAddModal(true);
              }}
              className="flex flex-col items-center gap-1 p-3 bg-gray-50 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <span className="text-2xl">{type.icon}</span>
              <span className="text-xs text-gray-700">{t(`types.${type.value}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t('addTitle')}
            </h3>
            <form onSubmit={handleAddExercise} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('exerciseTypeLabel')}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value,
                      customType: "",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {EXERCISE_TYPES.filter((t) => t.value !== CUSTOM_OPTION).map(
                    (type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {t(`types.${type.value}`)}
                      </option>
                    ),
                  )}
                  <option value={CUSTOM_OPTION}>✏️ {t('types.自訂')}</option>
                </select>
                {formData.type === CUSTOM_OPTION && (
                  <input
                    type="text"
                    value={formData.customType}
                    onChange={(e) =>
                      setFormData({ ...formData, customType: e.target.value })
                    }
                    placeholder={t('customTypePlaceholder')}
                    required
                    className="mt-2 w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('durationLabel')}
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                  min="1"
                />
                {formData.duration && (
                  <p className="text-sm text-gray-500 mt-1">
                    {t('estimatedCalories')}{" "}
                    {parseInt(formData.duration) * getEffectiveCaloriesPerMin()}{" "}
                    kcal
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('notesLabel')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {tc('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  {tc('add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t('editTitle')}
            </h3>
            <form onSubmit={handleEditExercise} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('exerciseTypeLabel')}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value,
                      customType: "",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {EXERCISE_TYPES.filter((t) => t.value !== CUSTOM_OPTION).map(
                    (type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {t(`types.${type.value}`)}
                      </option>
                    ),
                  )}
                  <option value={CUSTOM_OPTION}>✏️ {t('types.自訂')}</option>
                </select>
                {formData.type === CUSTOM_OPTION && (
                  <input
                    type="text"
                    value={formData.customType}
                    onChange={(e) =>
                      setFormData({ ...formData, customType: e.target.value })
                    }
                    placeholder={t('customTypePlaceholder')}
                    required
                    className="mt-2 w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('durationLabel')}
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                  min="1"
                />
                {formData.duration && (
                  <p className="text-sm text-gray-500 mt-1">
                    {t('estimatedCalories')}{" "}
                    {parseInt(formData.duration) * getEffectiveCaloriesPerMin()}{" "}
                    kcal
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('notesLabel')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                      type: "跑步",
                      customType: "",
                      duration: "",
                      notes: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {tc('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {tc('update')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
