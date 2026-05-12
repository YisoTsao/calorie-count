/**
 * CaloLogo — Bioluminescent Circuit 設計哲學
 * 三元素合一：葉弧（飲食）+ 電路節點（AI）+ 動態弧（運動）
 * currentColor 可複用於任何背景
 */
export function CaloLogo({
  size = 18,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* 外圓環（含缺口暗示開放系統）*/}
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.65" strokeDasharray="56 6" />

      {/* 葉弧左側 */}
      <path d="M12 4 Q5.5 12 12 20" stroke="currentColor" strokeWidth="2" />

      {/* 葉弧右側 */}
      <path d="M12 4 Q18.5 12 12 20" stroke="currentColor" strokeWidth="2" />

      {/* 中心脈絡 */}
      <line x1="12" y1="4.8" x2="12" y2="19.2" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.75" />

      {/* 橫向葉脈 */}
      <line x1="9.4" y1="11.7" x2="14.6" y2="11.7" stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.6" />

      {/* AI 電路節點（右上，indigo 色）*/}
      <polygon
        points="17.5,5.5 18.8,6.8 17.5,8.1 16.2,6.8"
        stroke="#6366F1"
        strokeWidth="1"
        fill="#6366F1"
        fillOpacity="0.25"
        strokeOpacity="0.9"
      />
      {/* 節點射線 */}
      <line x1="17.5" y1="4.2" x2="17.5" y2="5.1" stroke="#6366F1" strokeWidth="0.85" strokeOpacity="0.8" />
      <line x1="19.3" y1="6.8" x2="18.4" y2="6.8" stroke="#6366F1" strokeWidth="0.85" strokeOpacity="0.8" />

      {/* 動態弧（左下，運動感）*/}
      <path
        d="M4.5 16.5 A3 3 0 0 1 8 14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeOpacity="0.9"
      />
      {/* 箭頭尖 */}
      <polyline
        points="6.8,13.2 8,14 7.0,15.2"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeOpacity="0.9"
      />

      {/* 中心核心點 */}
      <circle cx="12" cy="12" r="1.1" fill="currentColor" />
    </svg>
  );
}
