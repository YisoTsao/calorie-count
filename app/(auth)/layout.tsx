// 此 layout 下的頁面（privacy、terms、complete-profile）各自定義 metadata，
// 不在此處設定以避免硬編碼語系內容。
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
