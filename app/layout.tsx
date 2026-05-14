import { Metadata } from 'next';
import { Noto_Sans_TC } from 'next/font/google';

import './globals.css';

const notoSansTC = Noto_Sans_TC({
  variable: '--font-noto-sans-tc',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  icons: {
    icon: '/calo-logo.png',
  },
};

// Root layout — Next.js 16 requires <html> and <body> here.
// app/[locale]/layout.tsx updates lang={locale} attribute for i18n routes.
// app/(admin)/layout.tsx provides the admin shell for /admin routes.
// lang="zh-TW" 為預設回退值；locale layout 會在 hydration 時覆蓋正確語系。
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className={`${notoSansTC.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
