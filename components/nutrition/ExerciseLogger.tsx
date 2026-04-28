'use client';

import { useState, useEffect } from 'react';
import { Activity, Plus, Trash2, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ExerciseRecord {
  id: string;
  type: string;
  duration: number; // minutes
  calories: number;
  time: string;
}

interface ExerciseLoggerProps {
  dailyCalorieGoal?: number;
}

const EXERCISE_TYPES = {
  慢跑: 7.0,
  快跑: 11.0,
  步行: 3.5,
  游泳: 8.0,
  騎自行車: 6.8,
  重量訓練: 6.0,
  瑜伽: 3.0,
  有氧運動: 7.3,
  爬樓梯: 8.8,
  跳繩: 12.3,
  籃球: 6.5,
  羽毛球: 5.5,
  網球: 7.3,
  其他: 5.0,
} as const;

export default function ExerciseLogger({ dailyCalorieGoal = 300 }: ExerciseLoggerProps) {
  const t = useTranslations('nutrition');
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
      const today = new Date().toLocaleDateString('en-CA');
      const response = await fetch(`/api/exercise?date=${today}`);

      if (!response.ok) throw new Error('載入失敗');

      const result = await response.json();
      // API 回傳格式: { success: true, data: { exercises, totals } }
      const data = result.data || {};
      setRecords(data.exercises || []);
      setTotalCalories(data.totals?.calories || 0);
    } catch (error) {
      console.error('載入運動記錄失敗:', error);
      setRecords([]);
      setTotalCalories(0);
    } finally {
      setLoading(false);
    }
  };

  // 新增運動記錄
  const addExercise = async () => {
    const durationNum = parseInt(duration);

    if (!selectedType || !duration || durationNum <= 0) {
      alert(t('invalidExercise'));
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          duration: durationNum,
          date: new Date().toLocaleDateString('en-CA'),
        }),
      });

      if (!response.ok) throw new Error('新增失敗');

      const result = await response.json();
      const newRecord = result.data?.exercise;
      if (newRecord) {
        setRecords((prev) => [newRecord, ...prev]);
        setTotalCalories((prev) => prev + (newRecord.calories || 0));
      }
      setDuration('');
      await loadTodayRecords(); // 重新載入確保資料同步
    } catch (error) {
      console.error('新增運動記錄失敗:', error);
      alert(t('addFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 刪除記錄
  const deleteRecord = async (recordId: string, calories: number) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/exercise?id=${recordId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('刪除失敗');

      setRecords((prev) => prev.filter((r) => r.id !== recordId));
      setTotalCalories((prev) => prev - calories);
    } catch (error) {
      console.error('刪除記錄失敗:', error);
      alert(t('deleteFailed'));
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
    <div className="rounded-lg bg-white p-6 shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="text-orange-500" size={24} />
          <h3 className="text-lg font-semibold">{t('exerciseLogTitle')}</h3>
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
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-600">
            {t('burnedCalories')}:{' '}
            <span className="font-semibold text-orange-600">{Math.round(totalCalories)} {t('kcal')}</span>
          </span>
          <span className="text-gray-600">
            {t('target')}: <span className="font-semibold">{dailyCalorieGoal} {t('kcal')}</span>
          </span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Add Exercise Form */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <p className="mb-3 text-sm text-gray-600">{t('addExerciseForm')}</p>

            <div className="space-y-3">
              {/* Exercise Type Selector */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('exerciseTypeLabel')}</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={loading}
                >
                  {Object.keys(EXERCISE_TYPES).map((type) => (
                    <option key={type} value={type}>
                      {t(`exerciseTypes.${type}`)} (MET: {EXERCISE_TYPES[type as keyof typeof EXERCISE_TYPES]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Input */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t('durationLabel')}
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder={t('enterDuration')}
                  min="1"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={loading}
                />
              </div>

              {/* Estimated Calories */}
              {duration && (
                <div className="flex items-center gap-2 rounded bg-orange-50 p-2 text-sm">
                  <Flame size={16} className="text-orange-500" />
                  <span className="text-gray-600">
                    {t('estimatedBurn')}:{' '}
                    <span className="font-semibold text-orange-600">{estimatedCalories()} {t('kcal')}</span>
                  </span>
                </div>
              )}

              {/* Add Button */}
              <button
                onClick={addExercise}
                disabled={loading || !duration}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={16} />
                {t('addExerciseBtn')}
              </button>
            </div>
          </div>

          {/* Records List */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-gray-600">{t('todayRecords')}</p>
              <span className="text-xs text-gray-500">{records.length}</span>
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto">
              {loading && records.length === 0 ? (
                <p className="py-4 text-center text-gray-400">{t('loading')}</p>
              ) : records.length === 0 ? (
                <p className="py-4 text-center text-gray-400">{t('noRecord')}</p>
              ) : (
                records.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <Activity size={16} className="text-orange-500" />
                      <div>
                        <p className="font-medium">{record.type}</p>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span>{record.duration} {t('minutes')}</span>
                          <span className="flex items-center gap-1">
                            <Flame size={12} />
                            {Math.round(record.calories)} {t('kcal')}
                          </span>
                          <span>
                            {new Date(record.time).toLocaleTimeString('zh-TW', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteRecord(record.id, record.calories)}
                      disabled={loading}
                      className="rounded p-1 text-red-500 transition-colors hover:text-red-700 disabled:opacity-50"
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
