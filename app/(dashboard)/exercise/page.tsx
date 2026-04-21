"use client";

import { useState, useEffect } from "react";
import { Activity, Plus, Trash2, Filter, Edit } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

export default function ExercisePage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">(
    "week",
  );
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

  useEffect(() => {
    loadExercises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, customStartDate, customEndDate]);

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
      const res = await fetch("/api/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: effectiveType,
          duration,
          calories,
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
    if (!confirm("確定要刪除這筆記錄嗎?")) return;

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
      (t) => t.value !== CUSTOM_OPTION && t.value === exercise.type
    );
    setFormData({
      type: isPreset ? exercise.type : CUSTOM_OPTION,
      customType: isPreset ? "" : exercise.type,
      duration: exercise.duration.toString(),
      notes: exercise.notes || "",
    });
    setShowEditModal(true);
  };

  const handleQuickAdd = (type: string) => {
    setFormData({ ...formData, type });
    setShowAddModal(true);
  };

  // 篩選
  const filteredExercises = exercises.filter((ex) => {
    if (selectedType !== "all" && ex.type !== selectedType) return false;

    const now = new Date();
    const exDate = new Date(ex.date);
    if (selectedPeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return exDate >= weekAgo;
    } else {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return exDate >= monthAgo;
    }
  });

  // 統計
  const weekExercises = exercises.filter((ex) => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(ex.date) >= weekAgo;
  });

  const weekCount = weekExercises.length;
  const weekDuration = weekExercises.reduce((sum, ex) => sum + ex.duration, 0);
  const weekCalories = weekExercises.reduce((sum, ex) => sum + ex.calories, 0);

  // 動態圖表標題
  const getChartTitle = () => {
    switch (dateRange) {
      case "30d":
        return "運動時長趨勢 (最近 30 天)";
      case "3m":
        return "運動時長趨勢 (最近 3 個月)";
      case "6m":
        return "運動時長趨勢 (最近 6 個月)";
      case "1y":
        return "運動時長趨勢 (最近 1 年)";
      case "2y":
        return "運動時長趨勢 (最近 2 年)";
      case "all":
        return "運動時長趨勢 (全部記錄)";
      case "custom":
        if (customStartDate && customEndDate) {
          return `運動時長趨勢 (${customStartDate} ~ ${customEndDate})`;
        }
        return "運動時長趨勢 (自訂區間)";
      default:
        return "運動時長趨勢";
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
      };
    });
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">載入中...</div>
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
            運動記錄
          </h1>
          <p className="text-gray-600 mt-2">
            本週: {weekCount} 次 · 總時長: {weekDuration} 分鐘
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新增運動
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <span className="text-sm text-gray-600">本週運動次數</span>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {weekCount} <span className="text-lg text-gray-500">次</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <span className="text-sm text-gray-600">本週運動時長</span>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {weekDuration} <span className="text-lg text-gray-500">分鐘</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            平均每天 {Math.round(weekDuration / 7)} 分鐘
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <span className="text-sm text-gray-600">本週消耗熱量</span>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {weekCalories ? Number(weekCalories.toFixed(0)) : 0}{" "}
            <span className="text-lg text-gray-500">kcal</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          📊 {getChartTitle()}
        </h2>

        {/* Date Range Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDateRange("30d")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === "30d"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              最近 30 天
            </button>
            <button
              onClick={() => setDateRange("3m")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === "3m"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              最近 3 個月
            </button>
            <button
              onClick={() => setDateRange("6m")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === "6m"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              最近 6 個月
            </button>
            <button
              onClick={() => setDateRange("1y")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === "1y"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              最近 1 年
            </button>
            <button
              onClick={() => setDateRange("2y")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === "2y"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              最近 2 年
            </button>
            <button
              onClick={() => setDateRange("custom")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === "custom"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              自訂區間
            </button>
          </div>

          {/* Custom Date Picker */}
          {dateRange === "custom" && (
            <div className="flex flex-wrap items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  開始日期:
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
                  結束日期:
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
                  天)
                </span>
              )}
            </div>
          )}

          <div className="text-sm text-gray-600">
            📊 總共有 {exercises.length} 筆運動記錄
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar
              dataKey="duration"
              fill="#f59e0b"
              radius={[8, 8, 0, 0]}
              name="運動時長 (分鐘)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">篩選:</span>
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">全部類型</option>
          {EXERCISE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.value}
            </option>
          ))}
        </select>
        <select
          value={selectedPeriod}
          onChange={(e) =>
            setSelectedPeriod(e.target.value as "week" | "month")
          }
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
        >
          <option value="week">本週</option>
          <option value="month">本月</option>
        </select>
      </div>

      {/* Quick Add Buttons */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">💡 快速記錄</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {EXERCISE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => handleQuickAdd(type.value)}
              className="flex flex-col items-center gap-1 p-3 bg-gray-50 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <span className="text-2xl">{type.icon}</span>
              <span className="text-xs text-gray-700">{type.value}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📋 記錄列表</h2>
        <div className="space-y-3">
          {filteredExercises.map((exercise) => {
            const typeInfo = EXERCISE_TYPES.find(
              (t) => t.value === exercise.type,
            );
            return (
              <div
                key={exercise.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{typeInfo?.icon || "🏃"}</div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-gray-900">
                        {exercise.type}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(exercise.date).toLocaleString("zh-TW", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-600">
                        {exercise.duration} 分鐘
                      </span>
                      <span className="text-sm text-orange-600 font-medium">
                        {exercise.calories.toFixed(0)} kcal
                      </span>
                    </div>
                    {exercise.notes && (
                      <p className="text-sm text-gray-500 mt-1">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(exercise)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exercise.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredExercises.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {selectedType === "all"
                  ? "還沒有運動記錄"
                  : "沒有符合的運動記錄"}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-amber-600 hover:underline"
              >
                新增第一筆記錄
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              新增運動記錄
            </h3>
            <form onSubmit={handleAddExercise} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  運動類型
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value, customType: "" })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                    className="mt-2 w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  運動時長 (分鐘) *
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
                    預估消耗:{" "}
                    {parseInt(formData.duration) * getEffectiveCaloriesPerMin()}{" "}
                    kcal
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備註 選填
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
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              編輯運動記錄
            </h3>
            <form onSubmit={handleEditExercise} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  運動類型
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value, customType: "" })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                    className="mt-2 w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  運動時長 (分鐘) *
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
                    預估消耗:{" "}
                    {parseInt(formData.duration) * getEffectiveCaloriesPerMin()}{" "}
                    kcal
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備註 選填
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
                    setFormData({ type: "跑步", customType: "", duration: "", notes: "" });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
