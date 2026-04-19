'use client';

import { useState, useEffect } from 'react';
import { Scale, TrendingDown, TrendingUp, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeightRecord {
  id: string;
  date: string;
  weight: number;
  bmi: number | null;
  bodyFat: number | null;
  notes?: string;
}

interface WeightStats {
  current: number | null;
  change: number;
  average: number;
  highest: number;
  lowest: number;
}

export default function WeightTracker() {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [stats, setStats] = useState<WeightStats | null>(null);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [notes, setNotes] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(false);

  // 載入記錄
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/weight');
      
      if (!response.ok) throw new Error('載入失敗');
      
      const data = await response.json();
      setRecords(data.data?.records || []);
      setStats(data.data?.stats || null);
    } catch (error) {
      console.error('載入體重記錄失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 新增/更新體重記錄
  const saveWeight = async () => {
    const weightNum = parseFloat(weight);
    const bodyFatNum = bodyFat ? parseFloat(bodyFat) : undefined;

    if (!weight || weightNum <= 0 || weightNum > 300) {
      alert('請輸入有效體重 (0.1-300 kg)');
      return;
    }

    if (bodyFat && (bodyFatNum! <= 0 || bodyFatNum! > 100)) {
      alert('體脂率範圍應在 0.1-100%');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: weightNum,
          bodyFat: bodyFatNum,
          notes: notes || undefined
        })
      });

      if (!response.ok) throw new Error('儲存失敗');

      await loadRecords();
      setWeight('');
      setBodyFat('');
      setNotes('');
    } catch (error) {
      console.error('儲存體重記錄失敗:', error);
      alert('儲存失敗,請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 刪除記錄
  const deleteRecord = async (date: string) => {
    if (!confirm('確定要刪除此記錄嗎?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/weight?date=${date}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('刪除失敗');

      await loadRecords();
    } catch (error) {
      console.error('刪除記錄失敗:', error);
      alert('刪除失敗,請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 準備圖表資料
  const chartData = records
    .slice(0, 30) // 最近 30 筆
    .reverse()
    .map(record => ({
      date: new Date(record.date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }),
      weight: record.weight,
      bmi: record.bmi
    }));

  const getBMIStatus = (bmi: number | null) => {
    if (!bmi) return { text: '-', color: 'text-gray-500' };
    if (bmi < 18.5) return { text: '過輕', color: 'text-blue-600' };
    if (bmi < 24) return { text: '正常', color: 'text-green-600' };
    if (bmi < 27) return { text: '過重', color: 'text-yellow-600' };
    return { text: '肥胖', color: 'text-red-600' };
  };

  const weightChange = stats?.change || 0;
  const bmiStatus = stats?.current ? getBMIStatus(stats.current) : { text: '-', color: 'text-gray-500' };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scale className="text-purple-500" size={24} />
          <h3 className="text-lg font-semibold">體重追蹤</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">目前體重</p>
          <p className="text-lg font-bold text-purple-700">
            {stats?.current?.toFixed(1) || '-'} kg
          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">變化</p>
          <div className="flex items-center gap-1">
            {weightChange !== 0 && (
              weightChange > 0 ? 
                <TrendingUp size={16} className="text-red-500" /> : 
                <TrendingDown size={16} className="text-green-500" />
            )}
            <p className={`text-lg font-bold ${
              weightChange > 0 ? 'text-red-600' : 
              weightChange < 0 ? 'text-green-600' : 
              'text-gray-600'
            }`}>
              {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
            </p>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">BMI</p>
          <p className={`text-lg font-bold ${bmiStatus.color}`}>
            {stats?.current ? (
              <>
                {(stats.current).toFixed(1)}
                <span className="text-xs ml-1">{bmiStatus.text}</span>
              </>
            ) : '-'}
          </p>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">平均體重</p>
          <p className="text-lg font-bold text-green-700">
            {stats?.average ? `${stats.average.toFixed(1)} kg` : '-'}
          </p>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Weight Chart */}
          {chartData.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">體重趨勢 (最近 30 天)</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke="#888"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#888"
                      domain={['dataMin - 2', 'dataMax + 2']}
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
                      strokeWidth={2}
                      dot={{ fill: '#9333ea', r: 4 }}
                      name="體重 (kg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Add Weight Form */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">記錄今日體重</p>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    體重 (kg) *
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="例: 70.5"
                    step="0.1"
                    min="0.1"
                    max="300"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    體脂率 (%)
                  </label>
                  <input
                    type="number"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    placeholder="選填"
                    step="0.1"
                    min="0.1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備註
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="例: 早餐前測量"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                />
              </div>

              <button
                onClick={saveWeight}
                disabled={loading || !weight}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                儲存記錄
              </button>
            </div>
          </div>

          {/* Records List */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600">歷史記錄</p>
              <span className="text-xs text-gray-500">{records.length} 筆</span>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {loading && records.length === 0 ? (
                <p className="text-center text-gray-400 py-4">載入中...</p>
              ) : records.length === 0 ? (
                <p className="text-center text-gray-400 py-4">尚無記錄</p>
              ) : (
                records.map(record => {
                  const recordBMI = record.bmi ? getBMIStatus(record.bmi) : { text: '-', color: 'text-gray-500' };
                  return (
                    <div
                      key={record.id}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Scale size={16} className="text-purple-500" />
                        <div>
                          <p className="font-medium">{record.weight} kg</p>
                          <div className="flex gap-3 text-xs text-gray-500">
                            <span>
                              {new Date(record.date).toLocaleDateString('zh-TW')}
                            </span>
                            {record.bmi && (
                              <span className={recordBMI.color}>
                                BMI: {record.bmi.toFixed(1)} ({recordBMI.text})
                              </span>
                            )}
                            {record.bodyFat && (
                              <span>體脂: {record.bodyFat}%</span>
                            )}
                          </div>
                          {record.notes && (
                            <p className="text-xs text-gray-400 mt-1">{record.notes}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteRecord(record.date)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
