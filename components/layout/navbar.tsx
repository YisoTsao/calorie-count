'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { Icon } from '@iconify/react';
import { Link as NavigationLink } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  role?: string | null;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function Navbar({ user, role, isSidebarOpen = false, onToggleSidebar }: NavbarProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <NavigationLink href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-500 shadow-sm">
              <Icon
                icon="lucide:apple"
                className="h-4.5 w-4.5 text-white"
                style={{ fontSize: '18px' }}
              />
            </div>
            <span className="text-xl font-bold tracking-tight">CalorieCount</span>
          </NavigationLink>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            {/* Notifications */}
            {/* <Button variant="ghost" size="icon" className="hidden md:flex">
              <Icon icon="lucide:bell" className="h-5 w-5" />
            </Button> */}

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || 'User'}
                      width={40}
                      height={40}
                      className="min-h-8 min-w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary px-4 text-white">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <NavigationLink href="/profile" className="cursor-pointer">
                    <Icon icon="lucide:user" className="mr-2 h-4 w-4" />
                    {t('myProfile')}
                  </NavigationLink>
                </DropdownMenuItem>
                {/* <DropdownMenuItem asChild>
                  <NavigationLink href="/settings" className="cursor-pointer">
                    <Icon icon="lucide:settings" className="mr-2 h-4 w-4" />
                    設定
                  </NavigationLink>
                </DropdownMenuItem> */}
                <DropdownMenuItem asChild>
                  <NavigationLink href="/achievements" className="cursor-pointer">
                    <Icon icon="lucide:trophy" className="mr-2 h-4 w-4" />
                    {t('myAchievements')}
                  </NavigationLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex cursor-pointer items-center">
                        <Icon icon="lucide:shield" className="mr-2 h-4 w-4" />
                        {t('adminPanel')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <button
                    className="flex w-full cursor-pointer items-center"
                    onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                  >
                    <Icon icon="lucide:log-out" className="mr-2 h-4 w-4" />
                    {t('logout')}
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle – controls sidebar drawer */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onToggleSidebar}
              aria-label={isSidebarOpen ? '關閉選單' : '開啟選單'}
            >
              <Icon icon={isSidebarOpen ? 'lucide:x' : 'lucide:menu'} className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
