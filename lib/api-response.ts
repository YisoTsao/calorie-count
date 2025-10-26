/**
 * 統一的 API 回應格式
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * 建立成功回應
 */
export function createSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * 建立錯誤回應
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown[]
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * 分頁回應資料結構
 */
export interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 建立分頁回應
 */
export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): ApiSuccessResponse<PaginatedData<T>> {
  return createSuccessResponse({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
