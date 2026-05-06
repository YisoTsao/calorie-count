'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value: number;
  onValueChange: (v: number) => void;
}

/**
 * 專為數字輸入設計的元件：
 * - 內部維護字串狀態，不阻斷中間輸入（例：「0.」「」「3.14」）
 * - 只在 blur 時才向外傳遞 number，避免父元件每次按鍵都重渲染
 * - 支援刪除 0、輸入小數點
 */
export function NumberInput({ value, onValueChange, className, ...props }: NumberInputProps) {
  const [display, setDisplay] = useState(() => String(value));
  const focused = useRef(false);

  // 只在非 focus 時同步父層傳入的 value
  useEffect(() => {
    if (!focused.current) {
      setDisplay(String(value));
    }
  }, [value]);

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      className={cn(className)}
      value={display}
      onChange={(e) => {
        const v = e.target.value;
        // 允許：空字串、整數、小數（不允許負號，因為營養素不會是負數）
        if (v === '' || /^\d*\.?\d*$/.test(v)) {
          setDisplay(v);
        }
      }}
      onFocus={(e) => {
        focused.current = true;
        e.target.select();
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        focused.current = false;
        const n = parseFloat(display);
        const final = isNaN(n) ? 0 : n;
        setDisplay(String(final));
        onValueChange(final);
        props.onBlur?.(e);
      }}
    />
  );
}
