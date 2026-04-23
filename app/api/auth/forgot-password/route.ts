import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";
import { generateToken } from "@/lib/utils";
import { sendPasswordResetEmail } from "@/lib/email";
// ── 測試用：縮短過期時間方便本機驗證；正式改回 1（小時）──
const RESET_TOKEN_EXPIRES_HOURS = 1;
/**
 * POST /api/auth/forgot-password
 * 忘記密碼
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 驗證輸入
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((e) => e.message).join(", "),
      );
    }

    const { email } = result.data;

    // 查找用戶
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 為了安全，即使用戶不存在也返回成功訊息
    if (!user) {
      return NextResponse.json(
        createSuccessResponse({
          message: "如果該 Email 存在，我們已發送重置密碼連結。",
        }),
      );
    }

    // 生成重置 Token
    const resetToken = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRES_HOURS);

    // 刪除舊的重置 Token
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
      },
    });

    // 建立新的重置 Token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: resetToken,
        expires: expiresAt,
      },
    });

    // 發送重置密碼郵件
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json(
      createSuccessResponse({
        message: "如果該 Email 存在，我們已發送重置密碼連結。",
      }),
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        createErrorResponse("VALIDATION_ERROR", error.message),
        { status: 400 },
      );
    }

    console.error("Forgot password error:", error);
    return NextResponse.json(
      createErrorResponse("INTERNAL_ERROR", "處理失敗，請稍後再試"),
      { status: 500 },
    );
  }
}
