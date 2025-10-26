/**
 * API 相關型別定義
 */

// API 成功回應
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

// API 錯誤回應
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

// API 回應 (成功或錯誤)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// 分頁資料
export interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API 請求參數 - 分頁
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// API 請求參數 - 排序
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API 請求參數 - 篩選
export interface FilterParams {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// 完整的查詢參數
export interface QueryParams extends PaginationParams, SortParams, FilterParams {}
