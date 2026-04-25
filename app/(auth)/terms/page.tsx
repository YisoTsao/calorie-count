import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '服務條款 | CalorieCount',
  description: 'CalorieCount AI 卡路里追蹤系統服務條款',
};

const EFFECTIVE_DATE = '2026年1月1日';
const APP_NAME = 'CalorieCount';
const CONTACT_EMAIL = 'support@calo-circle.yisoapp.com';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-8 rounded-2xl bg-white p-8 shadow-sm md:p-12">
        <div className="border-b pb-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">服務條款</h1>
          <p className="text-sm text-gray-500">生效日期：{EFFECTIVE_DATE}</p>
        </div>

        <section>
          <p className="leading-relaxed text-gray-700">
            歡迎使用 <strong>{APP_NAME}</strong>（以下簡稱「本服務」）。本服務由 CalorieCount
            團隊（以下簡稱「我們」）提供。
            在使用本服務前，請仔細閱讀以下服務條款。使用本服務即表示您同意本條款。
          </p>
        </section>

        <Section title="一、服務描述">
          <p>{APP_NAME} 是一款 AI 驅動的飲食與健康管理應用程式，提供以下核心功能：</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-gray-700">
            <li>AI 食物影像辨識與卡路里估算</li>
            <li>每日飲食紀錄與營養素追蹤</li>
            <li>體重、運動與水分攝取管理</li>
            <li>個人化健康目標設定與成就追蹤</li>
            <li>飲食趨勢分析與報表</li>
          </ul>
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            ⚠️ <strong>重要免責聲明</strong>
            ：本服務提供的卡路里估算與營養資訊僅供參考，不構成醫療建議。
            若您有特定健康需求（如糖尿病、飲食障礙等），請諮詢專業醫療人員。
          </p>
        </Section>

        <Section title="二、帳號註冊與使用">
          <ul className="list-inside list-disc space-y-2 text-gray-700">
            <li>您必須年滿 13 歲方可使用本服務（未滿 18 歲需獲得父母或監護人同意）。</li>
            <li>您須提供真實、準確的個人資訊進行註冊。</li>
            <li>您有責任保護帳號密碼安全，不得共享帳號。</li>
            <li>如發現帳號遭未授權使用，請立即通知我們。</li>
            <li>每人限申請一個帳號，不得以多個帳號操弄系統。</li>
          </ul>
        </Section>

        <Section title="三、健康資料的收集與使用">
          <p className="mb-3 text-gray-700">
            您在本服務中輸入的健康資料（包含飲食紀錄、體重、運動量等）將用於：
          </p>
          <ul className="list-inside list-disc space-y-1 text-gray-700">
            <li>提供個人化的健康追蹤與分析功能</li>
            <li>AI 模型的訓練與改進（匿名化處理後）</li>
            <li>顯示您的個人進度與成就</li>
          </ul>
          <p className="mt-3 text-gray-700">
            我們<strong>不會</strong>將您的個人健康資料販售予第三方。詳細資料使用方式請參閱我們的
            <a href="/privacy" className="ml-1 text-primary underline">
              隱私權政策
            </a>
            。
          </p>
        </Section>

        <Section title="四、使用者行為規範">
          <p className="mb-2 text-gray-700">您同意不從事以下行為：</p>
          <ul className="list-inside list-disc space-y-1 text-gray-700">
            <li>上傳含有違法、暴力、色情或侵權的內容</li>
            <li>透過自動化工具（Bot）大量存取 API</li>
            <li>嘗試逆向工程或破解本服務的安全機制</li>
            <li>冒充他人或本服務人員</li>
            <li>進行任何可能損害本服務基礎設施的行為</li>
          </ul>
        </Section>

        <Section title="五、AI 辨識功能說明">
          <p className="text-gray-700">
            本服務使用 Google Gemini AI 模型進行食物影像辨識。AI 辨識結果具有不確定性，
            實際卡路里與營養素可能因食材來源、烹調方式而有所差異。 我們<strong>不保證</strong> AI
            辨識結果的絕對準確性，使用者應自行判斷是否符合個人需求。
          </p>
        </Section>

        <Section title="六、智慧財產權">
          <p className="text-gray-700">
            本服務的設計、程式碼、商標、內容等均屬 CalorieCount 團隊所有。
            您在本服務中建立的個人飲食紀錄、自訂食物等資料歸您所有。
            您授予我們在提供服務範疇內使用該資料的非專屬授權。
          </p>
        </Section>

        <Section title="七、服務中斷與終止">
          <ul className="list-inside list-disc space-y-1 text-gray-700">
            <li>我們保留隨時修改、暫停或終止服務的權利，將提前合理通知。</li>
            <li>違反本條款的帳號可能被暫停或永久終止，不另行通知。</li>
            <li>您可隨時申請刪除帳號，刪除後資料將在 30 天內完整清除。</li>
          </ul>
        </Section>

        <Section title="八、免責聲明與責任限制">
          <p className="text-gray-700">
            本服務以「現況」提供，不提供任何形式的明示或暗示保證。
            對於使用本服務所引發的任何直接或間接損失（包含健康決策失誤）， 我們的責任不超過您過去 12
            個月所繳納的服務費用。
          </p>
        </Section>

        <Section title="九、條款修改">
          <p className="text-gray-700">
            我們可能不定期修改本條款。重大變更將透過 Email 或應用程式內通知告知您。
            繼續使用本服務即表示接受修改後的條款。
          </p>
        </Section>

        <Section title="十、聯絡方式">
          <p className="text-gray-700">
            如對本條款有任何疑問，請透過 Email 聯繫：{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>

        <div className="border-t pt-6 text-center">
          <a href="/privacy" className="text-sm text-primary hover:underline">
            隱私權政策
          </a>
          <span className="mx-2 text-gray-300">|</span>
          <a href="/login" className="text-sm text-gray-500 hover:underline">
            返回登入
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="leading-relaxed text-gray-700">{children}</div>
    </section>
  );
}
