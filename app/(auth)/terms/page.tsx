import { permanentRedirect } from 'next/navigation';

// 此頁面已遷移至 /zh-TW/terms（localePrefix: 'always' 規範）
// 308 Permanent Redirect — 搜尋引擎權重傳遞至新 canonical URL
export default function TermsRedirectPage() {
  permanentRedirect('/zh-TW/terms');
}
