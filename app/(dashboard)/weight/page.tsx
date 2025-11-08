"use client";

import { useState, useEffect } from "react";
import {
  Scale,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeightRecord {
  id: string;
  date: Date;
  weight: number;
  bmi: number;
  bodyFat?: number;
  note?: string;
}

interface UserGoals {
  targetWeight?: number;
  height?: number;
}

export default function WeightPage() {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [goals, setGoals] = useState<UserGoals>({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WeightRecord | null>(null);
  const [formData, setFormData] = useState({
    weight: "",
    bodyFat: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  // 日期篩選相關狀態
  const [dateRange, setDateRange] = useState<
    "30d" | "3m" | "6m" | "1y" | "2y" | "all" | "custom"
  >("30d");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    loadRecords();
    loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, customStartDate, customEndDate]);

  const loadRecords = async () => {
    try {
      // 根據選擇的日期範圍構建 API 查詢參數
      let url = "/api/weight?limit=1000"; // 增加 limit 以獲取更多歷史資料

      if (dateRange === "custom" && customStartDate && customEndDate) {
        url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      } else if (dateRange !== "all") {
        const endDate = new Date();
        const startDate = new Date();

        switch (dateRange) {
          case "30d":
            startDate.setDate(startDate.getDate() - 30);
            break;
          case "3m":
            startDate.setMonth(startDate.getMonth() - 3);
            break;
          case "6m":
            startDate.setMonth(startDate.getMonth() - 6);
            break;
          case "1y":
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
          case "2y":
            startDate.setFullYear(startDate.getFullYear() - 2);
            break;
        }

        url += `&startDate=${startDate.toISOString().split("T")[0]}&endDate=${
          endDate.toISOString().split("T")[0]
        }`;
      }

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("載入失敗");
      }

      const data = await res.json();
      console.log("載入的體重資料:", data);

      // API 回傳結構是 { success: true, data: { records: [...], stats: {...} } }
      if (data.success && data.data && Array.isArray(data.data.records)) {
        setRecords(data.data.records);
      } else {
        console.error("資料格式錯誤:", data);
        setRecords([]);
      }
    } catch (error) {
      console.error("載入體重記錄失敗:", error);
      setRecords([]); // 錯誤時設為空陣列
    } finally {
      setLoading(false);
    }
  };

  const loadGoals = async () => {
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      setGoals({
        targetWeight: data.targetWeight,
        height: data.height,
      });
    } catch (error) {
      console.error("載入目標失敗:", error);
    }
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();

    // 前端驗證
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      alert("請輸入有效的體重");
      return;
    }

    try {
      console.log("準備新增體重:", formData);

      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(formData.weight),
          bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
          notes: formData.note || undefined, // 修正: note -> notes
          date: formData.date, // 添加日期
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "新增失敗");
      }

      const data = await res.json();
      console.log("新增成功:", data);

      setShowAddModal(false);
      setFormData({
        weight: "",
        bodyFat: "",
        note: "",
        date: new Date().toISOString().split("T")[0],
      });
      await loadRecords(); // 確保重新載入
    } catch (error) {
      console.error("新增體重失敗:", error);
      alert(error instanceof Error ? error.message : "新增失敗,請稍後再試");
    }
  };

  const handleEditWeight = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingRecord) return;

    // 前端驗證
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      alert("請輸入有效的體重");
      return;
    }

    try {
      const res = await fetch("/api/weight", {
        method: "PUT", // 使用 PUT 方法編輯
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(formData.weight),
          bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
          notes: formData.note || undefined,
          date: formData.date, // 用於識別要更新的記錄
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "更新失敗");
      }

      setShowAddModal(false);
      setEditingRecord(null);
      setFormData({
        weight: "",
        bodyFat: "",
        note: "",
        date: new Date().toISOString().split("T")[0],
      });
      await loadRecords();
    } catch (error) {
      console.error("更新體重失敗:", error);
      alert(error instanceof Error ? error.message : "更新失敗,請稍後再試");
    }
  };

  const handleOpenEdit = (record: WeightRecord) => {
    setEditingRecord(record);
    setFormData({
      weight: record.weight.toString(),
      bodyFat: record.bodyFat?.toString() || "",
      note: record.note || "",
      date: new Date(record.date).toISOString().split("T")[0],
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除這筆記錄嗎?")) return;

    try {
      console.log("準備刪除記錄:", id);

      // 找到該記錄的日期
      const record = records.find((r) => r.id === id);
      if (!record) {
        throw new Error("找不到記錄");
      }

      const dateString = new Date(record.date).toISOString().split("T")[0];

      const res = await fetch(`/api/weight?date=${dateString}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "刪除失敗");
      }

      console.log("刪除成功");
      await loadRecords();
    } catch (error) {
      console.error("刪除失敗:", error);
      alert(error instanceof Error ? error.message : "刪除失敗,請稍後再試");
    }
  };

  const currentWeight = records.length > 0 ? records[0].weight : 0;
  const currentBMI = records.length > 0 ? records[0].bmi : 0;
  const targetWeight = goals.targetWeight || 0;
  const weightDiff = currentWeight - targetWeight;

  // BMI 分類
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "過輕", color: "text-blue-600" };
    if (bmi < 24) return { label: "正常", color: "text-green-600" };
    if (bmi < 27) return { label: "過重", color: "text-orange-600" };
    return { label: "肥胖", color: "text-red-600" };
  };

  // 趨勢計算
  const getTrend = () => {
    if (records.length < 2) return null;
    const diff = records[0].weight - records[1].weight;
    if (Math.abs(diff) < 0.1)
      return { label: "持平", icon: null, color: "text-gray-600" };
    if (diff > 0)
      return {
        label: `+${diff.toFixed(1)}kg`,
        icon: TrendingUp,
        color: "text-red-600",
      };
    return {
      label: `${diff.toFixed(1)}kg`,
      icon: TrendingDown,
      color: "text-green-600",
    };
  };

  const bmiCategory = getBMICategory(currentBMI);
  const trend = getTrend();

  // 圖表數據 - 根據篩選結果顯示
  const chartData = records
    .slice()
    .reverse()
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString("zh-TW", {
        month: "2-digit",
        day: "2-digit",
      }),
      weight: r.weight,
    }));

  // 取得圖表標題
  const getChartTitle = () => {
    switch (dateRange) {
      case "30d":
        return "體重趨勢 (最近 30 天)";
      case "3m":
        return "體重趨勢 (最近 3 個月)";
      case "6m":
        return "體重趨勢 (最近 6 個月)";
      case "1y":
        return "體重趨勢 (最近 1 年)";
      case "2y":
        return "體重趨勢 (最近 2 年)";
      case "all":
        return "體重趨勢 (全部記錄)";
      case "custom":
        if (customStartDate && customEndDate) {
          return `體重趨勢 (${customStartDate} ~ ${customEndDate})`;
        }
        return "體重趨勢 (自訂區間)";
      default:
        return "體重趨勢";
    }
  };

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
            <Scale className="w-8 h-8 text-purple-600" />
            體重管理
          </h1>
          <p className="text-gray-600 mt-2">追蹤您的體重變化與 BMI</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新增記錄
        </button>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">當前體重</span>
            {trend && trend.icon && (
              <trend.icon className={`w-5 h-5 ${trend.color}`} />
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {currentWeight.toFixed(1)}{" "}
            <span className="text-lg text-gray-500">kg</span>
          </div>
          {trend && (
            <p className={`text-sm mt-1 ${trend.color}`}>{trend.label}</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <span className="text-sm text-gray-600">BMI</span>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {currentBMI.toFixed(1)}
          </div>
          <p className={`text-sm mt-1 font-medium ${bmiCategory.color}`}>
            {bmiCategory.label}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <Target className="w-4 h-4" />
            目標體重
          </span>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {targetWeight > 0 ? targetWeight.toFixed(1) : "--"}{" "}
            <span className="text-lg text-gray-500">kg</span>
          </div>
          {targetWeight > 0 && (
            <p
              className={`text-sm mt-1 ${
                weightDiff > 0 ? "text-orange-600" : "text-green-600"
              }`}
            >
              {weightDiff > 0 ? "需減少" : "已達成"}{" "}
              {Math.abs(weightDiff).toFixed(1)}kg
            </p>
          )}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📅 查看期間
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setDateRange("30d")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === "30d"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            最近 30 天
          </button>
          <button
            onClick={() => setDateRange("3m")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === "3m"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            最近 3 個月
          </button>
          <button
            onClick={() => setDateRange("6m")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === "6m"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            最近 6 個月
          </button>
          <button
            onClick={() => setDateRange("1y")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === "1y"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            最近 1 年
          </button>
          <button
            onClick={() => setDateRange("2y")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === "2y"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            最近 2 年
          </button>
          <button
            onClick={() => setDateRange("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === "all"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            全部記錄
          </button>
          <button
            onClick={() => setDateRange("custom")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === "custom"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            自訂區間
          </button>
        </div>

        {/* Custom Date Range Inputs */}
        {dateRange === "custom" && (
          <div className="flex flex-wrap gap-3 items-center p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                開始日期:
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                結束日期:
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            {customStartDate && customEndDate && (
              <span className="text-sm text-gray-600">
                共{" "}
                {Math.ceil(
                  (new Date(customEndDate).getTime() -
                    new Date(customStartDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                天
              </span>
            )}
          </div>
        )}

        <p className="text-sm text-gray-500 mt-3">
          顯示 {records.length} 筆記錄
        </p>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📈 {getChartTitle()}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis
                domain={["dataMin - 2", "dataMax + 2"]}
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#9333ea"
                strokeWidth={3}
                dot={{ fill: "#9333ea", r: 4 }}
                name="體重 (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Records List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📋 記錄列表</h2>
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">
                    {new Date(record.date).toLocaleDateString("zh-TW")}
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    {record.weight.toFixed(1)} kg
                  </span>
                  <span className="text-sm text-gray-600">
                    BMI: {record.bmi.toFixed(1)}
                  </span>
                  {record.bodyFat && (
                    <span className="text-sm text-gray-600">
                      體脂: {record.bodyFat.toFixed(1)}%
                    </span>
                  )}
                </div>
                {record.note && (
                  <p className="text-sm text-gray-500 mt-1">{record.note}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(record)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="編輯"
                >
                  <Scale className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="刪除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {records.length === 0 && (
            <div className="text-center py-12">
              <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">還沒有體重記錄</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-purple-600 hover:underline"
              >
                新增第一筆記錄
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingRecord) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingRecord ? "編輯體重記錄" : "新增體重記錄"}
            </h3>
            <form
              onSubmit={editingRecord ? handleEditWeight : handleAddWeight}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日期 *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  體重 (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  體脂率 (%) 選填
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bodyFat}
                  onChange={(e) =>
                    setFormData({ ...formData, bodyFat: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備註 選填
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRecord(null);
                    setFormData({
                      weight: "",
                      bodyFat: "",
                      note: "",
                      date: new Date().toISOString().split("T")[0],
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingRecord ? "更新" : "新增"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
