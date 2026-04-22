import nodemailer from 'nodemailer';

const APP_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
const APP_NAME = 'AI 卡路里追蹤';

function createTransporter() {
  // 開發環境：若未設定 SMTP，使用 Ethereal（自動抓測試帳號）
  if (process.env.NODE_ENV !== 'production') {
    if (!process.env.SMTP_HOST) {
      // 印出 token 方便開發測試
      return null;
    }
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * 發送 Email 驗證信
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  const transporter = createTransporter();

  if (!transporter) {
    // 開發模式：印出驗證連結
    console.log(`\n[DEV] 驗證 Email 連結 for ${email}:\n${verifyUrl}\n`);
    return;
  }

  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `驗證您的 ${APP_NAME} 帳號`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#1d4ed8;">歡迎加入 ${APP_NAME}！</h2>
        <p>請點擊下方按鈕驗證您的 Email 地址，連結 24 小時內有效。</p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:12px 24px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
          驗證 Email
        </a>
        <p style="margin-top:16px;color:#6b7280;font-size:14px;">
          若您未發起此請求，請忽略這封信。
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="color:#9ca3af;font-size:12px;">
          或複製以下連結貼到瀏覽器：<br>${verifyUrl}
        </p>
      </div>
    `,
  });
}

/**
 * 發送密碼重設信
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const transporter = createTransporter();

  if (!transporter) {
    console.log(`\n[DEV] 密碼重設連結 for ${email}:\n${resetUrl}\n`);
    return;
  }

  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `重設您的 ${APP_NAME} 密碼`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#1d4ed8;">密碼重設請求</h2>
        <p>請點擊下方按鈕重設您的密碼，連結 1 小時內有效。</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
          重設密碼
        </a>
        <p style="margin-top:16px;color:#6b7280;font-size:14px;">
          若您未發起此請求，請忽略這封信，您的帳號不會有任何變更。
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="color:#9ca3af;font-size:12px;">
          或複製以下連結貼到瀏覽器：<br>${resetUrl}
        </p>
      </div>
    `,
  });
}
