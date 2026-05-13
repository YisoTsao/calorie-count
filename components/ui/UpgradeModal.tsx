'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const t = useTranslations('subscription');

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>✨ {t('upgradeTitle')}</DialogTitle>
          <DialogDescription>{t('upgradeDescription')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Premium — NT$149/{t('month')}</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>✓ {t('premiumFeature1')}</li>
              <li>✓ {t('premiumFeature2')}</li>
              <li>✓ {t('premiumFeature3')}</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/pricing">{t('viewPlans')}</Link>
            </Button>
            <Button variant="outline" onClick={onClose}>
              {t('later')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
