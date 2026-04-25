'use client';

import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher';
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
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function Navbar({ user, isSidebarOpen = false, onToggleSidebar }: NavbarProps) {
  const t = useTranslations('nav');

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Icon icon="lucide:apple" className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">CalorieCount</span>
          </Link>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LocaleSwitcher />

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
                      className="rounded-full min-w-8 min-h-8 object-cover"
                    />
                  ) : (
                    <div className="flex px-4 h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <Icon icon="lucide:user" className="mr-2 h-4 w-4" />
                    {t('myProfile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Icon icon="lucide:settings" className="mr-2 h-4 w-4" />
                    {t('mySettings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/achievements" className="cursor-pointer">
                    <Icon icon="lucide:trophy" className="mr-2 h-4 w-4" />
                    {t('myAchievements')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button
                    className="flex w-full items-center cursor-pointer"
                    onClick={() => signOut({ callbackUrl: '/login' })}
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
              <Icon
                icon={isSidebarOpen ? 'lucide:x' : 'lucide:menu'}
                className="h-6 w-6"
              />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
