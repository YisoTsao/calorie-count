'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-TW">
      <body>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px',
            fontFamily: 'sans-serif',
            color: '#111827',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>發生錯誤</h2>
          <p style={{ color: '#6b7280' }}>{error.message || '請稍後再試'}</p>
          <button
            onClick={reset}
            style={{
              padding: '8px 20px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            重試
          </button>
        </div>
      </body>
    </html>
  );
}
