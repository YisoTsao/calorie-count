import { Resend } from 'resend';

// ─────────────────────────────────────────────
// 開發開關：true = 真實用 Resend 發送；false = 只印 console
// 本機測試時可改為 true 驗證寄信流程
// ─────────────────────────────────────────────
const EMAIL_DEV_SEND = process.env.EMAIL_DEV_SEND === 'true';

const APP_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
const APP_NAME = 'AI 卡路里追蹤';
const FROM_ADDRESS = process.env.EMAIL_FROM ?? 'noreply@calo-circle.yisoapp.com';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');
  return new Resend(apiKey);
}

/** 判斷是否要真實發信 */
function shouldSend(): boolean {
  if (process.env.NODE_ENV === 'production') return true;
  return EMAIL_DEV_SEND;
}

// ─────────────────────────────────────────────
// Email HTML 模板
// ─────────────────────────────────────────────

function verificationEmailHtml(verifyUrl: string): string {
  return `
    <div style="font-family:'Helvetica Neue',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
      <div style="background:#fff;border-radius:8px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
        <h1 style="margin:0 0 8px;font-size:24px;color:#111827;">歡迎加入 ${APP_NAME}！</h1>
        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">請點擊下方按鈕驗證您的 Email 地址，連結 <strong>24 小時</strong>內有效。</p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:12px 28px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          驗證 Email
        </a>
        <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;">若您未申請此帳號，請忽略這封信。</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="color:#9ca3af;font-size:12px;word-break:break-all;">
          或複製連結至瀏覽器：<br>${verifyUrl}
        </p>
      </div>
    </div>
  `;
}

function passwordResetEmailHtml(resetUrl: string): string {
  return `
    <div style="font-family:'Helvetica Neue',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
      <div style="background:#fff;border-radius:8px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
        <h1 style="margin:0 0 8px;font-size:24px;color:#111827;">密碼重設請求</h1>
        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">請點擊下方按鈕重設您的密碼，連結 <strong>1 小時</strong>內有效。</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 28px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          重設密碼
        </a>
        <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;">若您未發起此請求，請忽略這封信，帳號不會有任何變更。</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="color:#9ca3af;font-size:12px;word-break:break-all;">
          或複製連結至瀏覽器：<br>${resetUrl}
        </p>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────
// 公開 API
// ─────────────────────────────────────────────

/**
 * 發送 Email 驗證信
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  if (!shouldSend()) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`[EMAIL DEV] 驗證信 → ${email}`);
    console.log(`[EMAIL DEV] 連結：${verifyUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return;
  }

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: `驗證您的 ${APP_NAME} 帳號`,
    html: verificationEmailHtml(verifyUrl),
  });

  if (error) {
    console.error('[Resend] sendVerificationEmail error:', error);
    throw new Error(`寄送驗證信失敗：${error.message}`);
  }
}

/**
 * 發送密碼重設信
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  if (!shouldSend()) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`[EMAIL DEV] 密碼重設信 → ${email}`);
    console.log(`[EMAIL DEV] 連結：${resetUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return;
  }

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: `重設您的 ${APP_NAME} 密碼`,
    html: passwordResetEmailHtml(resetUrl),
  });

  if (error) {
    console.error('[Resend] sendPasswordResetEmail error:', error);
    throw new Error(`寄送重設密碼信失敗：${error.message}`);
  }
}
