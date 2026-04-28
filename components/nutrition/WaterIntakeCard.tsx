'use client';

import { useState, useEffect } from 'react';
import { Plus, Droplet, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface WaterIntakeRecord {
  id: string;
  amount: number;
  time: string;
}

interface WaterIntakeCardProps {
  dailyGoal?: number; // ml
}

export default function WaterIntakeCard({ dailyGoal = 2000 }: WaterIntakeCardProps) {
  const t = useTranslations('nutrition');
  const tc = useTranslations('common');
  const [records, setRecords] = useState<WaterIntakeRecord[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(false);

  const quickAmounts = [100, 200, 250, 500];

  // 載入今日記錄
  useEffect(() => {
    loadTodayRecords();
  }, []);

  const loadTodayRecords = async () => {
    try {
      setLoading(true);
      const today = new Date().toLocaleDateString('en-CA');
      const response = await fetch(`/api/water?date=${today}`);

      if (!response.ok) throw new Error('載入失敗');

      const result = await response.json();
      // API 回傳格式: { success: true, data: { intakes, total, date } }
      const data = result.data || {};
      setRecords(data.intakes || []);
      setTotalAmount(data.total || 0);
    } catch (error) {
      console.error('載入飲水記錄失敗:', error);
      setRecords([]);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  };

  // 新增飲水記錄
  const addWater = async (amount: number) => {
    if (amount <= 0 || amount > 5000) {
      alert(t('invalidAmount'));
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, date: new Date().toLocaleDateString('en-CA') }),
      });

      if (!response.ok) throw new Error('新增失敗');

      const result = await response.json();
      const newRecord = result.data?.waterIntake;
      if (newRecord) {
        setRecords((prev) => [newRecord, ...prev]);
        setTotalAmount((prev) => prev + amount);
      }
      setCustomAmount('');
      await loadTodayRecords(); // 重新載入確保資料同步
    } catch (error) {
      console.error('新增飲水記錄失敗:', error);
      alert(t('addFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 刪除記錄
  const deleteRecord = async (recordId: string, amount: number) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/water?id=${recordId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('刪除失敗');

      setRecords((prev) => prev.filter((r) => r.id !== recordId));
      setTotalAmount((prev) => prev - amount);
    } catch (error) {
      console.error('刪除記錄失敗:', error);
      alert(t('deleteFailed'));
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = Math.min((totalAmount / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - totalAmount, 0);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplet className="text-blue-500" size={24} />
          <h3 className="text-lg font-semibold">{t('waterTrackingTitle')}</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-600">
            {t('drunk')}: <span className="font-semibold text-blue-600">{totalAmount}ml</span>
          </span>
          <span className="text-gray-600">
            {t('target')}: <span className="font-semibold">{dailyGoal}ml</span>
          </span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <p className="mt-2 text-center text-xs text-gray-500">
          {remaining > 0 ? t('remainingWater', { remaining }) : t('goalCompleted')}
        </p>
      </div>

      {isExpanded && (
        <>
          {/* Quick Add Buttons */}
          <div className="mb-4">
            <p className="mb-2 text-sm text-gray-600">{t('quickAdd')}</p>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => addWater(amount)}
                  disabled={loading}
                  className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
                >
                  {amount}ml
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="mb-6">
            <p className="mb-2 text-sm text-gray-600">{t('customAmount')}</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={t('enterMl')}
                min="1"
                max="5000"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={() => {
                  const amount = parseInt(customAmount);
                  if (!isNaN(amount)) addWater(amount);
                }}
                disabled={loading || !customAmount}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={16} />
                {tc('add')}
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
                      <Droplet size={16} className="text-blue-500" />
                      <div>
                        <p className="font-medium">{record.amount}ml</p>
                        <p className="text-xs text-gray-500">
                          {new Date(record.time).toLocaleTimeString('zh-TW', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteRecord(record.id, record.amount)}
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
