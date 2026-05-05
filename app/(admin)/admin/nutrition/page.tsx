'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// ─── 型別 ───────────────────────────────────────────────────────────────────

interface MemberOption {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface DailyRow {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  meals: number;
}

interface NutritionData {
  user: MemberOption;
  daily: DailyRow[];
  totals: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  activeDays: number;
  totalDays: number;
}

// ─── 日期工具 ────────────────────────────────────────────────────────────────

function toLocalDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function today() {
  return toLocalDateStr(new Date());
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toLocalDateStr(d);
}

// ─── 圓餅圖顏色 ──────────────────────────────────────────────────────────────

const MACRO_COLORS = ['#4648d4', '#10b981', '#f59e0b'];

// ─── 預設日期區間 ─────────────────────────────────────────────────────────────

const PRESETS = [
  { label: '今天', start: () => today(), end: () => today() },
  { label: '最近 7 天', start: () => daysAgo(6), end: () => today() },
  { label: '最近 30 天', start: () => daysAgo(29), end: () => today() },
];

// ─── 統計卡片 ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-900/60 p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          <Icon icon={icon} className="text-lg text-white" />
        </div>
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

// ─── 主元件 ──────────────────────────────────────────────────────────────────

export default function AdminNutritionPage() {
  // 會員搜尋
  const [memberQ, setMemberQ] = useState('');
  const [memberOptions, setMemberOptions] = useState<MemberOption[]>([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // 日期區間
  const [startDate, setStartDate] = useState(daysAgo(6));
  const [endDate, setEndDate] = useState(today());
  const [activePreset, setActivePreset] = useState(1); // 最近 7 天

  // 營養資料
  const [data, setData] = useState<NutritionData | null>(null);
  const [loading, setLoading] = useState(false);

  // ── 搜尋會員 ─────────────────────────────────────────────────────────────

  const searchMembers = useCallback(async (q: string) => {
    if (!q.trim()) {
      setMemberOptions([]);
      return;
    }
    setMemberLoading(true);
    const res = await fetch(`/api/admin/members?q=${encodeURIComponent(q)}&limit=10`);
    const json = await res.json();
    setMemberOptions(json.users ?? []);
    setMemberLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchMembers(memberQ), 350);
    return () => clearTimeout(t);
  }, [memberQ, searchMembers]);

  // ── 查詢營養 ─────────────────────────────────────────────────────────────

  const fetchNutrition = useCallback(async () => {
    if (!selectedMember) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId: selectedMember.id,
        start: startDate,
        end: endDate,
      });
      const res = await fetch(`/api/admin/nutrition?${params}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [selectedMember, startDate, endDate]);

  useEffect(() => {
    if (selectedMember) fetchNutrition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMember, startDate, endDate]);

  // ── 圖表資料 ─────────────────────────────────────────────────────────────

  const barData = data?.daily.map((d) => ({
    date: d.date.slice(5), // MM-DD
    熱量: d.calories,
    蛋白質: d.protein,
    碳水: d.carbs,
    脂肪: d.fat,
  }));

  const avgCalories =
    data && data.activeDays > 0 ? (data.totals.calories / data.activeDays).toFixed(0) : '—';

  const macroTotal =
    data ? data.totals.protein * 4 + data.totals.carbs * 4 + data.totals.fat * 9 : 0;

  const pieData = macroTotal > 0 && data
    ? [
        { name: '蛋白質', value: +((data.totals.protein * 4 / macroTotal) * 100).toFixed(1) },
        { name: '碳水', value: +((data.totals.carbs * 4 / macroTotal) * 100).toFixed(1) },
        { name: '脂肪', value: +((data.totals.fat * 9 / macroTotal) * 100).toFixed(1) },
      ]
    : [];

  // ── 渲染 ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* 標題 */}
      <div>
        <h1 className="font-['Manrope',sans-serif] text-2xl font-bold text-white">會員營養分析</h1>
        <p className="mt-1 text-sm text-slate-400">查詢指定會員在某時段的熱量與三大營養素</p>
      </div>

      {/* 篩選列 */}
      <div className="flex flex-wrap gap-3">
        {/* 會員搜尋 */}
        <div className="relative min-w-[260px] flex-1">
          <Icon
            icon="mdi:account-search-outline"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-500"
          />
          <input
            type="text"
            placeholder="搜尋會員姓名或 Email..."
            value={selectedMember ? (selectedMember.name ?? selectedMember.email ?? '') : memberQ}
            onChange={(e) => {
              setSelectedMember(null);
              setData(null);
              setMemberQ(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            className="w-full rounded-xl bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
          />
          {/* 下拉 */}
          {showDropdown && (memberLoading || memberOptions.length > 0) && (
            <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
              {memberLoading ? (
                <div className="p-3 text-center text-sm text-slate-500">搜尋中…</div>
              ) : (
                memberOptions.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-800"
                    onMouseDown={() => {
                      setSelectedMember(m);
                      setShowDropdown(false);
                      setMemberQ('');
                    }}
                  >
                    <div className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-700">
                      {m.image ? (
                        <Image
                          src={m.image}
                          alt={m.name ?? ''}
                          fill
                          className="object-cover"
                          sizes="28px"
                          unoptimized={m.image.includes('?')}
                        />
                      ) : (
                        <span className="text-xs font-medium text-slate-300">
                          {(m.name ?? m.email ?? '?')[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{m.name ?? '未命名'}</p>
                      <p className="text-xs text-slate-500">{m.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* 預設日期 */}
        <div className="flex gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setStartDate(p.start());
                setEndDate(p.end());
                setActivePreset(i);
              }}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                activePreset === i
                  ? 'bg-[#4648d4] text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* 自訂日期 */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setActivePreset(-1);
            }}
            className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
          />
          <span className="text-slate-500">—</span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={today()}
            onChange={(e) => {
              setEndDate(e.target.value);
              setActivePreset(-1);
            }}
            className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
          />
        </div>
      </div>

      {/* 尚未選擇會員 */}
      {!selectedMember && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-900/40 py-20 text-slate-500">
          <Icon icon="mdi:account-heart-outline" className="mb-3 text-5xl opacity-40" />
          <p className="text-sm">請先搜尋並選擇一位會員</p>
        </div>
      )}

      {/* 載入中 */}
      {selectedMember && loading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-800/50" />
          ))}
        </div>
      )}

      {/* 資料顯示 */}
      {selectedMember && !loading && data && (
        <>
          {/* 會員資訊列 */}
          <div className="flex items-center gap-3 rounded-2xl bg-slate-900/60 px-5 py-3">
            <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-700">
              {data.user.image ? (
                <Image
                  src={data.user.image}
                  alt={data.user.name ?? ''}
                  fill
                  className="object-cover"
                  sizes="36px"
                  unoptimized={data.user.image.includes('?')}
                />
              ) : (
                <span className="text-sm font-medium text-slate-300">
                  {(data.user.name ?? data.user.email ?? '?')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-white">{data.user.name ?? '未命名'}</p>
              <p className="text-xs text-slate-500">{data.user.email}</p>
            </div>
            <div className="ml-auto text-right text-xs text-slate-500">
              <p>
                {startDate} ～ {endDate}
              </p>
              <p>
                {data.activeDays} / {data.totalDays} 天有紀錄
              </p>
            </div>
          </div>

          {/* 統計卡片 */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              icon="mdi:fire"
              label="總熱量"
              value={`${data.totals.calories.toLocaleString()} kcal`}
              sub={`平均 ${avgCalories} kcal/天`}
              color="bg-orange-500/80"
            />
            <StatCard
              icon="mdi:arm-flex-outline"
              label="蛋白質"
              value={`${data.totals.protein} g`}
              color="bg-[#4648d4]/80"
            />
            <StatCard
              icon="mdi:grain"
              label="碳水化合物"
              value={`${data.totals.carbs} g`}
              color="bg-emerald-600/80"
            />
            <StatCard
              icon="mdi:water-outline"
              label="脂肪"
              value={`${data.totals.fat} g`}
              color="bg-amber-600/80"
            />
          </div>

          {/* 無資料提示 */}
          {data.activeDays === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-900/40 py-16 text-slate-500">
              <Icon icon="mdi:food-off-outline" className="mb-3 text-4xl opacity-40" />
              <p className="text-sm">此時段無飲食紀錄</p>
            </div>
          ) : (
            <>
              {/* 每日熱量長條圖 */}
              <div className="rounded-2xl bg-slate-900/60 p-5">
                <p className="mb-4 font-semibold text-white">每日熱量 (kcal)</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        color: '#f1f5f9',
                      }}
                    />
                    <Bar dataKey="熱量" fill="#4648d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 三大營養素趨勢 */}
              <div className="rounded-2xl bg-slate-900/60 p-5">
                <p className="mb-4 font-semibold text-white">三大營養素趨勢 (g)</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        color: '#f1f5f9',
                      }}
                    />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                    <Bar dataKey="蛋白質" fill="#4648d4" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="碳水" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="脂肪" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 區間巨量營養素比例 */}
              {pieData.length > 0 && (
                <div className="rounded-2xl bg-slate-900/60 p-5">
                  <p className="mb-4 font-semibold text-white">熱量來源比例（依能量計算）</p>
                  <div className="flex flex-col items-center gap-6 sm:flex-row">
                    <ResponsiveContainer width={200} height={200}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          dataKey="value"
                        >
                          {pieData.map((_, index) => (
                            <Cell key={index} fill={MACRO_COLORS[index % MACRO_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: number) => `${v}%`}
                          contentStyle={{
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: 8,
                            color: '#f1f5f9',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {pieData.map((p, i) => (
                        <div key={p.name} className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 flex-shrink-0 rounded-full"
                            style={{ background: MACRO_COLORS[i] }}
                          />
                          <span className="text-sm text-slate-300">{p.name}</span>
                          <span className="ml-auto pl-6 font-semibold text-white">{p.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 每日明細表 */}
              <div className="overflow-hidden rounded-2xl bg-slate-900/60">
                <p className="border-b border-slate-800/60 px-5 py-3 font-semibold text-white">
                  每日明細
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800/60 text-left text-slate-500">
                      <th className="px-5 py-2.5">日期</th>
                      <th className="px-4 py-2.5 text-right">熱量</th>
                      <th className="px-4 py-2.5 text-right">蛋白質</th>
                      <th className="px-4 py-2.5 text-right">碳水</th>
                      <th className="px-4 py-2.5 text-right">脂肪</th>
                      <th className="px-4 py-2.5 text-right">餐數</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {data.daily.map((d) => (
                      <tr
                        key={d.date}
                        className={`transition-colors hover:bg-slate-800/30 ${d.meals === 0 ? 'opacity-30' : ''}`}
                      >
                        <td className="px-5 py-2.5 text-slate-300">{d.date}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-white">
                          {d.meals > 0 ? `${d.calories} kcal` : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right text-indigo-400">
                          {d.meals > 0 ? `${d.protein} g` : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right text-emerald-400">
                          {d.meals > 0 ? `${d.carbs} g` : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right text-amber-400">
                          {d.meals > 0 ? `${d.fat} g` : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-400">{d.meals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
