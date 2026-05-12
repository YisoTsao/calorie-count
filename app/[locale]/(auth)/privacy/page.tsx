import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { permanentRedirect } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calo-circle.yisoapp.com';
const CONTACT_EMAIL = 'support@calo-circle.yisoapp.com';

const META = {
  'zh-TW': {
    title: '隱私權政策 | CalorieCount',
    description: 'CalorieCount AI 卡路里追蹤系統隱私權政策 — 個人資料保護法合規',
  },
  en: {
    title: 'Privacy Policy | CalorieCount',
    description: 'CalorieCount Privacy Policy — GDPR and CCPA compliant data practices for our AI calorie tracking app.',
  },
  ja: {
    title: 'プライバシーポリシー | CalorieCount',
    description: 'CalorieCount AIカロリー管理アプリのプライバシーポリシー（個人情報保護法対応）',
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = META[locale as keyof typeof META] ?? META['zh-TW'];
  return {
    ...meta,
    alternates: {
      canonical: `${BASE_URL}/${locale}/privacy`,
      languages: {
        'zh-TW': `${BASE_URL}/zh-TW/privacy`,
        en: `${BASE_URL}/en/privacy`,
        ja: `${BASE_URL}/ja/privacy`,
        'x-default': `${BASE_URL}/zh-TW/privacy`,
      },
    },
  };
}

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold text-gray-900">{title}</h2>
      <div className="space-y-2 text-gray-700">{children}</div>
    </section>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className="ml-5 list-disc">{children}</li>;
}

// ─────────────────────────────────────────────
// 繁體中文（個人資料保護法合規）
// ─────────────────────────────────────────────

function PrivacyZhTW() {
  const EFFECTIVE_DATE = '2026年1月1日';
  return (
    <>
      <div className="border-b pb-6">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">隱私權政策</h1>
        <p className="text-sm text-gray-500">生效日期：{EFFECTIVE_DATE}</p>
      </div>
      <section>
        <p className="leading-relaxed text-gray-700">
          CalorieCount（以下簡稱「我們」）重視您的隱私。本政策說明我們如何依據《個人資料保護法》（臺灣）
          蒐集、處理、利用及保護您的個人資料。
        </p>
      </section>
      <Section title="一、蒐集的個人資料類別">
        <ul className="space-y-3">
          <li>
            <strong className="text-gray-800">帳號資料：</strong>姓名、電子郵件地址、個人頭像（選填）、
            第三方登入憑證（Google、Facebook、LINE OAuth Token）
          </li>
          <li>
            <strong className="text-gray-800">健康與飲食資料：</strong>飲食紀錄（食物名稱、份量、卡路里、營養素）、
            體重紀錄、BMI、運動紀錄、每日飲水量、健康目標
          </li>
          <li>
            <strong className="text-gray-800">上傳圖片：</strong>您拍攝或上傳的食物照片（用於 AI 辨識），
            辨識後儲存於安全的雲端儲存
          </li>
          <li>
            <strong className="text-gray-800">使用資料（自動收集）：</strong>IP 位址、瀏覽器類型、裝置資訊、
            功能使用頻率、錯誤日誌
          </li>
        </ul>
      </Section>
      <Section title="二、蒐集目的與利用方式">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 p-2 text-left">利用目的</th>
              <th className="border border-gray-200 p-2 text-left">法律依據</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['提供核心飲食追蹤功能', '履行服務合約'],
              ['AI 食物辨識分析', '履行服務合約'],
              ['寄送驗證信、重要帳號通知', '履行合約 / 合法利益'],
              ['個人化分析與建議', '您的同意'],
              ['AI 模型改進（完全匿名化）', '合法利益'],
              ['防止詐欺與安全防護', '合法利益'],
              ['法律遵循', '法律義務'],
            ].map(([p, b]) => (
              <tr key={p} className="border-b border-gray-100">
                <td className="border border-gray-200 p-2">{p}</td>
                <td className="border border-gray-200 p-2 text-gray-600">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="三、資料分享與第三方">
        <p>我們<strong>不販售</strong>您的個人資料。以下情況可能共享：</p>
        <ul className="mt-2 space-y-1">
          <Li><strong>服務提供商（均簽訂資料保護協議）：</strong>Google Gemini API（AI 辨識）、Vercel / Supabase（託管）、Resend（郵件）、Google / Facebook / LINE OAuth（登入）</Li>
          <Li><strong>法律要求：</strong>在法院命令或法律義務下揭露必要資料</Li>
          <Li><strong>企業轉讓：</strong>公司合併或被收購時，提前通知後資料可能隨之轉移</Li>
        </ul>
      </Section>
      <Section title="四、資料保留期限">
        <ul className="space-y-1">
          <Li>帳號資料：帳號存續期間；刪帳後 30 天內清除</Li>
          <Li>飲食紀錄：帳號存續期間</Li>
          <Li>食物照片：最長 180 天（可手動刪除）</Li>
          <Li>匿名化使用統計：最長 2 年</Li>
        </ul>
      </Section>
      <Section title="五、您的資料權利（個人資料保護法）">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            ['查閱權', '查看我們持有的您的資料'],
            ['更正權', '修正不正確的個人資料'],
            ['刪除權', '要求刪除帳號與資料'],
            ['攜帶權', '以可攜帶格式匯出資料'],
            ['反對權', '反對特定資料處理目的'],
            ['限制處理', '在特定情況下限制資料使用'],
          ].map(([label, desc]) => (
            <div key={label} className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm">
          行使權利請聯繫：
          <a href={`mailto:${CONTACT_EMAIL}`} className="ml-1 text-emerald-600 underline">{CONTACT_EMAIL}</a>
          ，我們將於 <strong>15 個工作天</strong>內回覆。
        </p>
      </Section>
      <Section title="六、資料安全">
        <ul className="space-y-1">
          <Li>所有傳輸使用 HTTPS/TLS 加密</Li>
          <Li>密碼以 bcrypt（12 輪）雜湊儲存，絕不明文保存</Li>
          <Li>資料庫存取需驗證；API 存取設有頻率限制</Li>
          <Li>定期安全稽核；健康資料與一般帳號資料分層儲存</Li>
        </ul>
      </Section>
      <Section title="七、Cookie 使用">
        <p>
          本服務僅使用維持登入狀態所必要的 Session Cookie，
          不使用第三方廣告追蹤 Cookie。您可在瀏覽器設定中管理 Cookie，
          但停用可能影響部分功能。
        </p>
      </Section>
      <Section title="八、未成年人保護">
        <p>
          本服務不針對 13 歲以下兒童。若我們發現在未取得監護人同意的情況下
          收集了兒童資料，將立即刪除相關資訊。未滿 18 歲使用者需取得父母或監護人同意。
        </p>
      </Section>
      <Section title="九、政策更新">
        <p>
          重大變更將透過應用程式內通知或電子郵件提前 <strong>30 天</strong>告知。
          輕微調整將更新此頁面並修改生效日期。
        </p>
      </Section>
      <Section title="十、聯絡我們">
        <p>
          隱私相關問題請聯繫個人資料保護負責人：
          <a href={`mailto:${CONTACT_EMAIL}`} className="ml-1 text-emerald-600 underline">{CONTACT_EMAIL}</a>
        </p>
      </Section>
    </>
  );
}

// ─────────────────────────────────────────────
// English (GDPR + CCPA compliant)
// ─────────────────────────────────────────────

function PrivacyEn() {
  const EFFECTIVE_DATE = 'January 1, 2026';
  return (
    <>
      <div className="border-b pb-6">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Effective Date: {EFFECTIVE_DATE}</p>
      </div>
      <section>
        <p className="leading-relaxed text-gray-700">
          CalorieCount ("we," "us," or "our") operates the CalorieCount health tracking application.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your personal data
          in accordance with the EU General Data Protection Regulation (GDPR), the UK GDPR,
          the California Consumer Privacy Act (CCPA), and other applicable laws.
        </p>
        <p className="mt-2 text-gray-700">
          <strong>Data Controller:</strong> CalorieCount Team
          &nbsp;|&nbsp;
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 underline">{CONTACT_EMAIL}</a>
        </p>
      </section>
      <Section title="1. Data We Collect">
        <ul className="space-y-2">
          <Li><strong>Account Data:</strong> name, email address, profile photo (optional), third-party OAuth tokens (Google, Facebook, LINE)</Li>
          <Li><strong>Health &amp; Nutrition Data:</strong> food logs (name, portion, calories, macronutrients), weight records, BMI, exercise logs, daily water intake, health goals</Li>
          <Li><strong>Food Photos:</strong> images you upload for AI recognition — stored in secure cloud storage after analysis</Li>
          <Li><strong>Usage Data (automatic):</strong> IP address, browser type, device info, feature usage timestamps, error logs</Li>
        </ul>
      </Section>
      <Section title="2. How We Use Your Data (Lawful Basis — GDPR Art. 6)">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 p-2 text-left">Purpose</th>
              <th className="border border-gray-200 p-2 text-left">Lawful Basis</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Providing core food tracking features', 'Contract performance (Art. 6(1)(b))'],
              ['AI food image recognition', 'Contract performance (Art. 6(1)(b))'],
              ['Sending account notifications & verification emails', 'Contract / Legitimate interests (Art. 6(1)(f))'],
              ['Personalised health analytics & recommendations', 'Consent (Art. 6(1)(a))'],
              ['Anonymous AI model improvement', 'Legitimate interests (Art. 6(1)(f))'],
              ['Fraud prevention & security', 'Legitimate interests (Art. 6(1)(f))'],
              ['Legal compliance', 'Legal obligation (Art. 6(1)(c))'],
            ].map(([p, b]) => (
              <tr key={p} className="border-b border-gray-100">
                <td className="border border-gray-200 p-2">{p}</td>
                <td className="border border-gray-200 p-2 text-gray-600 text-xs">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="3. Data Sharing &amp; Third Parties">
        <p><strong>We do not sell your personal information.</strong> We may share data with:</p>
        <ul className="mt-2 space-y-1">
          <Li><strong>Service Providers</strong> (bound by Data Processing Agreements): Google Gemini API (AI recognition), Vercel / Supabase (database &amp; hosting), Resend (transactional email), Google / Facebook / LINE OAuth (authentication)</Li>
          <Li><strong>Legal Requirements:</strong> when required by law, court order, or governmental authority</Li>
          <Li><strong>Business Transfers:</strong> in the event of a merger or acquisition, with advance notice to you</Li>
        </ul>
      </Section>
      <Section title="4. Data Retention">
        <ul className="space-y-1">
          <Li>Account data: retained while account is active; deleted within 30 days of account deletion</Li>
          <Li>Food logs: retained while account is active</Li>
          <Li>Food photos: maximum 180 days (can be manually deleted at any time)</Li>
          <Li>Anonymised usage statistics: maximum 2 years</Li>
        </ul>
      </Section>
      <Section title="5. Your Rights">
        <p className="font-medium">GDPR Rights (EU/UK residents):</p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            ['Access', 'Request a copy of your data (Art. 15)'],
            ['Rectification', 'Correct inaccurate data (Art. 16)'],
            ['Erasure', '"Right to be forgotten" (Art. 17)'],
            ['Restriction', 'Restrict how we process your data (Art. 18)'],
            ['Portability', 'Receive your data in a portable format (Art. 20)'],
            ['Object', 'Object to processing based on legitimate interests (Art. 21)'],
          ].map(([label, desc]) => (
            <div key={label} className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 font-medium">CCPA Rights (California residents):</p>
        <ul className="mt-2 space-y-1">
          <Li>Right to <strong>Know</strong> what personal information is collected and used</Li>
          <Li>Right to <strong>Delete</strong> your personal information</Li>
          <Li>Right to <strong>Opt-Out of Sale</strong> — we do not sell personal information</Li>
          <Li>Right to <strong>Non-Discrimination</strong> for exercising your rights</Li>
        </ul>
        <p className="mt-3 text-sm">
          To exercise your rights, contact:&nbsp;
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 underline">{CONTACT_EMAIL}</a>
          &nbsp;— we respond within <strong>30 days</strong> (GDPR) / <strong>45 days</strong> (CCPA).
        </p>
      </Section>
      <Section title="6. International Data Transfers">
        <p>
          Your data may be processed in Taiwan, the United States, and Japan.
          For transfers from the EEA/UK to countries without an adequacy decision,
          we rely on <strong>Standard Contractual Clauses (SCCs)</strong> as the transfer mechanism.
        </p>
      </Section>
      <Section title="7. Security Measures">
        <ul className="space-y-1">
          <Li>All data in transit encrypted via HTTPS/TLS</Li>
          <Li>Passwords hashed with bcrypt (12 rounds) — never stored in plaintext</Li>
          <Li>Database access requires authenticated credentials</Li>
          <Li>API rate limiting to prevent brute-force attacks</Li>
          <Li>Regular security audits; health data stored separately from account data</Li>
        </ul>
      </Section>
      <Section title="8. Cookies">
        <p>
          We use only <strong>necessary session cookies</strong> to maintain your logged-in state.
          We do not use third-party advertising or tracking cookies. You can manage cookies in your
          browser settings, though disabling session cookies will prevent login.
        </p>
      </Section>
      <Section title="9. Children&apos;s Privacy">
        <p>
          Our Service is not directed to children under <strong>13</strong> (or 16 in the EU where applicable).
          If we discover we have collected personal data from a child without parental consent,
          we will delete it immediately. Users under 18 require parental or guardian consent.
        </p>
      </Section>
      <Section title="10. Changes to This Policy">
        <p>
          We will notify you of significant changes via in-app notification or email at least
          <strong> 30 days</strong> before the change takes effect.
          Minor updates will be reflected on this page with an updated effective date.
        </p>
      </Section>
      <Section title="11. Contact &amp; Data Protection">
        <p>
          For privacy inquiries or to exercise your rights:&nbsp;
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 underline">{CONTACT_EMAIL}</a>
        </p>
        <p className="mt-2 text-sm text-gray-600">
          EU/UK residents: if you are not satisfied with our response, you have the right to
          lodge a complaint with your local supervisory authority (e.g., ICO in the UK).
        </p>
      </Section>
    </>
  );
}

// ─────────────────────────────────────────────
// 日本語（個人情報保護法対応）
// ─────────────────────────────────────────────

function PrivacyJa() {
  const EFFECTIVE_DATE = '2026年1月1日';
  return (
    <>
      <div className="border-b pb-6">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">プライバシーポリシー</h1>
        <p className="text-sm text-gray-500">制定日：{EFFECTIVE_DATE}</p>
      </div>
      <section>
        <p className="leading-relaxed text-gray-700">
          CalorieCount（以下「当サービス」）は、個人情報の保護に関する法律（個人情報保護法）および
          関連ガイドラインを遵守し、お客様の個人情報を適切に取り扱います。
        </p>
        <p className="mt-2 text-sm text-gray-600">
          個人情報取扱事業者：CalorieCount チーム ／
          お問い合わせ：<a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 underline">{CONTACT_EMAIL}</a>
        </p>
      </section>
      <Section title="1. 取得する個人情報の種類">
        <ul className="space-y-2">
          <Li><strong>アカウント情報：</strong>氏名・メールアドレス・プロフィール写真（任意）・第三方ログイン情報（Google / Facebook / LINE OAuth トークン）</Li>
          <Li><strong>健康・飲食データ：</strong>食事記録（食品名・カロリー・栄養素・量）、体重・BMI、運動記録、水分摂取量、健康目標</Li>
          <Li><strong>食品画像：</strong>AI認識のためにアップロードした写真（認識後、安全なクラウドストレージに保存）</Li>
          <Li><strong>利用状況（自動取得）：</strong>IPアドレス・ブラウザ情報・デバイス情報・機能利用頻度・エラーログ</Li>
        </ul>
      </Section>
      <Section title="2. 利用目的">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 p-2 text-left">利用目的</th>
              <th className="border border-gray-200 p-2 text-left">根拠</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['食事記録・健康管理機能の提供', 'サービス提供（契約履行）'],
              ['AI食品画像認識の実行', 'サービス提供（契約履行）'],
              ['確認メール・重要通知の送信', '契約履行 / 正当な利益'],
              ['個人化された健康分析の提供', 'ご本人の同意'],
              ['サービス品質向上（匿名化後）', '正当な利益'],
              ['不正アクセス防止・セキュリティ確保', '正当な利益'],
              ['法令遵守', '法的義務'],
            ].map(([p, b]) => (
              <tr key={p} className="border-b border-gray-100">
                <td className="border border-gray-200 p-2">{p}</td>
                <td className="border border-gray-200 p-2 text-gray-600">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="3. 第三者への提供">
        <p>ご本人の同意なく個人情報を第三者に販売・提供しません。以下の場合を除きます：</p>
        <ul className="mt-2 space-y-1">
          <Li><strong>業務委託先（委託契約締結済み）：</strong>Google Gemini API（AI認識）、Vercel / Supabase（ホスティング）、Resend（メール配信）、Google / Facebook / LINE OAuth（ログイン認証）</Li>
          <Li><strong>法令に基づく場合：</strong>裁判所命令・法的義務による開示</Li>
          <Li><strong>事業承継：</strong>合併・買収の場合、事前にご通知のうえ個人情報が移転される場合があります</Li>
        </ul>
      </Section>
      <Section title="4. 安全管理措置">
        <ul className="space-y-1">
          <Li>全データ転送における HTTPS/TLS 暗号化</Li>
          <Li>パスワードの bcrypt ハッシュ化（12ラウンド）、平文保存禁止</Li>
          <Li>データベースへの認証アクセス制御</Li>
          <Li>APIレートリミット（総当たり攻撃防止）</Li>
          <Li>定期的なセキュリティ監査の実施</Li>
        </ul>
      </Section>
      <Section title="5. 保存期間">
        <ul className="space-y-1">
          <Li>アカウント情報：アカウント有効期間中。退会後30日以内に削除</Li>
          <Li>飲食記録：アカウント有効期間中</Li>
          <Li>食品画像：最長180日間（手動削除可能）</Li>
          <Li>匿名化した利用統計：最長2年間</Li>
        </ul>
      </Section>
      <Section title="6. 保有個人データに関するご本人の権利">
        <p>個人情報保護法に基づき、以下の請求を受け付けています（法第33〜35条）：</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            ['開示請求', '保有個人データの開示を求める権利'],
            ['訂正・追加・削除', '内容が事実でない場合の訂正等'],
            ['利用停止・消去', '目的外利用・不正取得の場合'],
            ['第三者提供の停止', '法令違反の提供がある場合'],
          ].map(([label, desc]) => (
            <div key={label} className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm">
          請求先：
          <a href={`mailto:${CONTACT_EMAIL}`} className="ml-1 text-emerald-600 underline">{CONTACT_EMAIL}</a>
          （合理的な期間内、目安 <strong>15営業日</strong>以内に対応）
        </p>
      </Section>
      <Section title="7. Cookieについて">
        <p>
          ログイン状態を維持するために<strong>必須のセッションCookie</strong>のみを使用します。
          第三方広告トラッキングCookieは使用していません。
          ブラウザ設定からCookieを管理できますが、無効化するとログインに支障が生じる場合があります。
        </p>
      </Section>
      <Section title="8. 未成年の方について">
        <p>
          本サービスは13歳未満の方を対象としていません。
          13歳未満の方の個人情報を保護者の同意なく取得したことが判明した場合、
          速やかに削除します。18歳未満の方のご利用には保護者の同意が必要です。
        </p>
      </Section>
      <Section title="9. プライバシーポリシーの変更">
        <p>
          重要な変更は、変更の<strong>30日前</strong>までにアプリ内通知またはメールでお知らせします。
          軽微な変更はこのページを更新し、制定日を改定します。
        </p>
      </Section>
      <Section title="10. お問い合わせ">
        <p>
          個人情報の取り扱いに関するお問い合わせ：
          <a href={`mailto:${CONTACT_EMAIL}`} className="ml-1 text-emerald-600 underline">{CONTACT_EMAIL}</a>
        </p>
      </Section>
    </>
  );
}

// ─────────────────────────────────────────────
// Page entry point
// ─────────────────────────────────────────────

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    permanentRedirect('/zh-TW/privacy');
  }

  const Content =
    locale === 'en' ? PrivacyEn : locale === 'ja' ? PrivacyJa : PrivacyZhTW;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-8 rounded-2xl bg-white p-8 shadow-sm md:p-12">
        <Content />
        <div className="border-t pt-6 text-center">
          <Link href="/terms" className="text-sm text-emerald-600 hover:underline">
            {locale === 'en' ? 'Terms of Service' : locale === 'ja' ? '利用規約' : '服務條款'}
          </Link>
          <span className="mx-2 text-gray-300">|</span>
          <Link href="/login" className="text-sm text-gray-500 hover:underline">
            {locale === 'en' ? 'Back to Login' : locale === 'ja' ? 'ログインに戻る' : '返回登入'}
          </Link>
        </div>
      </div>
    </div>
  );
}
