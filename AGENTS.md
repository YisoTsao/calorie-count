<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

---

# AI 食物卡路里辨識系統 - 前端開發指引

## 🎯 專案概況

- **框架**: Next.js 13+ (App Router)
- **語言**: TypeScript (strict mode)
- **樣式**: Tailwind CSS + Styled Components (部分元件)
- **包管理器**: Bun
- **程式碼品質**: ESLint + Prettier
- **部署**: HTTPS 開發環境 (server.js)
- **圖示庫**: @iconify/react 5.1.0

## 📁 專案架構

```
calorie-count/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx       # 根布局
│   │   ├── page.tsx         # 首頁
│   │   ├── (auth)/          # 認證相關頁面
│   │   └── (dashboard)/     # 儀表板頁面
│   ├── components/          # 可重用元件
│   │   ├── UI/             # 基礎 UI 元件 (Atoms)
│   │   ├── Page/           # 頁面級元件 (Templates)
│   │   └── [FeatureName]/  # 功能型元件 (Features)
│   ├── stores/             # Zustand 狀態管理
│   ├── lib/                # 共用程式庫
│   └── types/              # TypeScript 型別定義
├── openspec/               # OpenSpec 規格文件
├── prisma/                 # 資料庫 Schema
├── docs/                   # 專案文檔
├── public/                 # 靜態資源
└── ssl/                    # HTTPS 憑證
```

## 🎨 元件分層架構

採用修改版 Atomic Design 模式：

### 1. UI Layer (原子層) - `/src/components/UI/`

- **用途**: 最基礎的 UI 元件，高度可重用
- **特性**: 無業務邏輯、純 UI 展示
- **範例**: Button, Input, Modal, Card, ProgressIndicator

```typescript
// 標準 UI 元件結構
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  children,
  onClick,
  ...props
}) => {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};
```

### 2. Page Layer (頁面層) - `/src/components/Page/`

- **用途**: 頁面級元件，組合所有層級
- **特性**: 頁面級狀態管理、業務邏輯
- **範例**: Home, UserProfile, MealRecords

### 3. Feature Layer (功能層) - `/src/components/[FeatureName]/`

- **用途**: 完整功能模組，包含複雜業務邏輯
- **特性**: 獨立功能單元、可能包含內部狀態
- **範例**: FoodRecognition, MealTracker, NutritionChart

## 📝 檔案命名規範

| 類別      | 命名方式               | 範例                               | 說明                |
| --------- | ---------------------- | ---------------------------------- | ------------------- |
| 元件檔案  | PascalCase             | `UserProfile.tsx`, `index.tsx`     | 元件用 PascalCase   |
| 頁面檔案  | Next.js 規範           | `page.tsx`, `layout.tsx`           | App Router 固定命名 |
| 型別檔案  | PascalCase + .types    | `Button.types.ts`                  | 型別定義檔案        |
| 工具檔案  | kebab-case             | `user-service.ts`, `api-client.ts` | 工具/服務檔案       |
| Hook 檔案 | use + PascalCase       | `useUserData.ts`                   | 自定義 Hooks        |
| 變數      | camelCase              | `userName`, `isLoading`            | 一般變數            |
| 常數      | UPPER_SNAKE_CASE       | `API_BASE_URL`, `MAX_FILE_SIZE`    | 常數定義            |
| 函數      | camelCase + 動詞開頭   | `getUserData`, `handleClick`       | 函數命名            |
| 布林值    | is/has/can/should 前綴 | `isLoading`, `hasData`             | 布林變數            |
| CSS 類別  | kebab-case             | `user-card`, `btn-primary`         | CSS 類別            |

## 🔧 程式碼風格規範

### Import 順序規範

```typescript
// ✅ 正確的 import 順序
import React, { useEffect, useState } from 'react'; // 1. React (優先)
import { NextPage } from 'next'; // 2. Next.js
import { Icon } from '@iconify/react'; // 3. 外部套件
import { Button } from '@/components/UI'; // 4. 內部模組 (@/)
import { getUserData } from '../utils'; // 5. 相對路徑
import styles from './UserCard.module.css'; // 6. 樣式檔案
```

### 型別定義規範

```typescript
// Props 介面命名: ComponentName + Props
interface UserCardProps {
  /** 使用者 ID */
  id: string;
  /** 使用者姓名 */
  name: string;
  /** 電子郵件 (可選) */
  email?: string;
  /** 點擊事件處理器 */
  onClick?: (id: string) => void;
}

// API 回應型別: Entity + ApiResponse
interface UserApiResponse {
  success: boolean;
  data: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

// 枚舉定義
enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}
```

## 🎨 樣式開發規範

### Tailwind CSS 優先

```typescript
// ✅ 優先使用 Tailwind
const Card: React.FC<CardProps> = ({ children, variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    primary: 'bg-blue-50 border border-blue-200',
    danger: 'bg-red-50 border border-red-200',
  };

  return (
    <div className={clsx(
      'rounded-lg shadow-sm p-4 transition-all',
      variantClasses[variant]
    )}>
      {children}
    </div>
  );
};
```

### Styled Components (複雜元件)

```typescript
// 需要複雜樣式邏輯或動態計算時使用
import styled from 'styled-components';

const StyledButton = styled.button<{ variant?: string; size?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease-in-out;

  ${({ variant = 'primary' }) => buttonVariants[variant]}
  ${({ size = 'medium' }) => buttonSizes[size]}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
```

## 🛠 元件開發指引

### 元件目錄結構

```
ComponentName/
├── index.tsx                 # 主要元件
├── ComponentName.types.ts    # 型別定義
├── ComponentName.styles.ts   # Styled Components (如需要)
└── hooks/                    # 專用 hooks (如需要)
    └── useComponentName.ts
```

### 元件模板

```typescript
import React from 'react';
import { ComponentNameProps } from './ComponentName.types';

/**
 * ComponentName 元件
 * @description 元件功能描述
 * @param prop1 - 屬性說明
 * @param prop2 - 屬性說明
 */
const ComponentName: React.FC<ComponentNameProps> = ({
  prop1,
  prop2 = 'defaultValue',
  children,
  ...props
}) => {
  // 內部狀態
  const [internalState, setInternalState] = useState();

  // 副作用
  useEffect(() => {
    // 初始化邏輯
  }, []);

  // 事件處理器
  const handleEvent = () => {
    // 處理邏輯
  };

  // 渲染
  return (
    <div {...props}>
      {children}
    </div>
  );
};

export default ComponentName;
```

### 型別定義模板

```typescript
// ComponentName.types.ts
export interface ComponentNameProps {
  /** 必填屬性描述 */
  prop1: string;
  /** 可選屬性描述 */
  prop2?: string;
  /** 子元素 */
  children?: React.ReactNode;
  /** HTML 屬性繼承 */
  className?: string;
}

export type ComponentNameVariant = 'primary' | 'secondary' | 'outline';
```

## 🔄 狀態管理指引 (Zustand)

### Store 結構規範

```typescript
// stores/exampleStore.ts
import { create } from 'zustand';

interface ExampleState {
  // 狀態
  data: ExampleData[];
  isLoading: boolean;
  error: string | null;
}

interface ExampleActions {
  // 動作
  fetchData: () => Promise<void>;
  updateData: (id: string, data: Partial<ExampleData>) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: ExampleState = {
  data: [],
  isLoading: false,
  error: null,
};

export const useExampleStore = create<ExampleState & ExampleActions>((set, get) => ({
  ...initialState,

  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchExampleData();
      set({ data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateData: (id, newData) => {
    const { data } = get();
    const updatedData = data.map((item) => (item.id === id ? { ...item, ...newData } : item));
    set({ data: updatedData });
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
```

## 📄 Next.js 頁面開發

### 頁面元件模板

```typescript
// app/example/page.tsx
import { Metadata } from 'next';
import ExamplePageComponent from '@/components/Page/Example';

export const metadata: Metadata = {
  title: '頁面標題 | AI 卡路里辨識',
  description: '頁面描述',
};

const ExamplePage = () => {
  return <ExamplePageComponent />;
};

export default ExamplePage;
```

### Layout 模板

```typescript
// app/(dashboard)/layout.tsx
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
```

## 🔐 API 整合規範

### API Client 標準

```typescript
// lib/api-client.ts
import { ApiResponse } from '@/types/api';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async fetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  get<T>(endpoint: string) {
    return this.fetch<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data: unknown) {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
```

## 🎯 開發最佳實踐

### 1. 元件設計原則

- ✅ 單一職責：每個元件只做一件事
- ✅ 可重用性：設計時考慮多場景使用
- ✅ 可測試性：邏輯與 UI 分離
- ✅ 可維護性：清晰的命名與註解

### 2. 效能優化

- ✅ 使用 `React.memo` 避免不必要的重渲染
- ✅ 大列表使用虛擬滾動
- ✅ 圖片使用 Next.js Image 組件
- ✅ 動態 import 減少初始包大小

### 3. 錯誤處理

- ✅ 所有 async 操作包裹 try-catch
- ✅ 友善的錯誤訊息給使用者
- ✅ 記錄錯誤到 console (開發) 或日誌系統 (生產)

### 4. 可訪問性 (a11y)

- ✅ 語意化 HTML
- ✅ ARIA 屬性
- ✅ 鍵盤導航支援
- ✅ 色彩對比度符合 WCAG 標準

## 🚨 常見錯誤與解決

### 問題 1: Import 路徑錯誤

```typescript
// ❌ 錯誤
import { Button } from '../../components/UI/Button';

// ✅ 正確 (使用別名)
import { Button } from '@/components/UI/Button';
```

### 問題 2: 狀態更新不即時

```typescript
// ❌ 錯誤 (直接修改狀態)
state.data.push(newItem);

// ✅ 正確 (返回新狀態)
set({ data: [...state.data, newItem] });
```

### 問題 3: useEffect 無限循環

```typescript
// ❌ 錯誤 (缺少依賴)
useEffect(() => {
  fetchData();
}, []);

// ✅ 正確 (明確依賴)
useEffect(() => {
  fetchData();
}, [fetchData]);
```

## 📚 參考資源

- [Next.js 文件](https://nextjs.org/docs)
- [Tailwind CSS 文件](https://tailwindcss.com/docs)
- [Zustand 文件](https://docs.pmnd.rs/zustand)
- [TypeScript 文件](https://www.typescriptlang.org/docs)
- [Iconify 圖示](https://icon-sets.iconify.design)

---

## 🔗 與 OpenSpec 協作

當實作 OpenSpec 變更時:

1. 先查閱 `openspec/changes/<change-id>/specs/` 了解規格
2. 遵循上述前端開發規範
3. 確保實作符合 spec.md 中的所有 Scenarios
4. 完成任務後更新 `tasks.md` 的 checkbox
