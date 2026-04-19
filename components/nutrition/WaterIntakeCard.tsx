'use client';

import { useState, useEffect } from 'react';
import { Plus, Droplet, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface WaterIntakeRecord {
  id: string;
  amount: number;
  time: string;
}

interface WaterIntakeCardProps {
  dailyGoal?: number; // ml
}

export default function WaterIntakeCard({ 
  dailyGoal = 2000
}: WaterIntakeCardProps) {
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
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/water?date=${today}`);
      
      if (!response.ok) throw new Error('載入失敗');
      
      const data = await response.json();
      setRecords(data.data?.intakes || []);
      setTotalAmount(data.data?.total || 0);
    } catch (error) {
      console.error('載入飲水記錄失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 新增飲水記錄
  const addWater = async (amount: number) => {
    if (amount <= 0 || amount > 5000) {
      alert('請輸入 1-5000ml 之間的數量');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) throw new Error('新增失敗');

      const newRecord = await response.json();
      const intake = newRecord.data?.waterIntake || newRecord;
      setRecords(prev => [intake, ...prev]);
      setTotalAmount(prev => prev + amount);
      setCustomAmount('');
      await loadTodayRecords();
    } catch (error) {
      console.error('新增飲水記錄失敗:', error);
      alert('新增失敗,請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 刪除記錄
  const deleteRecord = async (recordId: string, amount: number) => {
    if (!confirm('確定要刪除此記錄嗎?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/water?id=${recordId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('刪除失敗');

      setRecords(prev => prev.filter(r => r.id !== recordId));
      setTotalAmount(prev => prev - amount);
    } catch (error) {
      console.error('刪除記錄失敗:', error);
      alert('刪除失敗,請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = Math.min((totalAmount / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - totalAmount, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplet className="text-blue-500" size={24} />
          <h3 className="text-lg font-semibold">飲水追蹤</h3>
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
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">
            已喝: <span className="font-semibold text-blue-600">{totalAmount}ml</span>
          </span>
          <span className="text-gray-600">
            目標: <span className="font-semibold">{dailyGoal}ml</span>
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-400 to-blue-600 h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          {remaining > 0 ? `還需 ${remaining}ml 達成目標` : '🎉 已完成今日目標!'}
        </p>
      </div>

      {isExpanded && (
        <>
          {/* Quick Add Buttons */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">快速新增</p>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => addWater(amount)}
                  disabled={loading}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {amount}ml
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">自訂數量</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="輸入毫升數"
                min="1"
                max="5000"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={() => {
                  const amount = parseInt(customAmount);
                  if (!isNaN(amount)) addWater(amount);
                }}
                disabled={loading || !customAmount}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                新增
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
                      <Droplet size={16} className="text-blue-500" />
                      <div>
                        <p className="font-medium">{record.amount}ml</p>
                        <p className="text-xs text-gray-500">
                          {new Date(record.time).toLocaleTimeString('zh-TW', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteRecord(record.id, record.amount)}
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
