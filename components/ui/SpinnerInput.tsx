'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpinnerInputProps {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  hint?: string;
  /** tailwind text color class, e.g. 'text-emerald-500' */
  accentClass?: string;
  /** display decimal places (default: auto from step) */
  decimals?: number;
}

export function SpinnerInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  unit,
  hint,
  accentClass = 'text-emerald-500',
  decimals,
}: SpinnerInputProps) {
  const dp = decimals ?? (step < 1 ? String(step).split('.')[1]?.length ?? 1 : 0);

  const clamp = (v: number) => {
    const rounded = Math.round(v / step) * step;
    const clamped = Math.min(max, Math.max(min, rounded));
    return parseFloat(clamped.toFixed(dp));
  };

  const fmt = (v: number) => v.toFixed(dp);

  // 追蹤動畫方向
  const dirRef = useRef<1 | -1>(1);
  const [isActive, setIsActive] = useState(false);

  // 用 ref 穩定 onChange，避免 deps 爆炸
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);

  const set = (newVal: number) => {
    const c = clamp(newVal);
    if (c !== value) {
      dirRef.current = c > value ? 1 : -1;
      onChangeRef.current(c);
    }
  };

  // ── 水平拖拉 ───────────────────────────────────────────────
  const dragRef = useRef<{ x: number; startValue: number } | null>(null);
  const pxPerStep = step >= 50 ? 4 : step >= 10 ? 6 : step < 1 ? 16 : 8;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { x: e.clientX, startValue: valueRef.current };
    setIsActive(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const steps = Math.round((e.clientX - dragRef.current.x) / pxPerStep);
    set(dragRef.current.startValue + steps * step);
  };

  const onPointerUp = () => {
    dragRef.current = null;
    setIsActive(false);
  };

  // ── 長按按鈕 ───────────────────────────────────────────────
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPress = (delta: number) => {
    set(valueRef.current + delta * step);
    intervalRef.current = setInterval(() => {
      set(valueRef.current + delta * step);
    }, 80);
  };

  const stopPress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const prev = clamp(value - step);
  const next = clamp(value + step);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-sm font-semibold text-muted-foreground tracking-wide">{label}</span>

      <div className="flex items-center gap-2">
        {/* 減少 */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xl font-bold transition hover:bg-muted/70 active:scale-90 select-none"
          onPointerDown={() => startPress(-1)}
          onPointerUp={stopPress}
          onPointerLeave={stopPress}
          onPointerCancel={stopPress}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>

        {/* 鼓輪顯示區域 */}
        <div
          className={`relative flex h-20 w-28 cursor-ew-resize select-none touch-none flex-col items-center justify-center overflow-hidden rounded-2xl transition-colors ${
            isActive ? 'bg-muted/60 ring-2 ring-primary/30' : 'bg-muted/30'
          }`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-label={`${label}: ${fmt(value)}${unit ? ` ${unit}` : ''}`}
          role="slider"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
        >
          {/* 上方隱約刻度 */}
          <span className="absolute top-2 text-xs font-medium text-muted-foreground/30 pointer-events-none">
            {prev !== value ? fmt(prev) : ''}
          </span>

          {/* 分隔線 */}
          <div className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-[14px] h-px bg-muted-foreground/10" />
          <div className="pointer-events-none absolute inset-x-4 top-1/2 translate-y-[14px] h-px bg-muted-foreground/10" />

          {/* 主數值（動畫） */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={{ y: dirRef.current * -22, opacity: 0, scale: 0.75 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: dirRef.current * 22, opacity: 0, scale: 0.75 }}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              className={`text-3xl font-bold tabular-nums ${accentClass}`}
            >
              {fmt(value)}
            </motion.span>
          </AnimatePresence>

          {/* 下方隱約刻度 */}
          <span className="absolute bottom-2 text-xs font-medium text-muted-foreground/30 pointer-events-none">
            {next !== value ? fmt(next) : ''}
          </span>

          {/* 拖拉中指示器 */}
          {isActive && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-primary/50 rounded-full" />
          )}
        </div>

        {/* 增加 */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xl font-bold transition hover:bg-muted/70 active:scale-90 select-none"
          onPointerDown={() => startPress(1)}
          onPointerUp={stopPress}
          onPointerLeave={stopPress}
          onPointerCancel={stopPress}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>

      {unit && (
        <span className="text-xs font-medium text-muted-foreground">{unit}</span>
      )}
      {hint && (
        <span className="text-xs text-muted-foreground/60 text-center leading-tight">{hint}</span>
      )}
    </div>
  );
}
