'use client';

import { useState, useEffect } from 'react';
import { Scale, Plus, Trash2, TrendingDown, TrendingUp, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    weight: '',
    bodyFat: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadRecords();
    loadGoals();
  }, []);

  const loadRecords = async () => {
    try {
      const res = await fetch('/api/weight');
      
      if (!res.ok) {
        throw new Error('載入失敗');
      }
      
      const data = await res.json();
      console.log('載入的體重資料:', data);
      
      // 確保 records 是陣列
      setRecords(Array.isArray(data.records) ? data.records : []);
    } catch (error) {
      console.error('載入體重記錄失敗:', error);
      setRecords([]); // 錯誤時設為空陣列
    } finally {
      setLoading(false);
    }
  };

  const loadGoals = async () => {
    try {
      const res = await fetch('/api/goals');
      const data = await res.json();
      setGoals({
        targetWeight: data.targetWeight,
        height: data.height
      });
    } catch (error) {
      console.error('載入目標失敗:', error);
    }
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 前端驗證
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      alert('請輸入有效的體重');
      return;
    }
    
    try {
      console.log('準備新增體重:', formData);
      
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: parseFloat(formData.weight),
          bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
          notes: formData.note || undefined, // 修正: note -> notes
          date: formData.date, // 添加日期
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '新增失敗');
      }

      const data = await res.json();
      console.log('新增成功:', data);
      
      setShowAddModal(false);
      setFormData({ 
        weight: '', 
        bodyFat: '', 
        note: '',
        date: new Date().toISOString().split('T')[0],
      });
      await loadRecords(); // 確保重新載入
    } catch (error) {
      console.error('新增體重失敗:', error);
      alert(error instanceof Error ? error.message : '新增失敗,請稍後再試');
    }
  };

  const handleEditWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingRecord) return;
    
    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: parseFloat(formData.weight),
          bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
          notes: formData.note || undefined,
          date: formData.date,
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '更新失敗');
      }

      setEditingRecord(null);
      setFormData({ 
        weight: '', 
        bodyFat: '', 
        note: '',
        date: new Date().toISOString().split('T')[0],
      });
      await loadRecords();
    } catch (error) {
      console.error('更新體重失敗:', error);
      alert(error instanceof Error ? error.message : '更新失敗,請稍後再試');
    }
  };

  const handleOpenEdit = (record: WeightRecord) => {
    setEditingRecord(record);
    setFormData({
      weight: record.weight.toString(),
      bodyFat: record.bodyFat?.toString() || '',
      note: record.note || '',
      date: new Date(record.date).toISOString().split('T')[0],
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這筆記錄嗎?')) return;

    try {
      console.log('準備刪除記錄:', id);
      
      const res = await fetch(`/api/weight?id=${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '刪除失敗');
      }

      console.log('刪除成功');
      await loadRecords();
    } catch (error) {
      console.error('刪除失敗:', error);
      alert(error instanceof Error ? error.message : '刪除失敗,請稍後再試');
    }
  };

  const currentWeight = records.length > 0 ? records[0].weight : 0;
  const currentBMI = records.length > 0 ? records[0].bmi : 0;
  const targetWeight = goals.targetWeight || 0;
  const weightDiff = currentWeight - targetWeight;

  // BMI 分類
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: '過輕', color: 'text-blue-600' };
    if (bmi < 24) return { label: '正常', color: 'text-green-600' };
    if (bmi < 27) return { label: '過重', color: 'text-orange-600' };
    return { label: '肥胖', color: 'text-red-600' };
  };

  // 趨勢計算
  const getTrend = () => {
    if (records.length < 2) return null;
    const diff = records[0].weight - records[1].weight;
    if (Math.abs(diff) < 0.1) return { label: '持平', icon: null, color: 'text-gray-600' };
    if (diff > 0) return { label: `+${diff.toFixed(1)}kg`, icon: TrendingUp, color: 'text-red-600' };
    return { label: `${diff.toFixed(1)}kg`, icon: TrendingDown, color: 'text-green-600' };
  };

  const bmiCategory = getBMICategory(currentBMI);
  const trend = getTrend();

  // 圖表數據 (最近 30 筆)
  const chartData = records.slice(0, 30).reverse().map(r => ({
    date: new Date(r.date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }),
    weight: r.weight
  }));

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
          <p className="text-gray-600 mt-2">
            追蹤您的體重變化與 BMI
          </p>
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
            {currentWeight.toFixed(1)} <span className="text-lg text-gray-500">kg</span>
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
            {targetWeight > 0 ? targetWeight.toFixed(1) : '--'} <span className="text-lg text-gray-500">kg</span>
          </div>
          {targetWeight > 0 && (
            <p className={`text-sm mt-1 ${weightDiff > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {weightDiff > 0 ? '需減少' : '已達成'} {Math.abs(weightDiff).toFixed(1)}kg
            </p>
          )}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📈 體重趨勢 (最近 30 天)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis 
                domain={['dataMin - 2', 'dataMax + 2']}
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#9333ea"
                strokeWidth={3}
                dot={{ fill: '#9333ea', r: 4 }}
                name="體重 (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Records List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          📋 記錄列表
        </h2>
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">
                    {new Date(record.date).toLocaleDateString('zh-TW')}
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
              {editingRecord ? '編輯體重記錄' : '新增體重記錄'}
            </h3>
            <form onSubmit={editingRecord ? handleEditWeight : handleAddWeight} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日期 *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備註 選填
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
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
                      weight: '', 
                      bodyFat: '', 
                      note: '',
                      date: new Date().toISOString().split('T')[0],
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
                  {editingRecord ? '更新' : '新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
