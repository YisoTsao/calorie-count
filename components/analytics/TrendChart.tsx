'use client';

import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-center text-gray-400 py-8">尚無資料</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const chartData = data.map(d => ({
    ...d,
    date: formatDate(d.date)
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        {type === 'calories' && (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
            <YAxis stroke="#888" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="calories" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorCalories)"
              name="卡路里"
            />
          </AreaChart>
        )}

        {type === 'nutrients' && (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
            <YAxis stroke="#888" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="protein" stroke="#ef4444" strokeWidth={2} name="蛋白質 (g)" />
            <Line type="monotone" dataKey="carbs" stroke="#f59e0b" strokeWidth={2} name="碳水 (g)" />
            <Line type="monotone" dataKey="fat" stroke="#10b981" strokeWidth={2} name="脂肪 (g)" />
          </LineChart>
        )}

        {type === 'water' && (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
            <YAxis stroke="#888" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="water" fill="#3b82f6" name="飲水量 (ml)" radius={[8, 8, 0, 0]} />
          </BarChart>
        )}

        {type === 'exercise' && (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
            <YAxis stroke="#888" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="exercise" fill="#f97316" name="運動時長 (分)" radius={[8, 8, 0, 0]} />
          </BarChart>
        )}

        {type === 'weight' && (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
            <YAxis 
              stroke="#888" 
              style={{ fontSize: '12px' }}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#9333ea" 
              strokeWidth={3}
              dot={{ fill: '#9333ea', r: 4 }}
              name="體重 (kg)"
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
