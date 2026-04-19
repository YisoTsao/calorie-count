'use client';

import { useState, useEffect } from 'react';
import { Activity, Plus, Trash2, ChevronDown, ChevronUp, Flame } from 'lucide-react';

interface ExerciseRecord {
  id: string;
  type: string;
  duration: number; // minutes
  calories: number;
  time?: string;
  date?: string;
  createdAt?: string;
}

interface ExerciseLoggerProps {
  dailyCalorieGoal?: number;
}

const EXERCISE_TYPES = {
  '慢跑': 7.0,
  '快跑': 11.0,
  '步行': 3.5,
  '游泳': 8.0,
  '騎自行車': 6.8,
  '重量訓練': 6.0,
  '瑜伽': 3.0,
  '有氧運動': 7.3,
  '爬樓梯': 8.8,
  '跳繩': 12.3,
  '籃球': 6.5,
  '羽毛球': 5.5,
  '網球': 7.3,
  '其他': 5.0
} as const;

export default function ExerciseLogger({ 
  dailyCalorieGoal = 300 
}: ExerciseLoggerProps) {
  const [records, setRecords] = useState<ExerciseRecord[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [selectedType, setSelectedType] = useState<string>('慢跑');
  const [duration, setDuration] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(false);

  // 載入今日記錄
  useEffect(() => {
    loadTodayRecords();
  }, []);

  const loadTodayRecords = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/exercise?date=${today}`);
      
      if (!response.ok) throw new Error('載入失敗');
      
      const data = await response.json();
      setRecords(data.data?.exercises || []);
      setTotalCalories(data.data?.totals?.calories || 0);
    } catch (error) {
      console.error('載入運動記錄失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 新增運動記錄
  const addExercise = async () => {
    const durationNum = parseInt(duration);
    
    if (!selectedType || !duration || durationNum <= 0) {
      alert('請選擇運動類型並輸入有效時間');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          duration: durationNum
        })
      });

      if (!response.ok) throw new Error('新增失敗');

      const newRecord = await response.json();
      const exercise = newRecord.data?.exercise || newRecord;
      setRecords(prev => [exercise, ...prev]);
      setTotalCalories(prev => prev + (exercise.calories || 0));
      setDuration('');
    } catch (error) {
      console.error('新增運動記錄失敗:', error);
      alert('新增失敗,請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 刪除記錄
  const deleteRecord = async (recordId: string, calories: number) => {
    if (!confirm('確定要刪除此記錄嗎?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/exercise?id=${recordId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('刪除失敗');

      setRecords(prev => prev.filter(r => r.id !== recordId));
      setTotalCalories(prev => prev - calories);
    } catch (error) {
      console.error('刪除記錄失敗:', error);
      alert('刪除失敗,請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 計算預估卡路里
  const estimatedCalories = () => {
    if (!duration) return 0;
    const met = EXERCISE_TYPES[selectedType as keyof typeof EXERCISE_TYPES] || 5.0;
    const hours = parseInt(duration) / 60;
    return Math.round(met * 70 * hours); // 假設 70kg
  };

  const progressPercentage = Math.min((totalCalories / dailyCalorieGoal) * 100, 100);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="text-orange-500" size={24} />
          <h3 className="text-lg font-semibold">運動記錄</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Progress Summary */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">
            已消耗: <span className="font-semibold text-orange-600">{Math.round(totalCalories)} 卡</span>
          </span>
          <span className="text-gray-600">
            目標: <span className="font-semibold">{dailyCalorieGoal} 卡</span>
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-400 to-orange-600 h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Add Exercise Form */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">新增運動</p>
            
            <div className="space-y-3">
              {/* Exercise Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  運動類型
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={loading}
                >
                  {Object.keys(EXERCISE_TYPES).map(type => (
                    <option key={type} value={type}>
                      {type} (MET: {EXERCISE_TYPES[type as keyof typeof EXERCISE_TYPES]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  運動時間 (分鐘)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="輸入運動時間"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={loading}
                />
              </div>

              {/* Estimated Calories */}
              {duration && (
                <div className="flex items-center gap-2 text-sm bg-orange-50 p-2 rounded">
                  <Flame size={16} className="text-orange-500" />
                  <span className="text-gray-600">
                    預估消耗: <span className="font-semibold text-orange-600">
                      {estimatedCalories()} 卡
                    </span>
                  </span>
                </div>
              )}

              {/* Add Button */}
              <button
                onClick={addExercise}
                disabled={loading || !duration}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                新增運動記錄
              </button>
            </div>
          </div>

          {/* Records List */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600">今日記錄</p>
              <span className="text-xs text-gray-500">{records.length} 筆</span>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {loading && records.length === 0 ? (
                <p className="text-center text-gray-400 py-4">載入中...</p>
              ) : records.length === 0 ? (
                <p className="text-center text-gray-400 py-4">尚無記錄</p>
              ) : (
                records.map(record => (
                  <div
                    key={record.id}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Activity size={16} className="text-orange-500" />
                      <div>
                        <p className="font-medium">{record.type}</p>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span>{record.duration} 分鐘</span>
                          <span className="flex items-center gap-1">
                            <Flame size={12} />
                            {Math.round(record.calories)} 卡
                          </span>
                          <span>
                            {record.time && !isNaN(new Date(record.time).getTime())
                              ? new Date(record.time).toLocaleTimeString('zh-TW', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : new Date(record.date || record.createdAt || '').toLocaleDateString('zh-TW')
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteRecord(record.id, record.calories)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-700 p-1 rounded transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
