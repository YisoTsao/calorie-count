/** 取得瀏覽器本地時區 */
export function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** 取得本地時區 UTC offset 字串，例如 '+08:00' */
export function getLocalUTCOffset(): string {
  const offsetMinutes = -new Date().getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const h = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0');
  const m = String(Math.abs(offsetMinutes) % 60).padStart(2, '0');
  return `${sign}${h}:${m}`;
}

/** 取得本地時區今日日期字串 YYYY-MM-DD */
export function getLocalToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: getLocalTimezone() });
}

// 向後相容
export const getTaipeiToday = getLocalToday;
