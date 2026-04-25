import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '隱私權政策 | CalorieCount',
  description: 'CalorieCount AI 卡路里追蹤系統隱私權政策',
};

const EFFECTIVE_DATE = '2026年1月1日';
const CONTACT_EMAIL = 'support@calo-circle.yisoapp.com';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-8 rounded-2xl bg-white p-8 shadow-sm md:p-12">
        <div className="border-b pb-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">隱私權政策</h1>
          <p className="text-sm text-gray-500">生效日期：{EFFECTIVE_DATE}</p>
        </div>

        <section>
          <p className="leading-relaxed text-gray-700">
            CalorieCount（以下簡稱「我們」）重視您的隱私。本政策說明我們如何收集、使用、存儲及保護您的個人資料。
            本政策符合《個人資料保護法》（臺灣）及相關法規。
          </p>
        </section>

        <Section title="一、我們收集的資料">
          <div className="space-y-3">
            <div>
              <p className="mb-1 font-medium text-gray-800">帳號資料</p>
              <ul className="list-inside list-disc space-y-1 text-gray-700">
                <li>姓名、電子郵件地址</li>
                <li>個人頭像（選填）</li>
                <li>第三方登入資訊（Google、Facebook、LINE OAuth Token）</li>
              </ul>
            </div>
            <div>
              <p className="mb-1 font-medium text-gray-800">健康與飲食資料</p>
              <ul className="list-inside list-disc space-y-1 text-gray-700">
                <li>飲食紀錄：食物名稱、份量、卡路里、營養素</li>
                <li>體重紀錄、BMI 相關數據</li>
                <li>運動紀錄與消耗熱量</li>
                <li>每日飲水量</li>
                <li>健康目標（體重目標、卡路里目標）</li>
              </ul>
            </div>
            <div>
              <p className="mb-1 font-medium text-gray-800">上傳圖片</p>
              <ul className="list-inside list-disc space-y-1 text-gray-700">
                <li>您拍攝或上傳的食物照片（用於 AI 辨識）</li>
                <li>圖片在辨識完成後儲存於安全的雲端儲存</li>
              </ul>
            </div>
            <div>
              <p className="mb-1 font-medium text-gray-800">使用資料（自動收集）</p>
              <ul className="list-inside list-disc space-y-1 text-gray-700">
                <li>IP 位址、瀏覽器類型、裝置資訊</li>
                <li>使用時間與功能使用頻率</li>
                <li>錯誤日誌（用於改善服務穩定性）</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section title="二、資料使用方式">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 p-2 text-left">用途</th>
                <th className="border border-gray-200 p-2 text-left">法律依據</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['提供核心飲食追蹤功能', '履行服務合約'],
                ['AI 食物辨識分析', '履行服務合約'],
                ['寄送驗證信、重要帳號通知', '履行服務合約 / 合法利益'],
                ['提供個人化分析與建議', '您的同意'],
                ['AI 模型改進（完全匿名化）', '合法利益'],
                ['防止詐欺與安全防護', '合法利益'],
                ['法律遵循', '法律義務'],
              ].map(([purpose, basis]) => (
                <tr key={purpose} className="border-b border-gray-100">
                  <td className="border border-gray-200 p-2 text-gray-700">{purpose}</td>
                  <td className="border border-gray-200 p-2 text-gray-600">{basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="三、資料分享與第三方">
          <p className="mb-3 text-gray-700">
            我們<strong>不販售</strong>您的個人資料。以下情況可能共享資料：
          </p>
          <ul className="list-inside list-disc space-y-2 text-gray-700">
            <li>
              <strong>服務提供商</strong>：我們使用以下第三方服務，均受資料保護協議約束：
              <ul className="ml-4 mt-1 list-inside list-disc space-y-1 text-sm text-gray-600">
                <li>Google Gemini API — AI 食物辨識</li>
                <li>Vercel / Supabase — 資料庫與應用程式託管</li>
                <li>Resend — 電子郵件發送服務</li>
                <li>Google / Facebook / LINE OAuth — 第三方登入</li>
              </ul>
            </li>
            <li>
              <strong>法律要求</strong>：在法院命令或法律義務下，我們可能揭露必要資料。
            </li>
            <li>
              <strong>企業轉讓</strong>：若公司合併或被收購，資料可能隨之轉移，並提前通知您。
            </li>
          </ul>
        </Section>

        <Section title="四、資料保留期限">
          <ul className="list-inside list-disc space-y-1 text-gray-700">
            <li>帳號資料：帳號存續期間保留，刪帳後 30 天內清除</li>
            <li>飲食紀錄：帳號存續期間保留</li>
            <li>上傳的食物照片：最長保留 180 天（可手動刪除）</li>
            <li>匿名化的使用統計：最長保留 2 年</li>
          </ul>
        </Section>

        <Section title="五、您的資料權利">
          <p className="mb-2 text-gray-700">依據個人資料保護法，您享有以下權利：</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { icon: '', label: '查閱權', desc: '查看我們持有的您的資料' },
              { icon: '', label: '更正權', desc: '修正不正確的個人資料' },
              { icon: '', label: '刪除權', desc: '要求刪除您的帳號與資料' },
              { icon: '', label: '攜帶權', desc: '以可攜帶格式匯出您的資料' },
              { icon: '', label: '反對權', desc: '反對特定資料處理目的' },
              { icon: '', label: '限制處理', desc: '在特定情況下限制資料使用' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex gap-2 rounded-lg bg-gray-50 p-3">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-600">
            行使上述權利，請聯繫：
            <a href={`mailto:${CONTACT_EMAIL}`} className="ml-1 text-primary underline">
              {CONTACT_EMAIL}
            </a>
            ，我們將於 15 個工作天內回覆。
          </p>
        </Section>

        <Section title="六、資料安全">
          <ul className="list-inside list-disc space-y-1 text-gray-700">
            <li>所有資料傳輸使用 HTTPS/TLS 加密</li>
            <li>密碼使用 bcrypt（12 輪）雜湊儲存，絕不明文保存</li>
            <li>資料庫存取需驗證，定期進行安全稽核</li>
            <li>API 存取設有頻率限制（Rate Limiting）</li>
            <li>健康資料與一般帳號資料分層儲存</li>
          </ul>
        </Section>

        <Section title="七、Cookie 與追蹤技術">
          <p className="text-gray-700">
            本服務使用必要的 Session Cookie 維持登入狀態（不使用第三方廣告追蹤 Cookie）。
            您可在瀏覽器設定中管理 Cookie，但停用可能影響部分功能。
          </p>
        </Section>

        <Section title="八、未成年人保護">
          <p className="text-gray-700">
            本服務不針對 13 歲以下兒童。若我們發現在未取得監護人同意的情況下收集了兒童資料，
            將立即刪除相關資訊。
          </p>
        </Section>

        <Section title="九、政策更新">
          <p className="text-gray-700">
            本政策如有重大變更，將透過應用程式內通知或電子郵件提前 30 天告知。
            輕微調整將更新此頁面並修改生效日期。
          </p>
        </Section>

        <Section title="十、聯絡我們">
          <p className="text-gray-700">
            隱私相關問題請聯繫個人資料保護負責人：
            <a href={`mailto:${CONTACT_EMAIL}`} className="ml-1 text-primary underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>

        <div className="border-t pt-6 text-center">
          <a href="/terms" className="text-sm text-primary hover:underline">
            服務條款
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
