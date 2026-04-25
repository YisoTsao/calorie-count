import type { Metadata } from 'next';
import { Noto_Sans_TC } from 'next/font/google';

import './globals.css';

const notoSansTC = Noto_Sans_TC({
  variable: '--font-noto-sans-tc',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CalorieCount | AI 食物卡路里辨識',
  description: 'AI 智慧食物卡路里辨識與營養追蹤系統',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${notoSansTC.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
