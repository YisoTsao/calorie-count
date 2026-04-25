// 最小化根 Layout — html/body 由 app/[locale]/layout.tsx 渲染
// Next.js 要求 app/layout.tsx 存在，但實際頁面結構在 [locale] layout 中處理
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return children as any;
}
