'use client';

import { useTranslations } from 'next-intl';

export function RecognitionLoading() {
  const t = useTranslations('scan');
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-black">
      <style>{`
        @keyframes scanMoveAnim {
          0%   { top: 0%; }
          50%  { top: calc(100% - 2px); }
          100% { top: 0%; }
        }
        .scan-line-moving {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(to right, transparent, #4ade80, transparent);
          animation: scanMoveAnim 1.8s ease-in-out infinite;
        }
      `}</style>

      {/* 掃描角框 */}
      <div className="relative h-56 w-56">
        <div className="absolute left-0 top-0 h-10 w-10 rounded-tl border-l-[3px] border-t-[3px] border-green-400" />
        <div className="absolute right-0 top-0 h-10 w-10 rounded-tr border-r-[3px] border-t-[3px] border-green-400" />
        <div className="absolute bottom-0 left-0 h-10 w-10 rounded-bl border-b-[3px] border-l-[3px] border-green-400" />
        <div className="absolute bottom-0 right-0 h-10 w-10 rounded-br border-b-[3px] border-r-[3px] border-green-400" />
        {/* 外圍虛線框 */}
        <div className="absolute inset-0 rounded border border-green-400/20" />
        {/* 掃描線 */}
        <div className="scan-line-moving" />
      </div>

      <div className="space-y-2 text-center">
        <p className="animate-pulse text-xl font-semibold tracking-widest text-green-400">
          {t('analyzing')}
        </p>
        <p className="text-sm text-white/50">{t('analyzingDesc')}</p>
      </div>
    </div>
  );
}
