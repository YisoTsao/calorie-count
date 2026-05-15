'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Icon } from '@iconify/react';

interface VoiceFloatButtonProps {
  onResult: (text: string) => void;
  disabled?: boolean;
}

// 語言代碼對應 Web Speech API 語言
const LANG_MAP: Record<string, string> = {
  'zh-TW': 'zh-TW',
  en: 'en-US',
  ja: 'ja-JP',
};

// SpeechRecognition 在部分 TS 環境下未被 DOM lib 涵蓋，手動定義最小介面
interface SRInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SRCtor = new () => SRInstance;

export function VoiceFloatButton({ onResult, disabled }: VoiceFloatButtonProps) {
  const t = useTranslations('aiDiary.voice');
  const locale = useLocale();
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SRInstance | null>(null);
  // 用 ref 穩定 onResult，避免每次 parent state 變化都重建 recognition
  const onResultRef = useRef(onResult);
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);

  useEffect(() => {
    // 僅在瀏覽器環境檢查支援度
    const win = window as typeof window & {
      SpeechRecognition?: SRCtor;
      webkitSpeechRecognition?: SRCtor;
    };
    const SR: SRCtor | undefined = win.SpeechRecognition ?? win.webkitSpeechRecognition;

    console.log('[Voice] 檢查 SpeechRecognition 支援:', {
      SpeechRecognition: !!win.SpeechRecognition,
      webkitSpeechRecognition: !!win.webkitSpeechRecognition,
      supported: !!SR,
      protocol: window.location.protocol,
      host: window.location.host,
    });

    if (!SR) {
      console.warn('[Voice] 瀏覽器不支援 SpeechRecognition，按鈕將隱藏。');
      return;
    }
    setIsSupported(true);

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = LANG_MAP[locale] ?? 'zh-TW';
    console.log('[Voice] Recognition 初始化完成，lang:', recognition.lang);

    recognition.onstart = () => {
      console.log('[Voice] 錄音開始');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      const isFinal = event.results[event.results.length - 1].isFinal;

      console.log(`[Voice] 辨識結果 (${isFinal ? '最終' : '中間'}):`, transcript);

      if (isFinal) {
        onResultRef.current(transcript);
        setInterimText('');
        setIsRecording(false);
      } else {
        setInterimText(transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[Voice] 辨識錯誤:', event.error, event.message ?? '');
      setIsRecording(false);
      setInterimText('');
    };

    recognition.onend = () => {
      console.log('[Voice] 錄音結束');
      setIsRecording(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;

    return () => {
      console.log('[Voice] 清理 recognition 實例 (locale 變更)');
      recognition.abort();
    };
  // onResult 已改用 ref，所以不放進 deps，避免 state 改變時重建
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const toggleRecording = useCallback(() => {
    if (disabled) return;

    if (isRecording) {
      console.log('[Voice] 使用者手動停止錄音');
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        console.log('[Voice] 已呼叫 recognition.start()');
      } catch (err) {
        console.error('[Voice] start() 失敗（可能已在錄音中）:', err);
      }
    }
  }, [disabled, isRecording]);

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* 即時辨識文字氣泡 */}
      <AnimatePresence>
        {interimText && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="max-w-[240px] rounded-2xl rounded-br-sm bg-white px-4 py-2 text-sm text-gray-700 shadow-lg ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
          >
            {interimText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 提示文字（錄音中） */}
      <AnimatePresence>
        {isRecording && !interimText && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-emerald-600 dark:text-emerald-400"
          >
            {t('listening')}
          </motion.p>
        )}
      </AnimatePresence>

      {/* 浮動麥克風按鈕 */}
      <motion.button
        onClick={toggleRecording}
        disabled={disabled}
        aria-label={isRecording ? t('stopRecording') : t('startRecording')}
        whileTap={{ scale: 0.92 }}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all disabled:opacity-50 ${
          isRecording
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-emerald-500 text-white hover:bg-emerald-600'
        }`}
      >
        {/* 錄音中的脈衝動畫 */}
        {isRecording && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-30" />
            <span className="absolute inset-0 animate-pulse rounded-full bg-red-400 opacity-20" />
          </>
        )}
        <Icon icon={isRecording ? 'lucide:mic-off' : 'lucide:mic'} className="relative h-6 w-6" />
      </motion.button>
    </div>
  );
}
