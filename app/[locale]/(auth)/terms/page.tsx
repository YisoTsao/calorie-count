import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { permanentRedirect } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calo-circle.yisoapp.com';
const CONTACT_EMAIL = 'support@calo-circle.yisoapp.com';

const META = {
  'zh-TW': {
    title: '服務條款 | CalorieCount',
    description: 'CalorieCount AI 卡路里追蹤系統服務條款 — 消費者保護法合規',
  },
  en: {
    title: 'Terms of Service | CalorieCount',
    description: 'CalorieCount Terms of Service — governing your use of our AI calorie tracking application.',
  },
  ja: {
    title: '利用規約 | CalorieCount',
    description: 'CalorieCount AIカロリー管理アプリ利用規約（消費者契約法対応）',
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
      canonical: `${BASE_URL}/${locale}/terms`,
      languages: {
        'zh-TW': `${BASE_URL}/zh-TW/terms`,
        en: `${BASE_URL}/en/terms`,
        ja: `${BASE_URL}/ja/terms`,
        'x-default': `${BASE_URL}/zh-TW/terms`,
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

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
      ⚠️ {children}
    </p>
  );
}

// ─────────────────────────────────────────────
// 繁體中文（消費者保護法合規）
// ─────────────────────────────────────────────

function TermsZhTW() {
  const EFFECTIVE_DATE = '2026年1月1日';
  const APP_NAME = 'CalorieCount';
  return (
    <>
      <div className="border-b pb-6">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">服務條款</h1>
        <p className="text-sm text-gray-500">生效日期：{EFFECTIVE_DATE}</p>
      </div>
      <section>
        <p className="leading-relaxed text-gray-700">
          歡迎使用 <strong>{APP_NAME}</strong>（以下簡稱「本服務」）。
          本服務由 CalorieCount 團隊（以下簡稱「我們」）提供。
          使用本服務即表示您同意受本條款約束。若不同意，請停止使用。
        </p>
      </section>
      <Section title="一、服務描述">
        <p>{APP_NAME} 是一款 AI 驅動的飲食與健康管理應用程式，提供：</p>
        <ul className="mt-2 space-y-1">
          <Li>AI 食物影像辨識與卡路里估算</Li>
          <Li>每日飲食紀錄與營養素追蹤</Li>
          <Li>體重、運動與水分攝取管理</Li>
          <Li>個人化健康目標設定與成就追蹤</Li>
          <Li>飲食趨勢分析與報表</Li>
        </ul>
        <Warning>
          <strong>重要免責聲明：</strong>本服務提供的卡路里估算與營養資訊<strong>僅供參考，不構成醫療建議</strong>。
          若您有特定健康需求（如糖尿病、飲食障礙等），請諮詢專業醫療人員。
        </Warning>
      </Section>
      <Section title="二、帳號資格與使用">
        <ul className="space-y-1">
          <Li>您必須年滿 <strong>13 歲</strong>方可使用本服務；未滿 18 歲需取得父母或監護人同意。</Li>
          <Li>您須提供真實、準確的個人資訊進行註冊，並維護帳號安全。</Li>
          <Li>每人限申請一個帳號，不得以多個帳號操弄系統。</Li>
          <Li>如發現帳號遭未授權使用，請立即通知我們。</Li>
        </ul>
      </Section>
      <Section title="三、健康資料的使用">
        <p>您輸入的健康資料將用於提供個人化功能及（匿名化後）改進 AI 模型。
          我們<strong>不會</strong>將您的個人健康資料販售予第三方。
          詳見 <Link href="/privacy" className="text-emerald-600 underline">隱私權政策</Link>。</p>
      </Section>
      <Section title="四、使用者行為規範">
        <p>您同意不從事以下行為：</p>
        <ul className="mt-2 space-y-1">
          <Li>上傳含有違法、暴力、色情或侵權的內容</Li>
          <Li>透過自動化工具（Bot）大量存取 API</Li>
          <Li>嘗試逆向工程或破解本服務的安全機制</Li>
          <Li>冒充他人或本服務人員</Li>
          <Li>進行任何可能損害本服務基礎設施的行為</Li>
        </ul>
      </Section>
      <Section title="五、AI 辨識功能說明">
        <p>
          本服務使用 Google Gemini AI 模型進行食物影像辨識。AI 辨識結果具有不確定性，
          實際卡路里與營養素可能因食材來源、烹調方式而有所差異。
          我們<strong>不保證</strong> AI 辨識結果的絕對準確性。
        </p>
      </Section>
      <Section title="六、智慧財產權">
        <p>
          本服務的設計、程式碼、商標、內容等均屬 CalorieCount 團隊所有。
          您在本服務中建立的個人飲食紀錄、自訂食物等資料歸您所有；
          您授予我們在提供服務範疇內使用該資料的非專屬授權。
        </p>
      </Section>
      <Section title="七、服務中斷與終止">
        <ul className="space-y-1">
          <Li>我們保留隨時修改、暫停或終止服務的權利，並提前合理通知。</Li>
          <Li>違反本條款的帳號可能被暫停或永久終止，嚴重情形不另行通知。</Li>
          <Li>您可隨時申請刪除帳號，資料將在 30 天內完整清除。</Li>
        </ul>
      </Section>
      <Section title="八、免責聲明與責任限制">
        <p>
          本服務以「現況」提供，不提供任何形式的明示或暗示保證。
          我們對因使用本服務所引發的任何間接、附隨或衍生損失不負責任。
          我們對您的責任上限不超過您過去 <strong>12 個月</strong>所繳納的服務費用。
        </p>
      </Section>
      <Section title="九、準據法與管轄法院">
        <p>
          本條款依中華民國（臺灣）法律解釋及管轄。
          因本條款或本服務所生爭議，雙方同意以<strong>臺灣臺北地方法院</strong>為第一審管轄法院。
        </p>
      </Section>
      <Section title="十、條款修改">
        <p>
          我們可能不定期修改本條款。重大變更將透過 Email 或應用程式內通知提前 <strong>30 天</strong>告知。
          繼續使用本服務即表示接受修改後的條款。
        </p>
      </Section>
      <Section title="十一、聯絡方式">
        <p>
          如對本條款有任何疑問，請聯繫：
          <a href={`mailto:${CONTACT_EMAIL}`} className="ml-1 text-emerald-600 underline">{CONTACT_EMAIL}</a>
        </p>
      </Section>
    </>
  );
}

// ─────────────────────────────────────────────
// English (Common Law + GDPR consumer rights note)
// ─────────────────────────────────────────────

function TermsEn() {
  const EFFECTIVE_DATE = 'January 1, 2026';
  const APP_NAME = 'CalorieCount';
  return (
    <>
      <div className="border-b pb-6">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Terms of Service</h1>
        <p className="text-sm text-gray-500">Effective Date: {EFFECTIVE_DATE}</p>
      </div>
      <section>
        <p className="leading-relaxed text-gray-700">
          Welcome to <strong>{APP_NAME}</strong> ("Service"), operated by the CalorieCount Team ("we," "us," or "our").
          By accessing or using the Service, you agree to be bound by these Terms of Service.
          If you do not agree, do not use the Service.
        </p>
      </section>
      <Section title="1. Description of Service">
        <p>{APP_NAME} is an AI-powered diet and health management application providing:</p>
        <ul className="mt-2 space-y-1">
          <Li>AI food image recognition and calorie estimation</Li>
          <Li>Daily food logging and nutrient tracking</Li>
          <Li>Weight, exercise, and hydration management</Li>
          <Li>Personalised health goals and achievement tracking</Li>
          <Li>Diet trend analysis and reports</Li>
        </ul>
        <Warning>
          <strong>Important Disclaimer:</strong> Calorie estimates and nutritional information are
          <strong> for informational purposes only and do not constitute medical advice.</strong> If you have
          specific health conditions (e.g., diabetes, eating disorders), please consult a qualified
          healthcare professional.
        </Warning>
      </Section>
      <Section title="2. Eligibility &amp; Account">
        <ul className="space-y-1">
          <Li>You must be at least <strong>13 years old</strong> to use the Service; users under 18 require parental or guardian consent.</Li>
          <Li>You must provide accurate and complete information when registering.</Li>
          <Li>You are responsible for maintaining the security of your account credentials.</Li>
          <Li>You may not create multiple accounts to circumvent restrictions.</Li>
          <Li>Notify us immediately of any unauthorised use of your account.</Li>
        </ul>
      </Section>
      <Section title="3. Health Data">
        <p>
          Health data you enter will be used to provide personalised features and, in anonymised form,
          to improve our AI models. We do <strong>not sell</strong> your personal health data.
          See our <Link href="/privacy" className="text-emerald-600 underline">Privacy Policy</Link>.
        </p>
      </Section>
      <Section title="4. Prohibited Conduct">
        <p>You agree not to:</p>
        <ul className="mt-2 space-y-1">
          <Li>Upload unlawful, violent, pornographic, or infringing content</Li>
          <Li>Use automated tools (bots) to scrape or overload the API</Li>
          <Li>Attempt to reverse-engineer or circumvent security measures</Li>
          <Li>Impersonate any person or entity</Li>
          <Li>Interfere with or disrupt the Service infrastructure</Li>
        </ul>
      </Section>
      <Section title="5. AI Recognition Disclaimer">
        <p>
          The Service uses the Google Gemini AI model for food image recognition. AI estimates
          are inherently uncertain; actual calories and nutrients may vary based on ingredients,
          cooking method, and portion size. We make <strong>no warranty</strong> as to the
          accuracy of AI recognition results.
        </p>
      </Section>
      <Section title="6. Intellectual Property">
        <p>
          The Service&apos;s design, code, trademarks, and content belong to the CalorieCount Team.
          Personal data you create (food logs, custom foods) remains yours; you grant us a
          non-exclusive licence to use it solely to provide the Service.
        </p>
      </Section>
      <Section title="7. Suspension &amp; Termination">
        <ul className="space-y-1">
          <Li>We may modify, suspend, or discontinue the Service with reasonable advance notice.</Li>
          <Li>Accounts that materially breach these Terms may be suspended or terminated, in severe cases without prior notice.</Li>
          <Li>You may delete your account at any time; data will be purged within 30 days.</Li>
        </ul>
      </Section>
      <Section title="8. Disclaimer of Warranties">
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
          INCLUDING FITNESS FOR A PARTICULAR PURPOSE OR NON-INFRINGEMENT.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Note for EU/UK consumers: Nothing in these Terms affects your statutory rights under
          applicable consumer protection legislation.
        </p>
      </Section>
      <Section title="9. Limitation of Liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM
          THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE <strong>12 MONTHS</strong> PRECEDING
          THE CLAIM. WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.
        </p>
      </Section>
      <Section title="10. Governing Law &amp; Disputes">
        <p>
          These Terms are governed by the laws of the <strong>Republic of China (Taiwan)</strong>,
          without regard to conflict-of-law provisions. Disputes shall be resolved in the
          <strong> Taiwan Taipei District Court</strong> as the court of first instance.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          EU/UK consumers: you retain the right to bring claims before the courts of your country of residence.
        </p>
      </Section>
      <Section title="11. Changes to Terms">
        <p>
          We may update these Terms periodically. Material changes will be communicated via
          email or in-app notice at least <strong>30 days</strong> in advance.
          Continued use of the Service constitutes acceptance of the revised Terms.
        </p>
      </Section>
      <Section title="12. Contact">
        <p>
          For questions about these Terms:&nbsp;
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 underline">{CONTACT_EMAIL}</a>
        </p>
      </Section>
    </>
  );
}

// ─────────────────────────────────────────────
// 日本語（消費者契約法・特定商取引法対応）
// ─────────────────────────────────────────────

function TermsJa() {
  const EFFECTIVE_DATE = '2026年1月1日';
  const APP_NAME = 'CalorieCount';
  return (
    <>
      <div className="border-b pb-6">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">利用規約</h1>
        <p className="text-sm text-gray-500">制定日：{EFFECTIVE_DATE}</p>
      </div>
      <section>
        <p className="leading-relaxed text-gray-700">
          <strong>{APP_NAME}</strong>（以下「本サービス」）は、CalorieCountチーム（以下「当社」）が
          提供します。本サービスをご利用になることで、本規約に同意されたものとみなします。
          同意いただけない場合は、ご利用をお控えください。
        </p>
      </section>
      <Section title="第1条（サービスの内容）">
        <p>{APP_NAME}は、AIを活用した食事・健康管理アプリケーションです：</p>
        <ul className="mt-2 space-y-1">
          <Li>AI食品画像認識とカロリー推定</Li>
          <Li>日々の食事記録と栄養素トラッキング</Li>
          <Li>体重・運動・水分摂取量の管理</Li>
          <Li>個人化された健康目標の設定と達成トラッキング</Li>
          <Li>食事傾向の分析とレポート</Li>
        </ul>
        <Warning>
          <strong>重要な免責事項：</strong>カロリー推定および栄養情報は<strong>参考情報に過ぎず、医療上のアドバイスを構成するものではありません。</strong>
          糖尿病・摂食障害等の特定の健康状態をお持ちの方は、医療専門家にご相談ください。
        </Warning>
      </Section>
      <Section title="第2条（利用資格・アカウント登録）">
        <ul className="space-y-1">
          <Li>本サービスのご利用には<strong>13歳以上</strong>であることが必要です。18歳未満の方は保護者の同意が必要です。</Li>
          <Li>登録時には正確な情報を提供し、常に最新の状態に維持してください。</Li>
          <Li>アカウントの認証情報の管理責任はご利用者にあります。</Li>
          <Li>制限を回避するための複数アカウント作成は禁止します。</Li>
          <Li>不正利用を発見した場合は速やかにご連絡ください。</Li>
        </ul>
      </Section>
      <Section title="第3条（健康データの取り扱い）">
        <p>
          入力いただいた健康データは、個人化された機能の提供および匿名化後のAIモデル改善に利用します。
          個人の健康データを第三者に<strong>販売しません</strong>。
          詳細は<Link href="/privacy" className="text-emerald-600 underline">プライバシーポリシー</Link>をご参照ください。
        </p>
      </Section>
      <Section title="第4条（禁止事項）">
        <p>以下の行為を禁止します：</p>
        <ul className="mt-2 space-y-1">
          <Li>違法・暴力・わいせつ・著作権侵害コンテンツのアップロード</Li>
          <Li>自動化ツール（Bot）によるAPIの過負荷・スクレイピング</Li>
          <Li>リバースエンジニアリングやセキュリティ機能の回避</Li>
          <Li>他者または当社スタッフへのなりすまし</Li>
          <Li>本サービスのインフラへの障害を引き起こす行為</Li>
        </ul>
      </Section>
      <Section title="第5条（AI認識機能について）">
        <p>
          本サービスはGoogle Gemini AIモデルによる食品画像認識を使用しています。
          AI推定値は不確実性を伴い、実際のカロリー・栄養素は食材の産地・調理方法により異なります。
          AI認識結果の正確性については<strong>保証しません</strong>。
        </p>
      </Section>
      <Section title="第6条（知的財産権）">
        <p>
          本サービスのデザイン・コード・商標・コンテンツは当社に帰属します。
          お客様が作成した食事記録・カスタム食品等のデータはお客様に帰属し、
          お客様はサービス提供に必要な範囲での非独占的使用を当社に許諾するものとします。
        </p>
      </Section>
      <Section title="第7条（サービスの変更・停止・終了）">
        <ul className="space-y-1">
          <Li>当社は合理的な事前通知のうえ、サービスを変更・停止・終了できます。</Li>
          <Li>本規約に重大な違反があった場合、予告なくアカウントを停止・削除できます。</Li>
          <Li>お客様はいつでもアカウント削除を申請でき、30日以内にデータは完全に消去されます。</Li>
        </ul>
      </Section>
      <Section title="第8条（免責事項）">
        <p>
          本サービスは「現状有姿」で提供します。消費者契約法第8条の定めにより、
          当社の<strong>故意または重大な過失による損害については免責されません</strong>。
          それ以外の場合、当社の損害賠償責任はお客様が過去<strong>12ヶ月間</strong>に
          お支払いいただいた利用料を上限とします（無償利用の場合は上限ゼロ）。
        </p>
      </Section>
      <Section title="第9条（準拠法・管轄裁判所）">
        <p>
          本規約は<strong>中華民国（台湾）法</strong>に準拠します。ただし、日本の消費者契約法その他の
          強行法規は、日本在住のお客様に適用される限りにおいて本規約に優先します。
          日本在住のお客様は、日本の裁判所に訴訟を提起する権利を有します。
        </p>
      </Section>
      <Section title="第10条（有料サービスについて）">
        <p>
          将来導入予定のサブスクリプション機能については、特定商取引法に基づく表記を
          別途掲載します。導入時には事前に通知します。
        </p>
      </Section>
      <Section title="第11条（規約の変更）">
        <p>
          本規約を変更する場合、重要な変更は変更の<strong>30日前</strong>までにアプリ内通知または
          メールでお知らせします。変更後も本サービスを継続利用された場合、
          変更後の規約に同意したものとみなします。
        </p>
      </Section>
      <Section title="第12条（お問い合わせ）">
        <p>
          本規約に関するお問い合わせ：
          <a href={`mailto:${CONTACT_EMAIL}`} className="ml-1 text-emerald-600 underline">{CONTACT_EMAIL}</a>
        </p>
      </Section>
    </>
  );
}

// ─────────────────────────────────────────────
// Page entry point
// ─────────────────────────────────────────────

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    permanentRedirect('/zh-TW/terms');
  }

  const Content =
    locale === 'en' ? TermsEn : locale === 'ja' ? TermsJa : TermsZhTW;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-8 rounded-2xl bg-white p-8 shadow-sm md:p-12">
        <Content />
        <div className="border-t pt-6 text-center">
          <Link href="/privacy" className="text-sm text-emerald-600 hover:underline">
            {locale === 'en' ? 'Privacy Policy' : locale === 'ja' ? 'プライバシーポリシー' : '隱私權政策'}
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
