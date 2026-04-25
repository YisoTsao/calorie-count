'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Palette,
  Database,
  Shield,
  Info,
  Save,
  Eye,
  EyeOff,
  Lock,
  X,
} from 'lucide-react';

interface UserProfile {
  name?: string;
  height?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bio?: string;
}

interface UserGoals {
  dailyCalorieGoal?: number;
  proteinGoal?: number;
  waterGoal?: number;
  targetWeight?: number;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [profile, setProfile] = useState<UserProfile>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [goals, setGoals] = useState<UserGoals>({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'zh-TW',
    notifications: {
      mealReminder: true,
      achievementNotif: true,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // 載入個人資料
        const profileRes = await fetch('/api/users/me/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const userData = profileData.data;
          setProfile({
            name: userData?.name,
            height: userData?.profile?.height,
            gender: userData?.profile?.gender ?? undefined,
            bio: userData?.profile?.bio ?? undefined,
          });
          if (userData?.profile?.targetWeight !== undefined) {
            setGoals((prev) => ({
              ...prev,
              targetWeight: userData.profile.targetWeight,
            }));
          }
        }

        // 載入目標
        const goalsRes = await fetch('/api/goals');
        if (goalsRes.ok) {
          const goalsData = await goalsRes.json();
          const g = goalsData.data?.goals || {};
          setGoals((prev) => ({
            dailyCalorieGoal: g.dailyCalorieGoal,
            proteinGoal: g.proteinGoal,
            waterGoal: g.waterGoal,
            targetWeight: prev.targetWeight,
          }));
        }

        // 載入偏好設定
        const prefsRes = await fetch('/api/preferences');
        if (prefsRes.ok) {
          const prefsData = await prefsRes.json();
          if (prefsData.data) {
            setPreferences({
              theme: (prefsData.data.theme || 'LIGHT').toLowerCase(),
              language: prefsData.data.language || 'zh-TW',
              notifications: {
                mealReminder: prefsData.data.notificationMealReminders ?? true,
                achievementNotif: prefsData.data.notificationGoalReminders ?? true,
              },
            });
          }
        }
      } catch (error) {
        console.error('載入資料失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const prefsPayload = {
        ...preferences,
        theme: preferences.theme.toUpperCase() as 'LIGHT' | 'DARK' | 'AUTO',
      };
      const res = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefsPayload),
      });

      if (res.ok) {
        alert('偏好設定已儲存');
      } else {
        const error = await res.json();
        alert(`儲存失敗: ${error.error || '未知錯誤'}`);
      }
    } catch (error) {
      console.error('儲存失敗:', error);
      alert('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/export');
      const data = await res.json();

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calorie-count-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (error) {
      console.error('匯出失敗:', error);
      alert('匯出失敗');
    }
  };

  const handleClearData = async () => {
    if (!confirm('確定要清空所有數據嗎?此操作無法復原!')) return;
    if (!confirm('請再次確認:這將刪除所有飲食、運動、體重記錄!')) return;

    try {
      const res = await fetch('/api/clear-data', {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('數據已清空');
        window.location.reload();
      }
    } catch (error) {
      console.error('清空失敗:', error);
      alert('清空失敗');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('新密碼至少需要 8 個字元');
      return;
    }
    if (!/[A-Za-z]/.test(passwordForm.newPassword)) {
      setPasswordError('新密碼需包含至少一個英文字母');
      return;
    }
    if (!/[0-9]/.test(passwordForm.newPassword)) {
      setPasswordError('新密碼需包含至少一個數字');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('兩次輸入的密碼不一致');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || '修改失敗');
        return;
      }

      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 1500);
    } catch {
      setPasswordError('修改失敗，請稍後再試');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
          <Settings className="h-8 w-8 text-gray-600" />
          設定
        </h1>
        <p className="mt-2 text-gray-600">管理您的系統偏好設定</p>
      </div>

      {/* Preferences */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <Palette className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">偏好設定</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">主題</label>
            <select
              value={preferences.theme}
              onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500"
            >
              <option value="light">淺色</option>
              <option value="dark">深色</option>
              <option value="auto">自動</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">語言</label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500"
            >
              <option value="zh-TW">繁體中文</option>
              <option value="zh-CN">简体中文</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">通知設定</label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.notifications.mealReminder}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    notifications: {
                      ...preferences.notifications,
                      mealReminder: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 rounded text-purple-600"
              />
              <span className="text-gray-700">打卡提醒</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.notifications.achievementNotif}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    notifications: {
                      ...preferences.notifications,
                      achievementNotif: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 rounded text-purple-600"
              />
              <span className="text-gray-700">成就通知</span>
            </label>
          </div>

          <button
            onClick={handleSavePreferences}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2 text-white transition-colors hover:bg-purple-700 disabled:bg-gray-400"
          >
            <Save className="h-4 w-4" />
            {saving ? '儲存中...' : '儲存偏好'}
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <Database className="h-6 w-6 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-900">數據管理</h2>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="w-full rounded-lg bg-blue-50 px-4 py-3 text-left text-blue-700 transition-colors hover:bg-blue-100"
          >
            <div className="font-medium">匯出數據</div>
            <div className="text-sm text-blue-600">下載所有記錄為 JSON 格式</div>
          </button>

          <button
            onClick={handleClearData}
            className="w-full rounded-lg bg-red-50 px-4 py-3 text-left text-red-700 transition-colors hover:bg-red-100"
          >
            <div className="font-medium">清空數據</div>
            <div className="text-sm text-red-600">⚠️ 刪除所有記錄，無法復原</div>
          </button>
        </div>
      </div>

      {/* Account Management */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <Shield className="h-6 w-6 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">帳號管理</h2>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              setPasswordError(null);
              setPasswordSuccess(false);
              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              setShowPasswordModal(true);
            }}
            className="w-full rounded-lg bg-gray-50 px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-100"
          >
            <div className="font-medium">修改密碼</div>
            <div className="text-sm text-gray-600">變更您的登入密碼</div>
          </button>

          <button className="w-full rounded-lg bg-red-50 px-4 py-3 text-left text-red-700 transition-colors hover:bg-red-100">
            <div className="font-medium">刪除帳號</div>
            <div className="text-sm text-red-600">⚠️ 永久刪除帳號與所有數據</div>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <Info className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">關於</h2>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>版本: 1.0.0</p>
          <p>© 2025 Calorie Count. All rights reserved.</p>
          <div className="mt-4 flex gap-4">
            <a href="#" className="text-blue-600 hover:underline">
              隱私政策
            </a>
            <a href="#" className="text-blue-600 hover:underline">
              使用條款
            </a>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Lock className="h-5 w-5 text-gray-600" />
                修改密碼
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="rounded-full p-1 transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {passwordSuccess ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Save className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-green-600">密碼已成功更新！</p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">目前密碼</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">新密碼</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">至少 8 個字元，需包含英文字母與數字</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">確認新密碼</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                    required
                    autoComplete="new-password"
                  />
                </div>

                {passwordError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {passwordError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:bg-gray-400"
                  >
                    {passwordSaving ? '修改中...' : '確認修改'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
