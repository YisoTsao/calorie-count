"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Scale,
  Plus,
  TrendingDown,
  TrendingUp,
  Target,
  Edit,
  Trash2,
  X,
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
  notes?: string;
}

interface UserGoals {
  targetWeight?: number;
  height?: number;
}

interface ChartDataPoint {
  date: string;
  fullDate: string;
  weight: number;
  bmi: number;
  bodyFat?: number;
  recordId: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function WeightHoverTooltip({ active, payload }: any) {
  const t = useTranslations('weight');
  if (!active || !payload?.length) return null;
  const data = payload[0].payload as ChartDataPoint;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-sm">
      <p className="font-semibold text-gray-900 mb-1">{data.fullDate}</p>
      <p className="text-purple-600">{t('weightKg')}: <span className="font-bold">{data.weight.toFixed(1)} kg</span></p>
      <p>BMI: <span className="font-bold">{data.bmi.toFixed(1)}</span></p>
      {data.bodyFat != null && <p>{t('bodyFatKg')}: <span className="font-bold">{data.bodyFat.toFixed(1)}%</span></p>}
      <p className="text-xs text-gray-400 mt-1.5 pt-1.5 border-t">{t('clickHint')}</p>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function WeightPage() {
  const t = useTranslations('weight');
  const tc = useTranslations('common');
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [goals, setGoals] = useState<UserGoals>({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WeightRecord | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    weight: "",
    bodyFat: "",
    note: "",
    date: new Date().toLocaleDateString("en-CA"),
  });

  const [dateRange, setDateRange] = useState<
    "30d" | "3m" | "6m" | "1y" | "2y" | "all" | "custom"
  >("30d");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      alert(t('weight') + ' ' + tc('error'));
      return;
    }
    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(formData.weight),
          bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
          notes: formData.note || undefined,
          date: formData.date,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || t('addFailed'));
      }
      setShowAddModal(false);
      setFormData({ weight: "", bodyFat: "", note: "", date: new Date().toLocaleDateString("en-CA") });
      setReloadKey((k) => k + 1);
    } catch (error) {
      console.error('Failed to add weight:', error);
      alert(error instanceof Error ? error.message : t('addFailed'));
    }
  };

  const handleEditWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      alert(t('invalidWeight'));
      return;
    }
    try {
      const res = await fetch("/api/weight", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(formData.weight),
          bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
          notes: formData.note || undefined,
          date: formData.date,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || t('updateFailed'));
      }
      setShowAddModal(false);
      setEditingRecord(null);
      setFormData({ weight: "", bodyFat: "", note: "", date: new Date().toLocaleDateString("en-CA") });
      setReloadKey((k) => k + 1);
    } catch (error) {
      console.error('Failed to update weight:', error);
      alert(error instanceof Error ? error.message : t('updateFailed'));
    }
  };

  const handleOpenEdit = (record: WeightRecord) => {
    setEditingRecord(record);
    setFormData({
      weight: record.weight.toString(),
      bodyFat: record.bodyFat?.toString() || "",
      note: record.notes || "",
      date: new Date(record.date).toISOString().split("T")[0],
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      const record = records.find((r) => r.id === id);
      if (!record) throw new Error("找不到記錄");
      const dateString = new Date(record.date).toISOString().split("T")[0];
      const res = await fetch(`/api/weight?date=${dateString}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || t('deleteFailed'));
      }
      setSelectedRecordId(null);
      setReloadKey((k) => k + 1);
    } catch (error) {
      console.error('Failed to delete weight:', error);
      alert(error instanceof Error ? error.message : t('deleteFailed'));
    }
  };

  const currentWeight = records.length > 0 ? records[0].weight : 0;
  const currentBMI = records.length > 0 ? records[0].bmi : 0;
  const targetWeight = goals.targetWeight || 0;
  const weightDiff = currentWeight - targetWeight;

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: t('bmiCategory.underweight'), color: "text-blue-600" };
    if (bmi < 24) return { label: t('bmiCategory.normal'), color: "text-green-600" };
    if (bmi < 27) return { label: t('bmiCategory.overweight'), color: "text-orange-600" };
    return { label: t('bmiCategory.obese'), color: "text-red-600" };
  };

  const getTrend = () => {
    if (records.length < 2) return null;
    const diff = records[0].weight - records[1].weight;
    if (Math.abs(diff) < 0.1) return { label: t('stable'), icon: null, color: "text-gray-600" };
    if (diff > 0) return { label: `+${diff.toFixed(1)}kg`, icon: TrendingUp, color: "text-red-600" };
    return { label: `${diff.toFixed(1)}kg`, icon: TrendingDown, color: "text-green-600" };
  };

  const bmiCategory = getBMICategory(currentBMI);
  const trend = getTrend();

  const chartData: ChartDataPoint[] = records
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit" }),
      fullDate: new Date(r.date).toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" }),
      weight: r.weight,
      bmi: r.bmi,
      bodyFat: r.bodyFat,
      recordId: r.id,
    }));

  const getChartTitle = () => {
    switch (dateRange) {
      case "30d": return t('chart.title') + ' (' + t('periodLabels.30d') + ')';
      case "3m": return t('chart.title') + ' (' + t('periodLabels.3m') + ')';
      case "6m": return t('chart.title') + ' (' + t('periodLabels.6m') + ')';
      case "1y": return t('chart.title') + ' (' + t('periodLabels.1y') + ')';
      case "2y": return t('chart.title') + ' (' + t('periodLabels.2y') + ')';
      case "all": return t('chart.title') + ' (' + t('periodLabels.all') + ')';
      case "custom":
        if (customStartDate && customEndDate) return t('chart.title') + ` (${customStartDate} ~ ${customEndDate})`;
        return t('chart.title') + ' (' + t('periodLabels.custom') + ')';
      default: return t('chart.title');
    }
  };

  // Derive selected point data reactively from current records
  const selectedPointData = selectedRecordId
    ? chartData.find(p => p.recordId === selectedRecordId) ?? null
    : null;
  const selectedRecord = selectedRecordId
    ? records.find(r => r.id === selectedRecordId) ?? null
    : null;

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const res = await fetch("/api/goals");
        const data = await res.json();
        const profile = data.data?.profile;
        setGoals({
          targetWeight: profile?.targetWeight ?? undefined,
          height: profile?.height ?? undefined,
        });
      } catch (error) {
        console.error("載入目標失敗:", error);
      }
    };
    void loadGoals();
  }, []);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        let url = "/api/weight?limit=1000";
        if (dateRange === "custom" && customStartDate && customEndDate) {
          url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
        } else if (dateRange !== "all") {
          const endDate = new Date();
          const startDate = new Date();
          switch (dateRange) {
            case "30d": startDate.setDate(startDate.getDate() - 30); break;
            case "3m": startDate.setMonth(startDate.getMonth() - 3); break;
            case "6m": startDate.setMonth(startDate.getMonth() - 6); break;
            case "1y": startDate.setFullYear(startDate.getFullYear() - 1); break;
            case "2y": startDate.setFullYear(startDate.getFullYear() - 2); break;
          }
          url += `&startDate=${startDate.toISOString().split("T")[0]}&endDate=${endDate.toISOString().split("T")[0]}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error("載入失敗");
        const data = await res.json();
        if (data.success && data.data && Array.isArray(data.data.records)) {
          setRecords(data.data.records);
        } else {
          setRecords([]);
        }
      } catch (error) {
        console.error("載入體重記錄失敗:", error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    void loadRecords();
  }, [dateRange, customStartDate, customEndDate, reloadKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">{tc('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Scale className="w-8 h-8 text-purple-600" />
            {t('title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('subtitle')}</p>
        </div>
        <button
          onClick={() => {
            setEditingRecord(null);
            setFormData({ weight: "", bodyFat: "", note: "", date: new Date().toLocaleDateString("en-CA") });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('addRecord')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{t('currentWeight')}</span>
            {trend && trend.icon && <trend.icon className={`w-5 h-5 ${trend.color}`} />}
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {currentWeight.toFixed(1)} <span className="text-lg text-gray-500">kg</span>
          </div>
          {trend && <p className={`text-sm mt-1 ${trend.color}`}>{trend.label}</p>}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <span className="text-sm text-gray-600">BMI</span>
          <div className="text-3xl font-bold text-gray-900 mt-2">{currentBMI.toFixed(1)}</div>
          <p className={`text-sm mt-1 font-medium ${bmiCategory.color}`}>{bmiCategory.label}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <Target className="w-4 h-4" />
            {t('targetWeightLabel')}
          </span>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {targetWeight > 0 ? targetWeight.toFixed(1) : "--"}{" "}
            <span className="text-lg text-gray-500">kg</span>
          </div>
          {targetWeight > 0 && (
            <p className={`text-sm mt-1 ${weightDiff > 0 ? "text-orange-600" : "text-green-600"}`}>
              {weightDiff > 0 ? t('needToLose') : t('achieved')} {Math.abs(weightDiff).toFixed(1)}kg
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('viewPeriod')}</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {(["30d", "3m", "6m", "1y", "2y", "custom"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setDateRange(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${dateRange === key ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {t(`periodLabels.${key}`)}
            </button>
          ))}
        </div>
        {dateRange === "custom" && (
          <div className="flex flex-wrap gap-3 items-center p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">{t('viewPeriod')} -</label>
              <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700"></label>
              <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
          </div>
        )}
        <p className="text-sm text-gray-500 mt-3">{t('recordCount', { count: records.length })}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{getChartTitle()}</h2>
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData} margin={{ right: 50, left: 0, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip content={<WeightHoverTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#9333ea"
                  strokeWidth={3}
                  /* eslint-disable @typescript-eslint/no-explicit-any */
                  dot={(props: any) => {
                    const { cx, cy, payload, key } = props;
                    if (cx == null || cy == null) return <circle key={key} />;
                    return (
                      <circle
                        key={key}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill="#9333ea"
                        stroke="#fff"
                        strokeWidth={2}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (payload?.recordId) setSelectedRecordId(payload.recordId);
                        }}
                      />
                    );
                  }}
                  activeDot={(props: any) => {
                    const { cx, cy, payload, key } = props;
                    if (cx == null || cy == null) return <circle key={key} />;
                    return (
                      <circle
                        key={key}
                        cx={cx}
                        cy={cy}
                        r={7}
                        fill="#9333ea"
                        stroke="#fff"
                        strokeWidth={3}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (payload?.recordId) setSelectedRecordId(payload.recordId);
                        }}
                      />
                    );
                  }}
                  name={t('weightKg')}
                  /* eslint-enable @typescript-eslint/no-explicit-any */
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-400 mt-3 text-center">{t('chartHint')}</p>
          </>
        ) : (
          <div className="text-center py-16">
            <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('noRecordsEmpty')}</p>
            <button onClick={() => setShowAddModal(true)} className="mt-4 text-purple-600 hover:underline">{t('addFirstRecord')}</button>
          </div>
        )}

        {/* Selected Point Detail Panel */}
        {selectedPointData && (
          <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{t('recordDateOf', { date: selectedPointData.fullDate })}</h4>
              <button onClick={() => setSelectedRecordId(null)} className="p-1 hover:bg-purple-100 rounded-full transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-500">{t('weight')}</p>
                <p className="text-lg font-bold text-purple-600">{selectedPointData.weight.toFixed(1)} kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">BMI</p>
                <p className="text-lg font-bold text-gray-900">{selectedPointData.bmi.toFixed(1)}</p>
              </div>
              {selectedPointData.bodyFat != null && (
                <div>
                  <p className="text-xs text-gray-500">{t('bodyFat')}</p>
                  <p className="text-lg font-bold text-gray-900">{selectedPointData.bodyFat.toFixed(1)}%</p>
                </div>
              )}
            </div>
            {selectedRecord?.notes && (
              <p className="text-sm text-gray-600 mb-3 bg-white rounded-lg p-2.5 border border-purple-100">{selectedRecord.notes}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { if (selectedRecord) handleOpenEdit(selectedRecord); }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                {tc('edit')}
              </button>
              <button
                onClick={() => { if (selectedRecord) handleDelete(selectedRecord.id); }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {tc('delete')}
              </button>
            </div>
          </div>
        )}
      </div>

      {(showAddModal || editingRecord) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{editingRecord ? t('editRecord') : t('addRecord')}</h3>
            <form onSubmit={editingRecord ? handleEditWeight : handleAddWeight} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')} *</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('weight')} (kg) *</label>
                <input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('bodyFat')} (%)</label>
                <input type="number" step="0.1" value={formData.bodyFat} onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes')}</label>
                <textarea value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" rows={3} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingRecord(null); setFormData({ weight: "", bodyFat: "", note: "", date: new Date().toLocaleDateString("en-CA") }); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">{tc('cancel')}</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">{editingRecord ? tc('update') : tc('add')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
