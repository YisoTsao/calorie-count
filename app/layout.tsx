import { Noto_Sans_TC } from 'next/font/google';
import './globals.css';

const notoSansTC = Noto_Sans_TC({
  variable: '--font-noto-sans-tc',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

// Root layout — Next.js 16 requires <html> and <body> here.
// app/[locale]/layout.tsx updates lang={locale} attribute for i18n routes.
// app/(admin)/layout.tsx provides the admin shell for /admin routes.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className={`${notoSansTC.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
