'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';

export interface BarcodeFood {
  id: string;
  name: string;
  nameEn: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  servingSize: number | null;
  servingUnit: string | null;
  barcode: string | null;
  openFoodFactsUrl: string | null;
}

interface BarcodeScanDialogProps {
  onFood: (food: BarcodeFood, cached: boolean) => void;
  onClose: () => void;
}

type ScanState = 'idle' | 'scanning' | 'querying' | 'found' | 'not_found' | 'error';

export function BarcodeScanDialog({ onFood, onClose }: BarcodeScanDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const detectorRef = useRef<{
    detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
  } | null>(null);

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [manualInput, setManualInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [food, setFood] = useState<BarcodeFood | null>(null);
  const [cached, setCached] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [barcodeDetectorAvailable, setBarcodeDetectorAvailable] = useState(false);
  const t = useTranslations('scan.barcode');

  // ── Start camera ──
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      // Set state first so <video> element renders; stream is attached in the
      // useEffect below once videoRef.current is available.
      setScanState('scanning');
    } catch {
      setCameraAvailable(false);
    }
  }, []);

  // ── Attach stream once <video> element is in the DOM ──
  useEffect(() => {
    if (scanState !== 'scanning' || !videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.play().catch(console.error);
  }, [scanState]);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // ── Query barcode ──
  const queryBarcode = useCallback(
    async (barcode: string) => {
      setScanState('querying');
      stopCamera();
      try {
        const res = await fetch(`/api/foods/barcode?barcode=${encodeURIComponent(barcode)}`);
        const data = await res.json();
        if (!res.ok || data.error) {
          setErrorMsg(data.error ?? t('errors.queryFailed'));
          setScanState(res.status === 404 ? 'not_found' : 'error');
          return;
        }
        setFood(data.food);
        setCached(data.cached);
        setScanState('found');
        onFood(data.food, data.cached);
      } catch {
        setErrorMsg(t('errors.networkFailed'));
        setScanState('error');
      }
    },
    [onFood, stopCamera]
  );

  // ── BarcodeDetector scan loop ──
  useEffect(() => {
    const hasBD = 'BarcodeDetector' in window;
    setBarcodeDetectorAvailable(hasBD);
    if (hasBD) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      detectorRef.current = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
      });
    }
  }, []);

  useEffect(() => {
    if (scanState !== 'scanning' || !detectorRef.current || !videoRef.current) return;

    let active = true;
    const detect = async () => {
      if (!active || !detectorRef.current || !videoRef.current) return;
      try {
        const barcodes = await detectorRef.current.detect(videoRef.current);
        if (barcodes.length > 0 && active) {
          active = false;
          await queryBarcode(barcodes[0].rawValue);
          return;
        }
      } catch {
        // continue scanning
      }
      animFrameRef.current = requestAnimationFrame(detect);
    };
    animFrameRef.current = requestAnimationFrame(detect);
    return () => {
      active = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [scanState, queryBarcode]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const handleManualSubmit = () => {
    const code = manualInput.trim().replace(/\s/g, '');
    if (!/^\d{8,14}$/.test(code)) {
      setErrorMsg(t('errors.invalidFormat'));
      return;
    }
    queryBarcode(code);
  };

  const handleRetry = () => {
    setFood(null);
    setErrorMsg('');
    setManualInput('');
    setScanState('idle');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
      <div className="relative w-full max-w-md rounded-t-3xl bg-background shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:barcode-scan" className="text-xl text-primary" />
            <h2 className="font-semibold">{t('title')}</h2>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent"
          >
            <Icon icon="mdi:close" className="text-lg" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {/* ── Idle: start buttons ── */}
          {scanState === 'idle' && (
            <div className="space-y-3">
              {cameraAvailable && (
                <button
                  onClick={startCamera}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Icon icon="mdi:camera-outline" className="text-xl" />
                  {barcodeDetectorAvailable ? t('openCamera') : t('openCameraManual')}
                </button>
              )}
              {!cameraAvailable && (
                <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
                  <Icon icon="mdi:camera-off-outline" className="mr-1.5 inline" />
                  {t('noCameraWarning')}
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">{t('orManualInput')}</span>
                </div>
              </div>
              <ManualInput
                value={manualInput}
                onChange={setManualInput}
                onSubmit={handleManualSubmit}
                errorMsg={errorMsg}
              />
            </div>
          )}

          {/* ── Scanning ── */}
          {scanState === 'scanning' && (
            <div className="space-y-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black">
                <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
                {/* scanning frame overlay */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-24 w-[75%]">
                    {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
                      <div
                        key={c}
                        className={`absolute h-6 w-6 border-[3px] border-primary
                          ${c === 'tl' ? 'left-0 top-0 rounded-tl border-b-0 border-r-0' : ''}
                          ${c === 'tr' ? 'right-0 top-0 rounded-tr border-b-0 border-l-0' : ''}
                          ${c === 'bl' ? 'bottom-0 left-0 rounded-bl border-r-0 border-t-0' : ''}
                          ${c === 'br' ? 'bottom-0 right-0 rounded-br border-l-0 border-t-0' : ''}
                        `}
                      />
                    ))}
                    <div className="absolute inset-x-0 top-1/2 h-px animate-[scan_2s_ease-in-out_infinite] bg-primary/60" />
                  </div>
                </div>
                {!barcodeDetectorAvailable && (
                  <div className="absolute inset-x-0 bottom-3 bg-black/40 py-1 text-center text-xs text-white/70">
                    {t('browserNoSupport')}
                  </div>
                )}
              </div>
              <p className="text-center text-sm text-muted-foreground">{t('aimAtCenter')}</p>
              {!barcodeDetectorAvailable && (
                <ManualInput
                  value={manualInput}
                  onChange={setManualInput}
                  onSubmit={handleManualSubmit}
                  errorMsg={errorMsg}
                />
              )}
            </div>
          )}

          {/* ── Querying ── */}
          {scanState === 'querying' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Icon icon="mdi:loading" className="animate-spin text-4xl text-primary" />
              <p className="text-sm text-muted-foreground">{t('querying')}</p>
            </div>
          )}

          {/* ── Found ── */}
          {scanState === 'found' && food && (
            <div className="space-y-3">
              <div className="space-y-3 rounded-xl border bg-card p-4">
                <div>
                  <p className="text-base font-semibold">{food.name}</p>
                  {food.nameEn && <p className="text-xs text-muted-foreground">{food.nameEn}</p>}
                  {food.barcode && (
                    <p className="mt-0.5 text-xs text-muted-foreground">條碼：{food.barcode}</p>
                  )}
                  {cached && (
                    <span className="mt-1 inline-block rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-600">
                      {t('cachedBadge')}
                    </span>
                  )}
                </div>

                {/* Macros row */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    {
                      label: '熱量',
                      value: `${food.calories}`,
                      unit: 'kcal',
                      color: 'text-orange-500',
                    },
                    {
                      label: '蛋白質',
                      value: `${food.protein}`,
                      unit: 'g',
                      color: 'text-blue-500',
                    },
                    { label: '碳水', value: `${food.carbs}`, unit: 'g', color: 'text-amber-500' },
                    { label: '脂肪', value: `${food.fat}`, unit: 'g', color: 'text-rose-500' },
                  ].map((m) => (
                    <div key={m.label} className="rounded-lg bg-muted px-1 py-2">
                      <p className={`text-base font-bold leading-tight ${m.color}`}>{m.value}</p>
                      <p className="text-[10px] text-muted-foreground">{m.unit}</p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>

                {(food.fiber != null || food.sugar != null || food.sodium != null) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 border-t pt-2 text-xs text-muted-foreground">
                    {food.fiber != null && <span>纖維 {food.fiber}g</span>}
                    {food.sugar != null && <span>糖 {food.sugar}g</span>}
                    {food.sodium != null && <span>鈉 {food.sodium}mg</span>}
                  </div>
                )}

                {food.servingSize && (
                  <p className="text-xs text-muted-foreground">
                    參考份量：{food.servingSize}
                    {food.servingUnit ?? 'g'}（以上數值為每 100g）
                  </p>
                )}

                {food.openFoodFactsUrl && (
                  <a
                    href={food.openFoodFactsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    {t('attribution')}
                  </a>
                )}
              </div>

              <button
                onClick={handleRetry}
                className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm transition-colors hover:bg-accent"
              >
                <Icon icon="mdi:barcode-scan" className="text-base" />
                {t('scanAnother')}
              </button>
            </div>
          )}

          {/* ── Not found ── */}
          {scanState === 'not_found' && (
            <div className="space-y-3">
              <div className="space-y-2 rounded-xl bg-muted px-5 py-6 text-center">
                <Icon icon="mdi:barcode-off" className="mx-auto text-4xl text-muted-foreground" />
                <p className="font-medium">{t('notFoundTitle')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('notFoundDesc')}
                </p>
              </div>
              <button
                onClick={handleRetry}
                className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm transition-colors hover:bg-accent"
              >
                <Icon icon="mdi:refresh" className="text-base" />
                {t('rescan')}
              </button>
            </div>
          )}

          {/* ── Error ── */}
          {scanState === 'error' && (
            <div className="space-y-3">
              <div className="space-y-1 rounded-xl bg-destructive/10 px-5 py-4 text-center">
                <Icon
                  icon="mdi:alert-circle-outline"
                  className="mx-auto text-3xl text-destructive"
                />
                <p className="text-sm font-medium text-destructive">{errorMsg}</p>
              </div>
              <button
                onClick={handleRetry}
                className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm transition-colors hover:bg-accent"
              >
                <Icon icon="mdi:refresh" className="text-base" />
                {t('retry')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ManualInput({
  value,
  onChange,
  onSubmit,
  errorMsg,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  errorMsg: string;
}) {
  const t = useTranslations('scan.barcode');
  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={t('manualPlaceholder')}
          aria-label={t('manualLabel')}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 14))}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          className="flex-1 rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          onClick={onSubmit}
          disabled={value.length < 8}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {t('manualSubmit')}
        </button>
      </div>
      {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
    </div>
  );
}
