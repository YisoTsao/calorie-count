'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const [reportType, setReportType] = useState<'week' | 'month' | 'custom'>('week');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    setLoading(true);
    try {
      let days = 7;
      if (reportType === 'month') days = 30;
      
      const res = await fetch(`/api/stats?days=${days}`);
      const data = await res.json();
      
      // 如果沒有統計資料或資料不足,觸發批量計算
      if (!data.stats || data.stats.length < days / 2) {
        try {
          // 呼叫批量計算 API
          const batchRes = await fetch(`/api/stats/batch?days=${days}`, {
            method: 'POST',
          });
          
          if (batchRes.ok) {
            // 重新載入統計資料
            const retryRes = await fetch(`/api/stats?days=${days}`);
            const retryData = await retryRes.json();
            
            if (retryData.stats) {
              data.stats = retryData.stats;
              data.summary = retryData.summary;
            }
          }
        } catch (calcError) {
          console.error('批量計算統計失敗:', calcError);
        }
      }
      
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
        date: new Date(s.date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }),
        calories: s.totalCalories,
        protein: s.totalProtein,
        carbs: s.totalCarbs,
        fat: s.totalFat,
        water: s.totalWater,
        exercise: s.totalExercise
      }));

      setReportData({
        period: reportType === 'week' ? '週報表' : '月報表',
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
        dailyData
      });
    } catch (error) {
      console.error('載入報表失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  const handleExportPDF = () => {
    // TODO: 實作 PDF 匯出
    alert('PDF 匯出功能開發中...');
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    const headers = ['日期', '卡路里', '蛋白質', '碳水', '脂肪', '飲水', '運動'];
    const rows = reportData.dailyData.map(d => [
      d.date,
      d.calories.toFixed(0),
      d.protein.toFixed(1),
      d.carbs.toFixed(1),
      d.fat.toFixed(1),
      d.water.toString(),
      d.exercise.toString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">無法載入報表</div>
      </div>
    );
  }

  // 營養素圓餅圖數據
  const nutrientPieData = [
    { name: '蛋白質', value: reportData.stats.avgProtein, color: '#ef4444' },
    { name: '碳水化合物', value: reportData.stats.avgCarbs, color: '#f59e0b' },
    { name: '脂肪', value: reportData.stats.avgFat, color: '#10b981' }
  ];

  const goalSuccessRate = reportData.stats.totalDays > 0
    ? Math.round((reportData.stats.goalsMetDays / reportData.stats.totalDays) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            報表分析
          </h1>
          <p className="text-gray-600 mt-2">
            查看您的健康數據統計與分析
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            匯出 CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            匯出 PDF
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setReportType('week')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
            reportType === 'week'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          週報表
        </button>
        <button
          onClick={() => setReportType('month')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
            reportType === 'month'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          月報表
        </button>
        <button
          onClick={() => setReportType('custom')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
            reportType === 'custom'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          disabled
        >
          <Calendar className="w-4 h-4" />
          自訂範圍
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <span className="text-sm text-gray-600">平均卡路里</span>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {Math.round(reportData.stats.avgCalories)}
            <span className="text-lg text-gray-500 ml-1">kcal</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <span className="text-sm text-gray-600">平均蛋白質</span>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {Math.round(reportData.stats.avgProtein)}
            <span className="text-lg text-gray-500 ml-1">g</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <span className="text-sm text-gray-600">平均飲水量</span>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {Math.round(reportData.stats.avgWater)}
            <span className="text-lg text-gray-500 ml-1">ml</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <span className="text-sm text-gray-600">目標達成率</span>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {goalSuccessRate}
            <span className="text-lg text-gray-500 ml-1">%</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nutrient Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📊 營養素分布
          </h2>
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
              <div className="font-bold text-red-600">{Math.round(reportData.stats.avgProtein)}g</div>
              <div className="text-gray-600">蛋白質</div>
            </div>
            <div>
              <div className="font-bold text-orange-600">{Math.round(reportData.stats.avgCarbs)}g</div>
              <div className="text-gray-600">碳水</div>
            </div>
            <div>
              <div className="font-bold text-green-600">{Math.round(reportData.stats.avgFat)}g</div>
              <div className="text-gray-600">脂肪</div>
            </div>
          </div>
        </div>

        {/* Daily Calories Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📈 每日卡路里攝取
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="calories" fill="#3b82f6" radius={[8, 8, 0, 0]} name="卡路里" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Nutrients Line Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            🥗 三大營養素趨勢
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="protein" stroke="#ef4444" name="蛋白質" strokeWidth={2} />
              <Line type="monotone" dataKey="carbs" stroke="#f59e0b" name="碳水" strokeWidth={2} />
              <Line type="monotone" dataKey="fat" stroke="#10b981" name="脂肪" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Water & Exercise */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            💧 飲水與運動
          </h2>
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
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="water" fill="#3b82f6" name="飲水 (ml)" />
              <Bar yAxisId="right" dataKey="exercise" fill="#f59e0b" name="運動 (分)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          📋 詳細數據表格
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-700">日期</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">卡路里</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">蛋白質</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">碳水</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">脂肪</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">飲水</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">運動</th>
              </tr>
            </thead>
            <tbody>
              {reportData.dailyData.map((day, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="px-4 py-3 text-gray-900">{day.date}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{Math.round(day.calories)} kcal</td>
                  <td className="px-4 py-3 text-right text-gray-700">{day.protein.toFixed(1)} g</td>
                  <td className="px-4 py-3 text-right text-gray-700">{day.carbs.toFixed(1)} g</td>
                  <td className="px-4 py-3 text-right text-gray-700">{day.fat.toFixed(1)} g</td>
                  <td className="px-4 py-3 text-right text-gray-700">{day.water} ml</td>
                  <td className="px-4 py-3 text-right text-gray-700">{day.exercise} 分</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td className="px-4 py-3 text-gray-900">平均</td>
                <td className="px-4 py-3 text-right text-gray-900">{Math.round(reportData.stats.avgCalories)} kcal</td>
                <td className="px-4 py-3 text-right text-gray-900">{reportData.stats.avgProtein.toFixed(1)} g</td>
                <td className="px-4 py-3 text-right text-gray-900">{reportData.stats.avgCarbs.toFixed(1)} g</td>
                <td className="px-4 py-3 text-right text-gray-900">{reportData.stats.avgFat.toFixed(1)} g</td>
                <td className="px-4 py-3 text-right text-gray-900">{Math.round(reportData.stats.avgWater)} ml</td>
                <td className="px-4 py-3 text-right text-gray-900">{Math.round(reportData.stats.avgExercise)} 分</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
