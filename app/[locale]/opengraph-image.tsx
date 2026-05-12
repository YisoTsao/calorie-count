/**
 * opengraph-image.tsx — 動態 OG 圖片產生器
 * Next.js 檔案慣例：自動掛載為 /{locale}/opengraph-image
 * 覆蓋所有需要 og:image 的社群平台：Facebook、LINE、Instagram、Google、X (Twitter)
 *
 * 注意：使用英文文字以避免 CJK 字型載入的複雜度（ImageResponse 預設不含 CJK 字型）
 */
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CalorieCount — AI-Powered Calorie Tracking';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 50%, #f0fdfa 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 背景裝飾圓形 */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            left: -120,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            right: -100,
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'rgba(13, 148, 136, 0.08)',
          }}
        />

        {/* App Icon */}
        <div
          style={{
            width: 96,
            height: 96,
            background: 'linear-gradient(135deg, #10b981, #0d9488)',
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35)',
            fontSize: 52,
          }}
        >
          🍎
        </div>

        {/* App Name */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: '#111827',
            letterSpacing: -3,
            marginBottom: 16,
            lineHeight: 1,
          }}
        >
          CalorieCount
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: '#6b7280',
            textAlign: 'center',
            maxWidth: 720,
            lineHeight: 1.4,
          }}
        >
          AI-Powered Food Recognition & Calorie Tracking
        </div>

        {/* 品牌色底部條 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: 'linear-gradient(90deg, #10b981, #0d9488)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
