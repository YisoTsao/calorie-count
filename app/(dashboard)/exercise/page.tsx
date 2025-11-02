'use client';

import { useState, useEffect } from 'react';
import { Activity, Plus, Trash2, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  { value: '羽球', icon: '🏸', caloriesPerMin: 6 }
];

export default function ExercisePage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [formData, setFormData] = useState({
    type: '跑步',
    duration: '',
    notes: ''
  });

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const res = await fetch('/api/exercise');
      const data = await res.json();
      setExercises(data.exercises || []);
    } catch (error) {
      console.error('載入運動記錄失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const exerciseType = EXERCISE_TYPES.find(t => t.value === formData.type);
    const duration = parseInt(formData.duration);
    const calories = duration * (exerciseType?.caloriesPerMin || 5);

    try {
      const res = await fetch('/api/exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          duration,
          calories,
          notes: formData.notes || undefined
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({ type: '跑步', duration: '', notes: '' });
        loadExercises();
      }
    } catch (error) {
      console.error('新增運動失敗:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這筆記錄嗎?')) return;

    try {
      const res = await fetch(`/api/exercise?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        loadExercises();
      }
    } catch (error) {
      console.error('刪除失敗:', error);
    }
  };

  const handleQuickAdd = (type: string) => {
    setFormData({ ...formData, type });
    setShowAddModal(true);
  };

  // 篩選
  const filteredExercises = exercises.filter(ex => {
    if (selectedType !== 'all' && ex.type !== selectedType) return false;
    
    const now = new Date();
    const exDate = new Date(ex.date);
    if (selectedPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return exDate >= weekAgo;
    } else {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return exDate >= monthAgo;
    }
  });

  // 統計
  const weekExercises = exercises.filter(ex => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(ex.date) >= weekAgo;
  });

  const weekCount = weekExercises.length;
  const weekDuration = weekExercises.reduce((sum, ex) => sum + ex.duration, 0);
  const weekCalories = weekExercises.reduce((sum, ex) => sum + ex.calories, 0);

  // 圖表數據 (最近 7 天)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);

    const dayExercises = exercises.filter(ex => {
      const exDate = new Date(ex.date);
      exDate.setHours(0, 0, 0, 0);
      return exDate.getTime() === date.getTime();
    });

    const totalDuration = dayExercises.reduce((sum, ex) => sum + ex.duration, 0);

    return {
      date: date.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }),
      duration: totalDuration
    };
  });

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
            {weekCalories} <span className="text-lg text-gray-500">kcal</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          📊 本週運動時長
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
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
          onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month')}
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          📋 記錄列表
        </h2>
        <div className="space-y-3">
          {filteredExercises.map((exercise) => {
            const typeInfo = EXERCISE_TYPES.find(t => t.value === exercise.type);
            return (
              <div
                key={exercise.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{typeInfo?.icon || '🏃'}</div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-gray-900">
                        {exercise.type}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(exercise.date).toLocaleString('zh-TW', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-600">
                        {exercise.duration} 分鐘
                      </span>
                      <span className="text-sm text-orange-600 font-medium">
                        {exercise.calories} kcal
                      </span>
                    </div>
                    {exercise.notes && (
                      <p className="text-sm text-gray-500 mt-1">{exercise.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                {selectedType === 'all' ? '還沒有運動記錄' : '沒有符合的運動記錄'}
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
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {EXERCISE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  運動時長 (分鐘) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                  min="1"
                />
                {formData.duration && (
                  <p className="text-sm text-gray-500 mt-1">
                    預估消耗: {parseInt(formData.duration) * (EXERCISE_TYPES.find(t => t.value === formData.type)?.caloriesPerMin || 5)} kcal
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備註 選填
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
    </div>
  );
}
