"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  User,
  Target,
  Palette,
  Database,
  Shield,
  Info,
  Save,
} from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"goals" | "preferences">("goals");

  const [profile, setProfile] = useState<UserProfile>({});
  const [goals, setGoals] = useState<UserGoals>({});
  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "zh-TW",
    notifications: {
      mealReminder: true,
      achievementNotif: true,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 載入個人資料
      const profileRes = await fetch("/api/users/me/profile");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        // GET /api/users/me/profile 回傳 { data: user } 包含 user 物件
        const userData = profileData.data;
        setProfile({
          name: userData?.name,
          height: userData?.profile?.height,
          gender: userData?.profile?.gender ?? undefined,
          bio: userData?.profile?.bio ?? undefined,
        });
        // targetWeight 在 UserProfile，預先設入 goals state
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
        // GET /api/goals 回傳 { data: { goals, profile } }
        // targetWeight 存在 UserProfile，從 profileRes 取得
        const g = goalsData.data?.goals || {};
        setGoals((prev) => ({
          dailyCalorieGoal: g.dailyCalorieGoal,
          proteinGoal: g.proteinGoal,
          waterGoal: g.waterGoal,
          targetWeight: prev.targetWeight, // 保留已從 profile 設置的 targetWeight
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
      console.error("載入資料失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        alert("個人資料已儲存");
      } else {
        const error = await res.json();
        alert(`儲存失敗: ${error.error || "未知錯誤"}`);
      }
    } catch (error) {
      console.error("儲存失敗:", error);
      alert("儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGoals = async () => {
    setSaving(true);
    try {
      // dailyCalorieGoal / proteinGoal / waterGoal → UserGoals
      const goalsPayload = {
        ...(goals.dailyCalorieGoal !== undefined && {
          dailyCalorieGoal: goals.dailyCalorieGoal,
        }),
        ...(goals.proteinGoal !== undefined && {
          proteinGoal: goals.proteinGoal,
        }),
        ...(goals.waterGoal !== undefined && { waterGoal: goals.waterGoal }),
      };

      const requests: Promise<Response>[] = [
        fetch("/api/goals", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(goalsPayload),
        }),
      ];

      // targetWeight → UserProfile（欄位不在 UserGoals schema）
      if (goals.targetWeight !== undefined) {
        requests.push(
          fetch("/api/users/me/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetWeight: goals.targetWeight }),
          }),
        );
      }

      const results = await Promise.all(requests);
      if (results.every((r) => r.ok)) {
        alert("目標已儲存");
      } else {
        alert("部分目標儲存失敗，請再試一次");
      }
    } catch (error) {
      console.error("儲存失敗:", error);
      alert("儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      // 將 UI 使用的小寫 theme 轉成 API 需要的大寫枚舉
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
        alert("偏好設定已儲存");
      } else {
        const error = await res.json();
        alert(`儲存失敗: ${error.error || "未知錯誤"}`);
      }
    } catch (error) {
      console.error("儲存失敗:", error);
      alert("儲存失敗");
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
      console.error("匯出失敗:", error);
      alert("匯出失敗");
    }
  };

  const handleClearData = async () => {
    if (!confirm("確定要清空所有數據嗎?此操作無法復原!")) return;
    if (!confirm("請再次確認:這將刪除所有飲食、運動、體重記錄!")) return;

    try {
      const res = await fetch("/api/clear-data", {
        method: "DELETE",
      });

      if (res.ok) {
        alert("數據已清空");
        window.location.reload();
      }
    } catch (error) {
      console.error("清空失敗:", error);
      alert("清空失敗");
    }
  };

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-gray-600" />
          設定
        </h1>
        <p className="text-gray-600 mt-2">管理您的個人資料與偏好設定</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("goals")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === "goals"
              ? "bg-white text-gray-900 shadow"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Target className="w-4 h-4" />
          目標設定
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === "preferences"
              ? "bg-white text-gray-900 shadow"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Palette className="w-4 h-4" />
          偏好設定
        </button>
      </div>

      {/* Goals Tab */}
      {activeTab === "goals" && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">目標設定</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                每日卡路里目標 (kcal)
              </label>
              <input
                type="number"
                value={goals.dailyCalorieGoal || ""}
                onChange={(e) =>
                  setGoals({
                    ...goals,
                    dailyCalorieGoal: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="2000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                每日蛋白質目標 (g)
              </label>
              <input
                type="number"
                value={goals.proteinGoal || ""}
                onChange={(e) =>
                  setGoals({ ...goals, proteinGoal: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="80"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                每日飲水目標 (ml)
              </label>
              <input
                type="number"
                value={goals.waterGoal || ""}
                onChange={(e) =>
                  setGoals({ ...goals, waterGoal: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="2000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目標體重 (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={goals.targetWeight || ""}
                onChange={(e) =>
                  setGoals({
                    ...goals,
                    targetWeight: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="68.0"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            * 目標體重儲存於個人資料，其餘目標儲存於目標設定
          </p>

          <button
            onClick={handleSaveGoals}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "儲存中..." : "儲存目標"}
          </button>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="space-y-4">
          {/* Preferences */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">偏好設定</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  主題
                </label>
                <select
                  value={preferences.theme}
                  onChange={(e) =>
                    setPreferences({ ...preferences, theme: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="light">淺色</option>
                  <option value="dark">深色</option>
                  <option value="auto">自動</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  語言
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) =>
                    setPreferences({ ...preferences, language: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="zh-TW">繁體中文</option>
                  <option value="zh-CN">简体中文</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  通知設定
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
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-gray-700">成就通知</span>
                </label>
              </div>

              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? "儲存中..." : "儲存偏好"}
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">數據管理</h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left"
              >
                <div className="font-medium">匯出數據</div>
                <div className="text-sm text-blue-600">
                  下載所有記錄為 JSON 格式
                </div>
              </button>

              <button
                onClick={handleClearData}
                className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-left"
              >
                <div className="font-medium">清空數據</div>
                <div className="text-sm text-red-600">
                  ⚠️ 刪除所有記錄，無法復原
                </div>
              </button>
            </div>
          </div>

          {/* Account Management */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">帳號管理</h2>
            </div>

            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-left">
                <div className="font-medium">修改密碼</div>
                <div className="text-sm text-gray-600">變更您的登入密碼</div>
              </button>

              <button
                onClick={() => {
                  /* Handle logout */
                }}
                className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <div className="font-medium">登出</div>
                <div className="text-sm text-gray-600">登出此帳號</div>
              </button>

              <button className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-left">
                <div className="font-medium">刪除帳號</div>
                <div className="text-sm text-red-600">
                  ⚠️ 永久刪除帳號與所有數據
                </div>
              </button>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">關於</h2>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>版本: 1.0.0</p>
              <p>© 2025 Calorie Count. All rights reserved.</p>
              <div className="flex gap-4 mt-4">
                <a href="#" className="text-blue-600 hover:underline">
                  隱私政策
                </a>
                <a href="#" className="text-blue-600 hover:underline">
                  使用條款
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
