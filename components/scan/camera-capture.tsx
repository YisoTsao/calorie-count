"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Camera, SwitchCamera, X } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [scanning, setScanning] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);

  const [isMobile] = useState(() => {
    if (typeof window === "undefined") return false;

    return (
      window.innerWidth < 768 ||
      /Mobi|Android/i.test(window.navigator.userAgent)
    );
  });

  const capture = useCallback(() => {
    setFlashEffect(true);
    setScanning(true);
    setTimeout(() => setFlashEffect(false), 150);
    setTimeout(() => {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
      setScanning(false);
    }, 600);
  }, [webcamRef, onCapture]);

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const cameraContent = (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode }}
        className="w-full h-full object-cover"
      />

      {/* 閃光特效 */}
      {flashEffect && (
        <div className="absolute inset-0 bg-white z-20 animate-[flash_0.15s_ease-out]" />
      )}

      {/* 瞄準框（平時顯示） */}
      {!scanning && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-[65%] aspect-square max-w-xs">
            {/* 四個角落 */}
            {(["tl", "tr", "bl", "br"] as const).map((corner) => (
              <div
                key={corner}
                className={`absolute w-7 h-7 border-[3px] border-white/80
                  ${corner === "tl" ? "top-0 left-0 border-r-0 border-b-0 rounded-tl" : ""}
                  ${corner === "tr" ? "top-0 right-0 border-l-0 border-b-0 rounded-tr" : ""}
                  ${corner === "bl" ? "bottom-0 left-0 border-r-0 border-t-0 rounded-bl" : ""}
                  ${corner === "br" ? "bottom-0 right-0 border-l-0 border-t-0 rounded-br" : ""}
                `}
              />
            ))}
            {/* 中心十字 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-px bg-white/60" />
              <div className="absolute h-5 w-px bg-white/60" />
            </div>
          </div>
        </div>
      )}

      {/* 頂部控制 */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-30">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="bg-black/50 text-white hover:bg-black/70 rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={switchCamera}
          className="bg-black/50 text-white hover:bg-black/70 rounded-full"
        >
          <SwitchCamera className="h-5 w-5" />
        </Button>
      </div>

      {/* 提示文字 */}
      <div className="absolute top-16 left-0 right-0 flex justify-center z-30">
        <span className="text-white/80 text-xs bg-black/40 px-3 py-1 rounded-full">
          將食物置入框內拍照
        </span>
      </div>

      {/* 底部拍照按鈕 */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 flex justify-center z-30">
        <button
          onClick={capture}
          disabled={scanning}
          className={`
            relative h-16 w-16 rounded-full
            bg-white shadow-lg
            flex items-center justify-center
            transition-transform active:scale-90
            disabled:opacity-60
            ring-4 ring-white/30
          `}
        >
          <Camera className="h-7 w-7 text-gray-800" />
          {/* 外圈脈衝 */}
          <span className="absolute inset-0 rounded-full animate-ping bg-white/30" />
        </button>
      </div>
    </div>
  );

  // 手機：全屏
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50">
        {cameraContent}
        <style>{`
          @keyframes flash { 0%{opacity:1} 100%{opacity:0} }
          .scan-line { animation: scanMove 0.5s ease-in-out; }
          @keyframes scanMove {
            0%   { top: 0; }
            50%  { top: calc(100% - 2px); }
            100% { top: 0; }
          }
        `}</style>
      </div>
    );
  }

  // 桌機：置中 Modal，最大 480×640
  return (
    <>
      <style>{`
        @keyframes flash { 0%{opacity:1} 100%{opacity:0} }
        .scan-line { animation: scanMove 0.5s ease-in-out; }
        @keyframes scanMove {
          0%   { top: 0; }
          50%  { top: calc(100% - 2px); }
          100% { top: 0; }
        }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div
          className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
          style={{ aspectRatio: "3/4", maxHeight: "80vh" }}
        >
          {cameraContent}
        </div>
      </div>
    </>
  );
}
