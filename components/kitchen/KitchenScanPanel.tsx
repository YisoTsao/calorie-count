'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, Loader2, X, Send, Video, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { compressImage } from '@/lib/client-image-compress';
import { IngredientList } from './IngredientList';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  quantity: string;
  aiConfidence?: number | null;
  addedVia: string;
}

interface KitchenScanPanelProps {
  onScanComplete?: (ingredients: Ingredient[]) => void;
}

async function toBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function captureFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = Math.min(video.videoWidth, 1024);
  canvas.height = Math.round((canvas.width / video.videoWidth) * video.videoHeight);
  canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/webp', 0.8);
}

export function KitchenScanPanel({ onScanComplete }: KitchenScanPanelProps) {
  const t = useTranslations('kitchen');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [previews, setPreviews] = useState<string[]>([]);
  const [base64Images, setBase64Images] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<Ingredient[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [recording, setRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatting, setChatting] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualQuantity, setManualQuantity] = useState('');
  const [addingManual, setAddingManual] = useState(false);

  const MAX_IMAGES = 5;

  useEffect(() => {
    fetch('/api/ai/kitchen/inventory')
      .then((r) => r.json())
      .then((data) => {
        if (data.data?.ingredients) setResults(data.data.ingredients);
      })
      .catch(() => {})
      .finally(() => setLoadingInventory(false));
  }, []);

  const addImages = (newBase64: string[]) => {
    const toAdd = newBase64.slice(0, MAX_IMAGES - base64Images.length);
    setBase64Images((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [...prev, ...toAdd]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    if (base64Images.length + selected.length > MAX_IMAGES) {
      toast.error(t('maxPhotos'));
      return;
    }
    const newBase64: string[] = [];
    for (const file of selected) {
      const compressed = await compressImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
      });
      newBase64.push(await toBase64(compressed));
    }
    addImages(newBase64);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setBase64Images((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 50);
    } catch {
      toast.error('無法開啟鏡頭，請確認權限');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setShowCamera(false);
    setRecording(false);
  };

  const startRecording = () => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;
    if (base64Images.length >= MAX_IMAGES) {
      toast.error(t('maxPhotos'));
      return;
    }

    const frames: string[] = [];
    setRecording(true);
    let count = 0;
    const captureInterval = setInterval(() => {
      if (video.readyState >= 2) {
        frames.push(captureFrame(video));
        count++;
      }
      if (count >= 3) {
        clearInterval(captureInterval);
        setRecording(false);
        stopCamera();
        const toAdd = frames.slice(0, MAX_IMAGES - base64Images.length);
        setBase64Images((prev) => [...prev, ...toAdd]);
        setPreviews((prev) => [...prev, ...toAdd]);
        toast.success(`已擷取 ${toAdd.length} 張畫面`);
      }
    }, 1000);
  };

  const handleScan = async () => {
    if (!base64Images.length) return;
    setScanning(true);
    try {
      const res = await fetch('/api/ai/kitchen/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: base64Images }),
      });
      if (res.status === 402) {
        toast.error(t('quotaExceeded'));
        return;
      }
      if (!res.ok) throw new Error('Scan failed');
      const data = await res.json();
      const ingredients = data.data?.ingredients ?? [];
      setResults(ingredients);
      onScanComplete?.(ingredients);
      toast.success(t('scanSuccess'));
    } catch {
      toast.error(t('scanError'));
    } finally {
      setScanning(false);
    }
  };

  const handleRemoveIngredient = async (id: string) => {
    try {
      await fetch('/api/ai/kitchen/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: [{ id, name: '', category: '', quantity: '', isAvailable: false }],
        }),
      });
      setResults((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleUpdateIngredient = async (id: string, name: string, quantity: string) => {
    const item = results.find((i) => i.id === id);
    if (!item) return;
    try {
      await fetch('/api/ai/kitchen/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: [{ id, name, category: item.category, quantity }],
        }),
      });
      setResults((prev) => prev.map((i) => (i.id === id ? { ...i, name, quantity } : i)));
    } catch {
      toast.error('更新失敗，請稍後再試');
      // 觸發重新顯示原值（不做任何事，原 state 不變）
    }
  };

  const handleAddManual = async () => {
    if (!manualName.trim()) return;
    setAddingManual(true);
    try {
      const res = await fetch('/api/ai/kitchen/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: [{ name: manualName.trim(), category: '其他', quantity: manualQuantity.trim() || '適量' }],
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data.data?.ingredients ?? []);
      setManualName('');
      setManualQuantity('');
      toast.success(`已新增「${manualName.trim()}」`);
    } catch {
      toast.error('新增食材失敗，請稍後再試');
    } finally {
      setAddingManual(false);
    }
  };

  const handleChat = async () => {
    if (!chatMessage.trim()) return;
    setChatting(true);
    try {
      const res = await fetch('/api/ai/kitchen/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatMessage }),
      });
      if (res.status === 402) {
        toast.error(t('quotaExceeded'));
        return;
      }
      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();
      toast.success(data.data?.reply ?? t('chatSuccess'));
      setResults(data.data?.inventory?.ingredients ?? []);
      setChatMessage('');
    } catch {
      toast.error(t('chatError'));
    } finally {
      setChatting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── 對話更新庫存 ── */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-2 font-semibold">{t('chatTitle')}</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder={t('chatPlaceholder')}
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChat()}
              disabled={chatting}
            />
            <Button onClick={handleChat} disabled={!chatMessage.trim() || chatting} size="icon">
              {chatting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 掃描上傳區 ── */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-2 font-semibold">{t('scanTitle')}</h3>
          <p className="mb-4 text-sm text-muted-foreground">{t('scanDescription')}</p>

          {previews.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative">
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showCamera && (
            <div className="mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg bg-black"
                style={{ maxHeight: 280 }}
              />
              <div className="mt-2 flex gap-2">
                <Button
                  onClick={startRecording}
                  disabled={recording || base64Images.length >= MAX_IMAGES}
                  variant={recording ? 'destructive' : 'default'}
                >
                  {recording ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      錄影中…
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      開始錄影（3 秒）
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  關閉鏡頭
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={base64Images.length >= MAX_IMAGES || scanning}
            >
              <Upload className="mr-2 h-4 w-4" />
              {t('selectPhotos')} ({base64Images.length}/{MAX_IMAGES})
            </Button>
            {!showCamera && (
              <Button
                variant="outline"
                onClick={startCamera}
                disabled={base64Images.length >= MAX_IMAGES || scanning}
              >
                <Video className="mr-2 h-4 w-4" />
                錄影掃描
              </Button>
            )}
            <Button onClick={handleScan} disabled={!base64Images.length || scanning}>
              {scanning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Camera className="mr-2 h-4 w-4" />
              )}
              {scanning ? t('scanning') : t('startScan')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 食材清單（常駐最上方） ── */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-3 font-semibold">{t('ingredientListTitle')}</h3>
          {loadingInventory ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              載入中…
            </div>
          ) : results.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('noIngredients')}</p>
          ) : (
            <IngredientList ingredients={results} onRemove={handleRemoveIngredient} onUpdate={handleUpdateIngredient} />
          )}

          {/* ── 手動新增食材 ── */}
          <div className="mt-4 border-t pt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">手動新增食材</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="食材名稱（必填）"
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && !addingManual && handleAddManual()}
                disabled={addingManual}
              />
              <input
                type="text"
                value={manualQuantity}
                onChange={(e) => setManualQuantity(e.target.value)}
                placeholder="數量（選填）"
                className="w-28 rounded-md border bg-background px-3 py-2 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && !addingManual && handleAddManual()}
                disabled={addingManual}
              />
              <Button
                onClick={handleAddManual}
                disabled={!manualName.trim() || addingManual}
                size="icon"
                variant="outline"
              >
                {addingManual ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
