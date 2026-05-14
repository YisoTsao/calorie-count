'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { CookingCalendarInner } from './CookingCalendarInner';
import type { CookingScheduleEvent } from './CookingCalendarTypes';

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then((d) => d.data ?? []);

export function CookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = format(currentDate, 'yyyy-MM');

  const { data: events = [], isLoading, mutate } = useSWR<CookingScheduleEvent[]>(
    `/api/cooking-schedule?month=${currentMonth}`,
    fetcher
  );

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/cooking-schedule/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      mutate();
      toast.success('已刪除排程');
    } catch {
      toast.error('刪除失敗，請稍後再試');
    }
  };

  const handleDrop = useCallback(async (id: string, newDate: Date) => {
    // 樂觀更新
    mutate(
      events.map((e) => (e.id === id ? { ...e, scheduledDate: newDate.toISOString() } : e)),
      false
    );
    try {
      const res = await fetch(`/api/cooking-schedule/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledDate: newDate.toISOString() }),
      });
      if (!res.ok) throw new Error();
      toast.success('已更新排程日期');
      mutate();
    } catch {
      mutate(); // 還原
      toast.error('更新失敗，請稍後再試');
    }
  }, [mutate, events]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <CookingCalendarInner
      events={events}
      currentDate={currentDate}
      onNavigate={handleNavigate}
      onDeleteEvent={handleDelete}
      onDrop={handleDrop}
    />
  );
}
