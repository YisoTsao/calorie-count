'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Loader2, CalendarX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import type { CookingScheduleEvent } from './CookingCalendarTypes';

// 10 色調色盤，依食譜名稱 hash 決定顏色，同名永遠同色
const EVENT_PALETTE = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#a855f7', // purple
];

function hashColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return EVENT_PALETTE[Math.abs(h) % EVENT_PALETTE.length];
}

// 動態載入 DnD 日曆（client-only，避免 SSR 問題）
const DnDCalendar = dynamic(() => import('./CalendarDnD'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  ),
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  resource: CookingScheduleEvent;
}

interface CookingCalendarInnerProps {
  events: CookingScheduleEvent[];
  currentDate: Date;
  onNavigate: (date: Date) => void;
  onDeleteEvent: (id: string) => Promise<void>;
  onDrop: (id: string, newDate: Date) => Promise<void>;
}

export function CookingCalendarInner({
  events,
  currentDate,
  onNavigate,
  onDeleteEvent,
  onDrop,
}: CookingCalendarInnerProps) {
  const [selected, setSelected] = useState<CookingScheduleEvent | null>(null);

  const calEvents: CalendarEvent[] = events.map((e) => ({
    id: e.id,
    title: e.recipeName,
    start: new Date(e.scheduledDate),
    end: new Date(e.scheduledDate),
    color: hashColor(e.recipeName),
    resource: e,
  }));

  const handleDelete = async () => {
    if (!selected) return;
    await onDeleteEvent(selected.id);
    setSelected(null);
  };

  return (
    <div className="relative">
      <DnDCalendar
        events={calEvents}
        date={currentDate}
        views={['month']}
        defaultView="month"
        style={{ height: 560 }}
        culture="zh-TW"
        messages={{
          next: '下一月', previous: '上一月', today: '今天',
          month: '月', week: '週', day: '日', agenda: '清單',
          noEventsInRange: '本月無排程',
        }}
        onNavigate={onNavigate}
        onSelectEvent={(event: object) => setSelected((event as CalendarEvent).resource)}
        eventPropGetter={(event: object) => ({
          style: {
            backgroundColor: (event as CalendarEvent).color,
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '0.8rem',
            padding: '2px 6px',
          },
        })}
        onEventDrop={({ event, start }: { event: object; start: Date | string }) => {
          onDrop((event as CalendarEvent).id, start instanceof Date ? start : new Date(start));
        }}
        draggableAccessor={() => true}
        resizable={false}
      />

      {/* 事件詳情 Dialog */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-80 rounded-xl bg-background p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mb-3 h-1 w-16 rounded-full"
              style={{ backgroundColor: hashColor(selected.recipeName) }}
            />
            <h3 className="mb-1 text-lg font-semibold">{selected.recipeName}</h3>
            <p className="mb-3 text-sm text-muted-foreground">
              {format(new Date(selected.scheduledDate), 'yyyy年 MM月 dd日', { locale: zhTW })}
            </p>
            {selected.note && <p className="mb-3 text-sm">{selected.note}</p>}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>
                關閉
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                刪除排程
              </Button>
            </div>
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="mt-4 flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <CalendarX className="mb-2 h-8 w-8" />
          <p className="text-sm">本月無烹煮排程，前往個人菜單或今日推薦加入計畫</p>
        </div>
      )}
    </div>
  );
}
