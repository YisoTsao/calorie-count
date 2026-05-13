'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface SubscriptionRow {
  userId: string;
  name: string | null;
  email: string | null;
  plan: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  updatedAt: string;
}

interface SubscriptionEditDialogProps {
  row: SubscriptionRow;
  open: boolean;
  onClose: () => void;
  onUpdated: (updated: SubscriptionRow) => void;
}

export function SubscriptionEditDialog({ row, open, onClose, onUpdated }: SubscriptionEditDialogProps) {
  const [plan, setPlan] = useState(row.plan);
  const [status, setStatus] = useState(row.status);
  const [periodEnd, setPeriodEnd] = useState(row.currentPeriodEnd.slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${row.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          status,
          currentPeriodEnd: new Date(periodEnd).toISOString(),
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onUpdated(data.data);
      toast.success('訂閱方案已更新');
      onClose();
    } catch {
      toast.error('更新失敗，請稍後再試');
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>編輯訂閱方案</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="text-sm text-muted-foreground">
              用戶：<span className="font-medium text-foreground">{row.email}</span>
            </div>

            <div className="space-y-1.5">
              <Label>方案</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">FREE</SelectItem>
                  <SelectItem value="PREMIUM">PREMIUM</SelectItem>
                  <SelectItem value="PRO">PRO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>狀態</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="TRIALING">TRIALING</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>訂閱到期日</Label>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>取消</Button>
            <Button onClick={() => setConfirmOpen(true)} disabled={saving}>
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認修改訂閱？</AlertDialogTitle>
            <AlertDialogDescription>
              確定將 <strong>{row.email}</strong> 的方案改為 <strong>{plan}</strong>，狀態 <strong>{status}</strong>，到期日 <strong>{periodEnd}</strong>？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave} disabled={saving}>
              {saving ? '更新中...' : '確認'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
