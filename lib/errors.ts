/**
 * 自訂錯誤類別
 */

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown[]
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 驗證錯誤
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown[]) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * 未授權錯誤
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = '請先登入') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 禁止存取錯誤
 */
export class ForbiddenError extends AppError {
  constructor(message: string = '無權限執行此操作') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * 資源不存在錯誤
 */
export class NotFoundError extends AppError {
  constructor(message: string = '資源不存在') {
    super('NOT_FOUND', message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * 衝突錯誤
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * 請求過多錯誤
 */
export class RateLimitError extends AppError {
  constructor(message: string = '請求過於頻繁，請稍後再試') {
    super('RATE_LIMIT_EXCEEDED', message, 429);
    this.name = 'RateLimitError';
  }
}

/**
 * 內部伺服器錯誤
 */
export class InternalServerError extends AppError {
  constructor(message: string = '伺服器內部錯誤') {
    super('INTERNAL_SERVER_ERROR', message, 500);
    this.name = 'InternalServerError';
  }
}
