import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合併 Tailwind CSS 類別
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string, locale: string = 'zh-TW'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * 格式化日期時間
 */
export function formatDateTime(date: Date | string, locale: string = 'zh-TW'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * 計算 BMI
 */
export function calculateBMI(weight: number, height: number): number {
  // weight in kg, height in cm
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
}

/**
 * 取得 BMI 類別
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return '體重過輕';
  if (bmi < 24) return '正常範圍';
  if (bmi < 27) return '過重';
  if (bmi < 30) return '輕度肥胖';
  if (bmi < 35) return '中度肥胖';
  return '重度肥胖';
}

/**
 * 等待指定時間
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 截斷文字
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * 格式化數字 (加入千分位)
 */
export function formatNumber(num: number, locale: string = 'zh-TW'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * 隨機生成 token
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
