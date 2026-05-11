import { Resend } from 'resend';

// ─────────────────────────────────────────────
// 開發開關：true = 真實用 Resend 發送；false = 只印 console
// 本機測試時可改為 true 驗證寄信流程
// ─────────────────────────────────────────────
const EMAIL_DEV_SEND = process.env.EMAIL_DEV_SEND === 'true';

const APP_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
const FROM_ADDRESS = process.env.EMAIL_FROM ?? 'noreply@calo-circle.yisoapp.com';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');
  return new Resend(apiKey);
}

function shouldSend(): boolean {
  if (process.env.NODE_ENV === 'production') return true;
  return EMAIL_DEV_SEND;
}

// ─────────────────────────────────────────────
// 多語系內容
// ─────────────────────────────────────────────

type SupportedLocale = 'zh-TW' | 'en' | 'ja';

function resolveLocale(locale?: string): SupportedLocale {
  const supported: SupportedLocale[] = ['zh-TW', 'en', 'ja'];
  return supported.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : 'zh-TW';
}

const EMAIL_CONTENT: Record<
  SupportedLocale,
  {
    appName: string;
    verifySubject: string;
    verifyTitle: string;
    verifyBody: string;
    verifyButton: string;
    verifyExpiry: string;
    verifyIgnore: string;
    verifyCopyHint: string;
    resetSubject: string;
    resetTitle: string;
    resetBody: string;
    resetButton: string;
    resetExpiry: string;
    resetIgnore: string;
    resetCopyHint: string;
  }
> = {
  'zh-TW': {
    appName: 'AI 卡路里追蹤',
    verifySubject: '驗證您的帳號',
    verifyTitle: '歡迎加入 AI 卡路里追蹤！',
    verifyBody: '請點擊下方按鈕驗證您的 Email 地址，連結 <strong>24 小時</strong>內有效。',
    verifyButton: '驗證 Email',
    verifyExpiry: '',
    verifyIgnore: '若您未申請此帳號，請忽略這封信。',
    verifyCopyHint: '或複製連結至瀏覽器：',
    resetSubject: '密碼重設請求',
    resetTitle: '密碼重設請求',
    resetBody: '請點擊下方按鈕重設您的密碼，連結 <strong>1 小時</strong>內有效。',
    resetButton: '重設密碼',
    resetExpiry: '',
    resetIgnore: '若您未發起此請求，請忽略這封信，帳號不會有任何變更。',
    resetCopyHint: '或複製連結至瀏覽器：',
  },
  en: {
    appName: 'CalorieCount AI',
    verifySubject: 'Verify your account',
    verifyTitle: 'Welcome to CalorieCount AI!',
    verifyBody: 'Click the button below to verify your email address. The link is valid for <strong>24 hours</strong>.',
    verifyButton: 'Verify Email',
    verifyExpiry: '',
    verifyIgnore: 'If you did not create an account, please ignore this email.',
    verifyCopyHint: 'Or copy the link to your browser:',
    resetSubject: 'Reset your password',
    resetTitle: 'Password Reset Request',
    resetBody: 'Click the button below to reset your password. The link is valid for <strong>1 hour</strong>.',
    resetButton: 'Reset Password',
    resetExpiry: '',
    resetIgnore: 'If you did not request a password reset, please ignore this email. Your account will remain unchanged.',
    resetCopyHint: 'Or copy the link to your browser:',
  },
  ja: {
    appName: 'CalorieCount AI',
    verifySubject: 'アカウントの確認',
    verifyTitle: 'CalorieCount AI へようこそ！',
    verifyBody: '下のボタンをクリックしてメールアドレスを確認してください。リンクは <strong>24時間</strong> 有効です。',
    verifyButton: 'メールを確認する',
    verifyExpiry: '',
    verifyIgnore: 'このアカウントを作成していない場合は、このメールを無視してください。',
    verifyCopyHint: 'またはリンクをブラウザにコピーしてください：',
    resetSubject: 'パスワードのリセット',
    resetTitle: 'パスワードリセットのリクエスト',
    resetBody: '下のボタンをクリックしてパスワードをリセットしてください。リンクは <strong>1時間</strong> 有効です。',
    resetButton: 'パスワードをリセット',
    resetExpiry: '',
    resetIgnore: 'このリクエストを行っていない場合は、このメールを無視してください。アカウントに変更はありません。',
    resetCopyHint: 'またはリンクをブラウザにコピーしてください：',
  },
};

// ─────────────────────────────────────────────
// Email HTML 模板
// ─────────────────────────────────────────────

function verificationEmailHtml(verifyUrl: string, locale: SupportedLocale): string {
  const c = EMAIL_CONTENT[locale];
  return `
    <div style="font-family:'Helvetica Neue',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
      <div style="background:#fff;border-radius:8px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
        <h1 style="margin:0 0 8px;font-size:24px;color:#111827;">${c.verifyTitle}</h1>
        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">${c.verifyBody}</p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:12px 28px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          ${c.verifyButton}
        </a>
        <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;">${c.verifyIgnore}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="color:#9ca3af;font-size:12px;word-break:break-all;">
          ${c.verifyCopyHint}<br>${verifyUrl}
        </p>
      </div>
    </div>
  `;
}

function passwordResetEmailHtml(resetUrl: string, locale: SupportedLocale): string {
  const c = EMAIL_CONTENT[locale];
  return `
    <div style="font-family:'Helvetica Neue',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
      <div style="background:#fff;border-radius:8px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
        <h1 style="margin:0 0 8px;font-size:24px;color:#111827;">${c.resetTitle}</h1>
        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">${c.resetBody}</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 28px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          ${c.resetButton}
        </a>
        <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;">${c.resetIgnore}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="color:#9ca3af;font-size:12px;word-break:break-all;">
          ${c.resetCopyHint}<br>${resetUrl}
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
 * @param locale 使用者當前語系（預設 zh-TW）
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  locale?: string
) {
  const loc = resolveLocale(locale);
  const c = EMAIL_CONTENT[loc];
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  if (!shouldSend()) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`[EMAIL DEV] 驗證信 (${loc}) → ${email}`);
    console.log(`[EMAIL DEV] 連結：${verifyUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return;
  }

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: `${c.verifySubject} | ${c.appName}`,
    html: verificationEmailHtml(verifyUrl, loc),
  });

  if (error) {
    console.error('[Resend] sendVerificationEmail error:', error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

/**
 * 發送密碼重設信
 * @param locale 使用者當前語系（預設 zh-TW）
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  locale?: string
) {
  const loc = resolveLocale(locale);
  const c = EMAIL_CONTENT[loc];
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  if (!shouldSend()) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`[EMAIL DEV] 密碼重設信 (${loc}) → ${email}`);
    console.log(`[EMAIL DEV] 連結：${resetUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return;
  }

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: `${c.resetSubject} | ${c.appName}`,
    html: passwordResetEmailHtml(resetUrl, loc),
  });

  if (error) {
    console.error('[Resend] sendPasswordResetEmail error:', error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}
