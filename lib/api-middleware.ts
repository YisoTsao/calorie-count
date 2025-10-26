/**
 * API 錯誤處理中間件
 * 統一處理 API 路由中的錯誤
 */

import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api-response';
import { AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError } from '@/lib/errors';
import { ZodError } from 'zod';

/**
 * API 錯誤處理包裝函數
 * 用於包裝 API route handler 以自動處理錯誤
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  }) as T;
}

/**
 * 處理 API 錯誤並返回適當的 HTTP 回應
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Zod 驗證錯誤
  if (error instanceof ZodError) {
    return NextResponse.json(
      createErrorResponse(
        'VALIDATION_ERROR',
        '輸入資料格式不正確',
        error.issues
      ),
      { status: 400 }
    );
  }

  // 自訂應用程式錯誤
  if (error instanceof ValidationError) {
    return NextResponse.json(
      createErrorResponse('VALIDATION_ERROR', error.message),
      { status: 400 }
    );
  }

  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      createErrorResponse('UNAUTHORIZED', error.message),
      { status: 401 }
    );
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      createErrorResponse('FORBIDDEN', error.message),
      { status: 403 }
    );
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      createErrorResponse('NOT_FOUND', error.message),
      { status: 404 }
    );
  }

  if (error instanceof ConflictError) {
    return NextResponse.json(
      createErrorResponse('CONFLICT', error.message),
      { status: 409 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      createErrorResponse(error.code, error.message),
      { status: error.statusCode }
    );
  }

  // Prisma 錯誤
  if (error && typeof error === 'object' && 'code' in error) {
    return handlePrismaError(error);
  }

  // 未知錯誤
  return NextResponse.json(
    createErrorResponse(
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'development'
        ? (error as Error).message
        : '伺服器發生錯誤，請稍後再試'
    ),
    { status: 500 }
  );
}

/**
 * 處理 Prisma 特定錯誤
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handlePrismaError(error: any): NextResponse {
  const code = error.code;

  switch (code) {
    case 'P2002':
      // Unique constraint violation
      return NextResponse.json(
        createErrorResponse(
          'CONFLICT',
          '此資料已存在',
          error.meta?.target ? [`欄位: ${error.meta.target.join(', ')}`] : undefined
        ),
        { status: 409 }
      );

    case 'P2025':
      // Record not found
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', '找不到指定的資料'),
        { status: 404 }
      );

    case 'P2003':
      // Foreign key constraint violation
      return NextResponse.json(
        createErrorResponse('BAD_REQUEST', '資料關聯錯誤'),
        { status: 400 }
      );

    case 'P2014':
      // Required relation violation
      return NextResponse.json(
        createErrorResponse('BAD_REQUEST', '缺少必要的關聯資料'),
        { status: 400 }
      );

    default:
      return NextResponse.json(
        createErrorResponse(
          'DATABASE_ERROR',
          process.env.NODE_ENV === 'development'
            ? `資料庫錯誤: ${error.message}`
            : '資料庫操作失敗'
        ),
        { status: 500 }
      );
  }
}

/**
 * 驗證必要欄位的輔助函數
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): void {
  const missingFields = requiredFields.filter(field => !data[field]);

  if (missingFields.length > 0) {
    throw new ValidationError(
      `缺少必要欄位: ${missingFields.join(', ')}`
    );
  }
}

/**
 * 驗證 ID 格式的輔助函數
 */
export function validateId(id: string | null | undefined, fieldName = 'ID'): string {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new ValidationError(`無效的 ${fieldName}`);
  }
  return id;
}

/**
 * 安全的 JSON 解析
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function safeParseBody<T = any>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError('無效的 JSON 格式');
  }
}
