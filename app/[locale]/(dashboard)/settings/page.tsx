"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Settings, Palette, Database, Shield, Info, Save, Eye, EyeOff, Lock, X } from "lucide-react";

interface UserProfile {
  name?: string;
  height?: number;
  gender?: "MALE" | "FEMALE" | "OTHER";
  bio?: string;
}

interface UserGoals {
  dailyCalorieGoal?: number;
  proteinGoal?: number;
  waterGoal?: number;
  targetWeight?: number;
}

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tc = useTranslations('common');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [profile, setProfile] = useState<UserProfile>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [goals, setGoals] = useState<UserGoals>({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "zh-TW",
    notifications: {
      mealReminder: true,
      achievementNotif: true,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // 載入個人資料
        const profileRes = await fetch("/api/users/me/profile");
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
        const goalsRes = await fetch("/api/goals");
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
        const prefsRes = await fetch("/api/preferences");
        if (prefsRes.ok) {
          const prefsData = await prefsRes.json();
          if (prefsData.data) {
            setPreferences({
              theme: (prefsData.data.theme || "LIGHT").toLowerCase(),
              language: prefsData.data.language || "zh-TW",
              notifications: {
                mealReminder: prefsData.data.notificationMealReminders ?? true,
                achievementNotif:
                  prefsData.data.notificationGoalReminders ?? true,
              },
            });
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
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
        theme: preferences.theme.toUpperCase() as "LIGHT" | "DARK" | "AUTO",
      };
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefsPayload),
      });

      if (res.ok) {
        alert(t('data.exportTitle') + " OK");
      } else {
        const error = await res.json();
        alert(tc('error') + ": " + (error.error || tc('unknown')));
      }
    } catch (error) {
      console.error("Failed to save preferences:", error);
      alert(tc('error'));
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch("/api/export");
      const data = await res.json();

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `calorie-count-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    } catch (error) {
      console.error("Failed to export data:", error);
      alert(tc('error'));
    }
  };

  const handleClearData = async () => {
    if (!confirm(t('data.clearConfirm'))) return;
    if (!confirm(t('data.clearDesc'))) return;

    try {
      const res = await fetch("/api/clear-data", {
        method: "DELETE",
      });

      if (res.ok) {
        alert(tc('success'));
        window.location.reload();
      }
    } catch (error) {
      console.error('Clear failed:', error);
      alert(t('data.clearFailed'));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwordForm.newPassword.length < 8) {
      setPasswordError(t('password.errors.tooShort'));
      return;
    }
    if (!/[A-Za-z]/.test(passwordForm.newPassword)) {
      setPasswordError(t('password.errors.noLetters'));
      return;
    }
    if (!/[0-9]/.test(passwordForm.newPassword)) {
      setPasswordError(t('password.errors.noNumbers'));
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(t('password.errors.mismatch'));
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || t('password.errors.generic'));
        return;
      }

      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 1500);
    } catch {
      setPasswordError(t('password.errors.generic'));
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">{tc('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-gray-600" />
          {t('title')}
        </h1>
        <p className="text-gray-600 mt-2">{t('subtitle')}</p>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">{t('sections.appearance')}</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('theme.title')}
            </label>
            <select
              value={preferences.theme}
              onChange={(e) =>
                setPreferences({ ...preferences, theme: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="light">{t('theme.light')}</option>
              <option value="dark">{t('theme.dark')}</option>
              <option value="auto">{t('theme.system')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('language.title')}
            </label>
            <select
              value={preferences.language}
              onChange={(e) =>
                setPreferences({ ...preferences, language: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="zh-TW">{t('language.zhTW')}</option>
              <option value="zh-CN">简体中文</option>
              <option value="en">{t('language.en')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('notifications.title')}
            </label>
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
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-gray-700">{t('notifications.mealReminder')}</span>
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
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-gray-700">{t('notifications.goalAlert')}</span>
            </label>
          </div>

          <button
            onClick={handleSavePreferences}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? tc('saving') : tc('save')}
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-900">{t('sections.data')}</h2>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left"
          >
            <div className="font-medium">{t('data.exportTitle')}</div>
            <div className="text-sm text-blue-600">
              {t('data.exportDesc')}
            </div>
          </button>

          <button
            onClick={handleClearData}
            className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-left"
          >
            <div className="font-medium">{t('data.clearTitle')}</div>
            <div className="text-sm text-red-600">
              ⚠️ {t('data.clearDesc')}
            </div>
          </button>
        </div>
      </div>

      {/* Account Management */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">{t('sections.account')}</h2>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              setPasswordError(null);
              setPasswordSuccess(false);
              setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
              setShowPasswordModal(true);
            }}
            className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <div className="font-medium">{t('account.changePassword')}</div>
            <div className="text-sm text-gray-600">{t('password.title')}</div>
          </button>

          <button className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-left">
            <div className="font-medium">{t('account.deleteAccount')}</div>
            <div className="text-sm text-red-600">
              ⚠️ {t('account.deleteAccountDesc')}
            </div>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Info className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">{t('sections.about')}</h2>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>版本: 1.0.0</p>
          <p>© 2025 Calorie Count. All rights reserved.</p>
          <div className="flex gap-4 mt-4">
            <a href="#" className="text-blue-600 hover:underline">
              {t('sections.privacy')}
            </a>
            <a href="#" className="text-blue-600 hover:underline">
              {t('sections.language')}
            </a>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-600" />
                {t('password.title')}
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {passwordSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Save className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-green-600">{t('password.success')}</p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('password.current')}</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('password.new')}</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{t('password.errors.tooShort')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('password.confirm')}</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    autoComplete="new-password"
                  />
                </div>

                {passwordError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                    {passwordError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {tc('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                  >
                    {passwordSaving ? t('password.submitting') : t('password.submit')}
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
