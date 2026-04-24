'use client';

export function RecognitionLoading() {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-8">
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
      <div className="relative w-56 h-56">
        <div className="absolute top-0 left-0 w-10 h-10 border-t-[3px] border-l-[3px] border-green-400 rounded-tl" />
        <div className="absolute top-0 right-0 w-10 h-10 border-t-[3px] border-r-[3px] border-green-400 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[3px] border-l-[3px] border-green-400 rounded-bl" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[3px] border-r-[3px] border-green-400 rounded-br" />
        {/* 外圍虛線框 */}
        <div className="absolute inset-0 border border-green-400/20 rounded" />
        {/* 掃描線 */}
        <div className="scan-line-moving" />
      </div>

      <div className="text-center space-y-2">
        <p className="text-green-400 text-xl font-semibold tracking-widest animate-pulse">
          AI 辨識中...
        </p>
        <p className="text-white/50 text-sm">正在分析食物照片，請稍候</p>
      </div>
    </div>
  );
}
