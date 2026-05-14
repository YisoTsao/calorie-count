'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FoodConfirmCard } from './FoodConfirmCard';
import { MealTypeSelector } from './MealTypeSelector';
import type { ParsedFood } from '@/lib/ai/food-parser';

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  parsedFoods?: ParsedFood[];
  suggestedMealType?: MealType;
  needsClarification?: boolean;
  clarificationPrompt?: string | null;
}

type PanelState = 'idle' | 'sending' | 'awaiting_confirm' | 'confirming';

export function ConversationalDiaryPanel() {
  const t = useTranslations('aiDiary');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [state, setState] = useState<PanelState>('idle');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('LUNCH');
  const [pendingFoods, setPendingFoods] = useState<ParsedFood[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, state]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || state === 'sending') return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setState('sending');

    try {
      const res = await fetch('/api/ai/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, sessionId: sessionId ?? undefined }),
      });

      if (res.status === 402) {
        toast.error(t('quotaExceeded'));
        setState('idle');
        return;
      }

      if (!res.ok) {
        throw new Error('API 錯誤');
      }

      const { data } = await res.json();
      setSessionId(data.sessionId);

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.assistantMessage,
        parsedFoods: data.parsedFoods,
        suggestedMealType: data.suggestedMealType,
        needsClarification: data.needsClarification,
        clarificationPrompt: data.clarificationPrompt,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setPendingFoods(data.parsedFoods);
      setSelectedMealType(data.suggestedMealType);

      setState(
        data.needsClarification || data.parsedFoods.length === 0
          ? 'idle'
          : 'awaiting_confirm'
      );
    } catch {
      toast.error(t('sendError'));
      setState('idle');
    }
  };

  const handleConfirm = async () => {
    if (!sessionId || pendingFoods.length === 0) return;
    setState('confirming');

    try {
      const res = await fetch(`/api/ai/conversation/${sessionId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: selectedMealType,
          foods: pendingFoods,
        }),
      });

      if (!res.ok) throw new Error('確認失敗');

      toast.success(t('recordSaved'));
      // 重置
      setMessages([]);
      setSessionId(null);
      setPendingFoods([]);
      setState('idle');
    } catch {
      toast.error(t('confirmError'));
      setState('awaiting_confirm');
    }
  };

  const handleAbandon = async () => {
    if (sessionId) {
      await fetch(`/api/ai/conversation/${sessionId}`, { method: 'DELETE' }).catch(() => {});
    }
    setMessages([]);
    setSessionId(null);
    setPendingFoods([]);
    setState('idle');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-12rem)] max-w-2xl flex-col">
      {/* 對話區域 */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p className="text-center text-sm">
              {t('placeholder')}
              <br />
              <span className="text-xs">{t('examples')}</span>
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.parsedFoods && msg.parsedFoods.length > 0 && (
                <div className="mt-2">
                  <FoodConfirmCard foods={msg.parsedFoods} />
                </div>
              )}
            </div>
          </div>
        ))}

        {state === 'sending' && (
          <div className="flex justify-start">
            <div className="max-w-[85%] space-y-2 rounded-2xl bg-muted px-4 py-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        )}
      </div>

      {/* 確認區域 */}
      {state === 'awaiting_confirm' && pendingFoods.length > 0 && (
        <div className="border-t bg-background p-4">
          <div className="mb-3">
            <p className="mb-2 text-sm font-medium">{t('selectMealType')}</p>
            <MealTypeSelector
              suggested={selectedMealType}
              selected={selectedMealType}
              onSelect={setSelectedMealType}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleConfirm} className="flex-1 gap-2">
              <Check className="h-4 w-4" />
              {t('confirmRecord')}
            </Button>
            <Button variant="outline" onClick={handleAbandon} size="icon">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {state === 'confirming' && (
        <div className="border-t bg-background p-4">
          <Button disabled className="w-full gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('saving')}
          </Button>
        </div>
      )}

      {/* 輸入區域 */}
      <div className="border-t bg-background p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('inputPlaceholder')}
            disabled={state === 'sending' || state === 'confirming'}
            rows={1}
            className="flex-1 resize-none rounded-xl border bg-muted/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || state === 'sending' || state === 'confirming'}
            size="icon"
            className="shrink-0"
          >
            {state === 'sending' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
