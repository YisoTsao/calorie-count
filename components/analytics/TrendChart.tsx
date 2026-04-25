'use client';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrendChartProps {
  data: Array<{
    date: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    water?: number;
    exercise?: number;
    weight?: number;
  }>;
  type: 'calories' | 'nutrients' | 'water' | 'exercise' | 'weight';
  title: string;
}

export default function TrendChart({ data, type, title }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400">
          <svg
            className="h-10 w-10 opacity-30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-sm">尚無資料，開始記錄後顯示趨勢圖</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const chartData = data.map((d) => ({
    ...d,
    date: formatDate(d.date),
  }));

  // 根據資料點數自動決定 XAxis 間距，避免日期擁擠
  const tickInterval = (() => {
    const n = chartData.length;
    if (n <= 14) return 0; // 14 天以內：每天顯示
    if (n <= 30) return 2; // 30 天：每 3 天一格
    if (n <= 60) return 6; // 60 天：每 7 天一格
    return 13; // 90 天：每 2 週一格
  })();

  // 90 天以上使用可橫向滾動容器，避免擠壓
  const needsWideLayout = chartData.length > 60;
  const minChartWidth = needsWideLayout ? chartData.length * 12 : undefined;

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
    },
  };

  const xAxis = (
    <XAxis
      dataKey="date"
      stroke="#888"
      style={{ fontSize: '11px' }}
      interval={tickInterval}
      tick={{ fontSize: 11 }}
    />
  );

  const yAxis = <YAxis stroke="#888" style={{ fontSize: '12px' }} />;

  const grid = <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />;

  const innerChart = (() => {
    if (type === 'calories')
      return (
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          {grid}
          {xAxis}
          {yAxis}
          <Tooltip {...tooltipStyle} />
          <Area
            type="monotone"
            dataKey="calories"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorCalories)"
            name="卡路里"
          />
        </AreaChart>
      );

    if (type === 'nutrients')
      return (
        <LineChart data={chartData}>
          {grid}
          {xAxis}
          {yAxis}
          <Tooltip {...tooltipStyle} />
          <Legend />
          <Line
            type="monotone"
            dataKey="protein"
            stroke="#ef4444"
            strokeWidth={2}
            name="蛋白質 (g)"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="carbs"
            stroke="#f59e0b"
            strokeWidth={2}
            name="碳水 (g)"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="fat"
            stroke="#10b981"
            strokeWidth={2}
            name="脂肪 (g)"
            dot={false}
          />
        </LineChart>
      );

    if (type === 'water')
      return (
        <BarChart data={chartData}>
          {grid}
          {xAxis}
          {yAxis}
          <Tooltip {...tooltipStyle} />
          <Bar
            dataKey="water"
            fill="#3b82f6"
            name="飲水量 (ml)"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      );

    if (type === 'exercise')
      return (
        <BarChart data={chartData}>
          {grid}
          {xAxis}
          {yAxis}
          <Tooltip {...tooltipStyle} />
          <Bar
            dataKey="exercise"
            fill="#f97316"
            name="運動時長 (分)"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      );

    // weight
    return (
      <LineChart data={chartData}>
        {grid}
        {xAxis}
        <YAxis stroke="#888" style={{ fontSize: '12px' }} domain={['dataMin - 2', 'dataMax + 2']} />
        <Tooltip {...tooltipStyle} formatter={(v) => [`${v} kg`, '體重']} />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#9333ea"
          strokeWidth={3}
          dot={{ fill: '#9333ea', r: 4 }}
          name="體重 (kg)"
          connectNulls={false}
        />
      </LineChart>
    );
  })();

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>

      {needsWideLayout ? (
        // 寬圖表：橫向滾動
        <div className="overflow-x-auto">
          <div style={{ minWidth: minChartWidth, height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              {innerChart}
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          {innerChart}
        </ResponsiveContainer>
      )}
    </div>
  );
}
