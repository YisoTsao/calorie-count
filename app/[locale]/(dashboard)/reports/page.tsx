'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { FileText, Download, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ReportData {
  period: string;
  stats: {
    totalDays: number;
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFat: number;
    avgWater: number;
    avgExercise: number;
    goalsMetDays: number;
  };
  dailyData: Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
    exercise: number;
  }>;
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

export default function ReportsPage() {
  const t = useTranslations('reports');
  const tc = useTranslations('common');
  const [reportType, setReportType] = useState<'week' | 'month' | 'custom'>('week');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toLocaleDateString('en-CA');
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toLocaleDateString('en-CA'));

  const loadReport = async () => {
    setLoading(true);
    try {
      let url: string;
      if (reportType === 'custom') {
        if (!customStartDate || !customEndDate) {
          setLoading(false);
          return;
        }
        url = `/api/stats?startDate=${customStartDate}&endDate=${customEndDate}`;
      } else {
        const days = reportType === 'month' ? 30 : 7;
        const endDate = new Date().toLocaleDateString('en-CA');
        const startDate = new Date(Date.now() - (days - 1) * 86400000).toLocaleDateString('en-CA');
        url = `/api/stats?startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      interface StatRecord {
        date: string;
        totalCalories: number;
        totalProtein: number;
        totalCarbs: number;
        totalFat: number;
        totalWater: number;
        totalExercise: number;
      }

      const dailyData = (data.stats || []).map((s: StatRecord) => ({
        date: new Date(s.date).toLocaleDateString('zh-TW', {
          month: '2-digit',
          day: '2-digit',
        }),
        calories: s.totalCalories,
        protein: s.totalProtein,
        carbs: s.totalCarbs,
        fat: s.totalFat,
        water: s.totalWater,
        exercise: s.totalExercise,
      }));

      setReportData({
        period:
          reportType === 'week'
            ? t('weekly')
            : reportType === 'month'
              ? t('monthly')
              : `${customStartDate} ~ ${customEndDate}`,
        stats: data.summary || {
          totalDays: 0,
          avgCalories: 0,
          avgProtein: 0,
          avgCarbs: 0,
          avgFat: 0,
          avgWater: 0,
          avgExercise: 0,
          goalsMetDays: 0,
        },
        dailyData,
      });
    } catch (error) {
      console.error('載入報表失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType !== 'custom') {
      loadReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  const handleExportCSV = () => {
    if (!reportData) return;

    const headers = [
      t('tableDate'),
      t('tableCalories'),
      t('tableProtein'),
      t('tableCarbs'),
      t('tableFat'),
      t('tableWater'),
      t('tableExercise'),
    ];
    const rows = reportData.dailyData.map((d) => [
      d.date,
      d.calories.toFixed(0),
      d.protein.toFixed(1),
      d.carbs.toFixed(1),
      d.fat.toFixed(1),
      d.water.toString(),
      d.exercise.toString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        {/* 頁首 + 控制列 */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        {/* 摘要卡片 x4 */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        {/* 圖表 x2 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
        {/* 資料表 */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded" />
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-gray-500">{tc('error')}</div>
      </div>
    );
  }

  // 營養素圓餅圖數據
  const nutrientPieData = [
    {
      name: t('protein'),
      value: Number(reportData?.stats?.avgProtein.toFixed(2)),
      color: '#ef4444',
    },
    {
      name: t('carbs'),
      value: Number(reportData?.stats?.avgCarbs.toFixed(2)),
      color: '#f59e0b',
    },
    {
      name: t('fat'),
      value: Number(reportData?.stats?.avgFat.toFixed(2)),
      color: '#10b981',
    },
  ];

  const goalSuccessRate =
    reportData.stats.totalDays > 0
      ? Math.round((reportData.stats.goalsMetDays / reportData.stats.totalDays) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <FileText className="h-8 w-8 text-blue-600" />
            {t('title')}
          </h1>
          <p className="mt-2 text-gray-600">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            {t('exportCsv')}
          </button>
          {/* <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            匯出 PDF
          </button> */}
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setReportType('week')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 font-medium transition-all ${
            reportType === 'week'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="h-4 w-4" />
          {t('weekly')}
        </button>
        <button
          onClick={() => setReportType('month')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 font-medium transition-all ${
            reportType === 'month'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="h-4 w-4" />
          {t('monthly')}
        </button>
        <button
          onClick={() => setReportType('custom')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 font-medium transition-all ${
            reportType === 'custom'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="h-4 w-4" />
          {t('custom')}
        </button>
      </div>

      {/* Custom date range pickers */}
      {reportType === 'custom' && (
        <div className="flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('startDate')}</label>
            <input
              type="date"
              value={customStartDate}
              max={customEndDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('endDate')}</label>
            <input
              type="date"
              value={customEndDate}
              min={customStartDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={loadReport}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? tc('loading') : tc('search')}
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <span className="text-sm text-gray-600">{t('avgCalories')}</span>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {Math.round(reportData.stats.avgCalories)}
            <span className="ml-1 text-lg text-gray-500">kcal</span>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <span className="text-sm text-gray-600">{t('avgProtein')}</span>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {Math.round(reportData.stats.avgProtein)}
            <span className="ml-1 text-lg text-gray-500">g</span>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <span className="text-sm text-gray-600">{t('avgWater')}</span>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {Math.round(reportData.stats.avgWater)}
            <span className="ml-1 text-lg text-gray-500">ml</span>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <span className="text-sm text-gray-600">{t('goalRate')}</span>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {goalSuccessRate}
            <span className="ml-1 text-lg text-gray-500">%</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Nutrient Distribution Pie Chart */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">{t('nutrientDist')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={nutrientPieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {nutrientPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <div className="font-bold text-red-600">
                {Math.round(reportData.stats.avgProtein)}g
              </div>
              <div className="text-gray-600">{t('protein')}</div>
            </div>
            <div>
              <div className="font-bold text-orange-600">
                {Math.round(reportData.stats.avgCarbs)}g
              </div>
              <div className="text-gray-600">{t('tableCarbs')}</div>
            </div>
            <div>
              <div className="font-bold text-green-600">{Math.round(reportData.stats.avgFat)}g</div>
              <div className="text-gray-600">{t('fat')}</div>
            </div>
          </div>
        </div>

        {/* Daily Calories Bar Chart */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">📈 {t('caloriesTrend')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="calories" fill="#3b82f6" radius={[8, 8, 0, 0]} name={t('calories')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Nutrients Line Chart */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">{t('macrosTrend')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="protein"
                stroke="#ef4444"
                name={t('protein')}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="carbs"
                stroke="#f59e0b"
                name={t('tableCarbs')}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="fat"
                stroke="#10b981"
                name={t('fat')}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Water & Exercise */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">💧 {t('waterExercise')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="water" fill="#3b82f6" name={t('waterMl')} />
              <Bar yAxisId="right" dataKey="exercise" fill="#f59e0b" name={t('exerciseMin')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-900">📋 {t('detailTable')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t('tableDate')}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">
                  {t('tableCalories')}
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">
                  {t('tableProtein')}
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">
                  {t('tableCarbs')}
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">{t('tableFat')}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">
                  {t('tableWater')}
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">
                  {t('tableExercise')}
                </th>
              </tr>
            </thead>
            <tbody>
              {reportData.dailyData.map((day, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="px-4 py-3 text-gray-900">{day.date}</td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {Math.round(day.calories)} kcal
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{day.protein.toFixed(1)} g</td>
                  <td className="px-4 py-3 text-right text-gray-700">{day.carbs.toFixed(1)} g</td>
                  <td className="px-4 py-3 text-right text-gray-700">{day.fat.toFixed(1)} g</td>
                  <td className="px-4 py-3 text-right text-gray-700">{day.water} ml</td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {day.exercise} {t('minutesUnit')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td className="px-4 py-3 text-gray-900">{t('tableAvg')}</td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {Math.round(reportData.stats.avgCalories)} kcal
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {reportData.stats.avgProtein.toFixed(1)} g
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {reportData.stats.avgCarbs.toFixed(1)} g
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {reportData.stats.avgFat.toFixed(1)} g
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {Math.round(reportData.stats.avgWater)} ml
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {Math.round(reportData.stats.avgExercise)} {t('minutesUnit')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
