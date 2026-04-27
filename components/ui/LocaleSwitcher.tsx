'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@iconify/react';

const LOCALE_FLAGS: Record<string, string> = {
  'zh-TW': '🇹🇼',
  en: '🇺🇸',
  ja: '🇯🇵',
};

export function LocaleSwitcher() {
  const t = useTranslations('localeSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 gap-2 px-2" aria-label={t('label')}>
          <span className="text-base leading-none">{LOCALE_FLAGS[locale]}</span>
          <span className="hidden text-sm font-medium sm:inline">
            {t(locale as 'zh-TW' | 'en' | 'ja')}
          </span>
          <Icon icon="lucide:chevron-down" className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[130px]">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`cursor-pointer gap-2 ${locale === loc ? 'bg-accent font-semibold' : ''}`}
          >
            <span className="text-base leading-none">{LOCALE_FLAGS[loc]}</span>
            <span>{t(loc as 'zh-TW' | 'en' | 'ja')}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
