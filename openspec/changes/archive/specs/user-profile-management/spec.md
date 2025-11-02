# 規格: 會員資料管理

## 📋 規格資訊
- **規格名稱**: user-profile-management
- **版本**: 1.0.0
- **建立日期**: 2025-10-25
- **相關變更**: implement-user-management

## 🎯 規格目標
提供完整的會員個人資料管理功能,包含基本資料編輯、目標設定、偏好設定、頭像上傳、密碼修改和帳號刪除等功能。

## 📊 資料模型

### UserProfile 擴展欄位
```prisma
model UserProfile {
  id           String         @id @default(cuid())
  userId       String         @unique
  
  // 基本資料
  dateOfBirth  DateTime?      // 生日
  gender       Gender?        // 性別
  height       Float?         // 身高 (公分)
  weight       Float?         // 目前體重 (公斤)
  targetWeight Float?         // 目標體重 (公斤)
  activityLevel ActivityLevel @default(MODERATE) // 活動量
  
  // 計算欄位
  bmi          Float?         // BMI (計算得出,不儲存)
  bmr          Float?         // 基礎代謝率 (計算得出,不儲存)
  tdee         Float?         // 每日總消耗 (計算得出,不儲存)
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### UserGoals 擴展欄位
```prisma
model UserGoals {
  id               String    @id @default(cuid())
  userId           String    @unique
  
  goalType         GoalType  @default(MAINTAIN) // 減重/增重/維持
  dailyCalorieGoal Int       @default(2000)     // 每日卡路里目標
  proteinGoal      Float     @default(50)       // 蛋白質目標 (克)
  carbsGoal        Float     @default(250)      // 碳水目標 (克)
  fatGoal          Float     @default(65)       // 脂肪目標 (克)
  waterGoal        Int       @default(2000)     // 水分目標 (毫升)
  targetDate       DateTime? // 目標達成日期
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🔐 API 規格

### 1. 取得使用者完整資料
```
GET /api/users/me/profile
```

**認證**: 必須

**回應**:
```json
{
  "success": true,
  "data": {
    "id": "user_xxx",
    "name": "張三",
    "email": "user@example.com",
    "image": "https://...",
    "emailVerified": "2024-01-01T00:00:00Z",
    "profile": {
      "dateOfBirth": "1990-01-01T00:00:00Z",
      "gender": "MALE",
      "height": 175,
      "weight": 70,
      "targetWeight": 65,
      "activityLevel": "MODERATE"
    },
    "goals": {
      "goalType": "LOSE_WEIGHT",
      "dailyCalorieGoal": 1800,
      "proteinGoal": 90,
      "carbsGoal": 180,
      "fatGoal": 50,
      "waterGoal": 2500,
      "targetDate": "2024-06-01T00:00:00Z"
    },
    "preferences": {
      "theme": "DARK",
      "language": "zh-TW",
      "units": "METRIC",
      "notificationMealReminders": true,
      "notificationWaterReminders": true,
      "privacyProfileVisibility": "FRIENDS"
    },
    "stats": {
      "bmi": 22.9,
      "bmr": 1650,
      "tdee": 2280,
      "memberSince": "2024-01-01T00:00:00Z",
      "daysActive": 45
    }
  }
}
```

### 2. 更新個人資料
```
PATCH /api/users/me/profile
```

**認證**: 必須

**請求體**:
```json
{
  "profile": {
    "dateOfBirth": "1990-01-01",
    "gender": "MALE",
    "height": 175,
    "weight": 70,
    "targetWeight": 65,
    "activityLevel": "MODERATE"
  },
  "goals": {
    "goalType": "LOSE_WEIGHT",
    "dailyCalorieGoal": 1800,
    "proteinGoal": 90,
    "carbsGoal": 180,
    "fatGoal": 50,
    "waterGoal": 2500,
    "targetDate": "2024-06-01"
  },
  "preferences": {
    "theme": "DARK",
    "language": "zh-TW",
    "units": "METRIC",
    "notificationMealReminders": true,
    "notificationWaterReminders": true,
    "notificationGoalReminders": true,
    "privacyProfileVisibility": "FRIENDS",
    "privacyShowWeight": false,
    "privacyShowProgress": true
  }
}
```

**驗證規則**:
- `dateOfBirth`: 必須是過去的日期,年齡需在 13-120 歲之間
- `gender`: 必須是 MALE, FEMALE, OTHER 之一
- `height`: 50-300 公分
- `weight`: 20-300 公斤
- `targetWeight`: 20-300 公斤
- `activityLevel`: SEDENTARY, LIGHT, MODERATE, ACTIVE, VERY_ACTIVE
- `dailyCalorieGoal`: 800-5000 卡路里
- `proteinGoal`, `carbsGoal`, `fatGoal`: 0-500 克
- `waterGoal`: 500-10000 毫升

**回應**: (同 GET /api/users/me/profile)

### 3. 上傳頭像
```
POST /api/users/me/avatar
Content-Type: multipart/form-data
```

**認證**: 必須

**請求體**:
```
file: (image file)
```

**驗證規則**:
- 檔案格式: JPG, PNG, WEBP
- 檔案大小: 最大 5MB
- 圖片尺寸: 建議 400x400 以上

**處理流程**:
1. 驗證檔案格式和大小
2. 使用 Sharp 壓縮圖片 (最大寬度 800px)
3. 上傳到儲存服務 (Vercel Blob / Cloudinary)
4. 更新使用者的 image 欄位
5. 刪除舊頭像 (如果存在)

**回應**:
```json
{
  "success": true,
  "data": {
    "image": "https://storage.example.com/avatars/user_xxx.jpg",
    "message": "頭像更新成功"
  }
}
```

### 4. 修改密碼
```
PATCH /api/users/me/password
```

**認證**: 必須

**請求體**:
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}
```

**驗證規則**:
- `currentPassword`: 必須正確
- `newPassword`: 至少 8 字元,包含大小寫字母和數字
- `confirmPassword`: 必須與 newPassword 相同
- 新密碼不能與舊密碼相同

**回應**:
```json
{
  "success": true,
  "data": {
    "message": "密碼已成功更新"
  }
}
```

### 5. 刪除帳號
```
DELETE /api/users/me
```

**認證**: 必須

**請求體**:
```json
{
  "password": "UserPassword123!",
  "confirmation": "DELETE"
}
```

**驗證規則**:
- `password`: 必須正確
- `confirmation`: 必須是大寫 "DELETE"

**處理流程**:
1. 驗證密碼
2. 驗證確認字串
3. 軟刪除使用者 (標記 deletedAt)
4. 清除所有相關資料 (或標記為已刪除)
5. 登出使用者

**回應**:
```json
{
  "success": true,
  "data": {
    "message": "帳號已刪除"
  }
}
```

### 6. 取得使用者統計資料
```
GET /api/users/me/stats
```

**認證**: 必須

**回應**:
```json
{
  "success": true,
  "data": {
    "memberSince": "2024-01-01T00:00:00Z",
    "daysActive": 45,
    "totalMeals": 120,
    "totalFoods": 350,
    "currentStreak": 7,
    "longestStreak": 15,
    "bmi": 22.9,
    "bmr": 1650,
    "tdee": 2280,
    "weightChange": -2.5,
    "goalProgress": 50
  }
}
```

## 🧮 計算公式

### BMI (Body Mass Index)
```
BMI = weight(kg) / (height(m) ^ 2)
```

分類:
- < 18.5: 體重過輕
- 18.5 - 23.9: 正常範圍
- 24.0 - 27.9: 過重
- >= 28.0: 肥胖

### BMR (基礎代謝率) - Mifflin-St Jeor Equation
```
男性: BMR = (10 × weight(kg)) + (6.25 × height(cm)) - (5 × age) + 5
女性: BMR = (10 × weight(kg)) + (6.25 × height(cm)) - (5 × age) - 161
```

### TDEE (每日總消耗熱量)
```
TDEE = BMR × 活動係數

活動係數:
- SEDENTARY (久坐): 1.2
- LIGHT (輕度活動): 1.375
- MODERATE (中度活動): 1.55
- ACTIVE (活躍): 1.725
- VERY_ACTIVE (非常活躍): 1.9
```

### 建議卡路里攝取
```
減重: TDEE - 500 (每週減重 0.5 kg)
增重: TDEE + 500 (每週增重 0.5 kg)
維持: TDEE
```

## 🎨 UI/UX 規格

### 個人資料頁面 Layout
```
┌─────────────────────────────────────────┐
│ Navbar                                  │
├──────┬──────────────────────────────────┤
│      │                                  │
│ Side │  會員中心                         │
│ bar  │  ┌────────────┬────────────┐     │
│      │  │ 基本資訊    │ 身體數據    │     │
│      │  └────────────┴────────────┘     │
│      │  ┌──────────────────────────┐   │
│      │  │ 每日目標                  │   │
│      │  └──────────────────────────┘   │
│      │  ┌──────────────────────────┐   │
│      │  │ 統計資料                  │   │
│      │  └──────────────────────────┘   │
│      │                                  │
└──────┴──────────────────────────────────┘
```

### 表單欄位組織

#### 個人資料編輯
- 姓名 (Text Input)
- Email (Text Input, disabled)
- 生日 (Date Picker)
- 性別 (Radio Group)
- 頭像 (Image Upload)

#### 身體數據
- 身高 (Number Input + 單位)
- 目前體重 (Number Input + 單位)
- 目標體重 (Number Input + 單位)
- 活動量 (Select/Radio)

#### 目標設定
- 目標類型 (Radio: 減重/增重/維持)
- 每日卡路里 (Number Input + 建議值)
- 蛋白質目標 (Number Input + slider)
- 碳水目標 (Number Input + slider)
- 脂肪目標 (Number Input + slider)
- 水分目標 (Number Input)
- 目標日期 (Date Picker, optional)

#### 偏好設定
- 主題 (Radio: 淺色/深色/自動)
- 語言 (Select)
- 單位 (Radio: 公制/英制)
- 通知設定 (Toggle switches)
- 隱私設定 (Toggle switches)

### 互動行為

#### 頭像上傳
1. 點擊頭像顯示上傳選項
2. 拖放或選擇檔案
3. 預覽裁切 (可選)
4. 上傳進度條
5. 成功後即時更新

#### 表單儲存
- 自動儲存 (debounced)
- 手動儲存按鈕
- 儲存成功 Toast 提示
- 錯誤顯示在欄位下方

#### 目標計算
- 輸入身高/體重/年齡後自動計算 BMI/BMR/TDEE
- 根據目標類型自動建議卡路里攝取
- 營養素目標可手動調整或使用建議值

#### 密碼修改
- 顯示/隱藏密碼切換
- 即時密碼強度指示
- 確認密碼即時比對

#### 帳號刪除
- 需要輸入密碼確認
- 需要輸入 "DELETE" 確認
- 顯示警告訊息
- 二次確認對話框

## 🔒 安全性要求

1. **身份驗證**: 所有 API 都需要有效的 session token
2. **權限檢查**: 只能編輯自己的資料
3. **密碼驗證**: 敏感操作需要重新輸入密碼
4. **輸入驗證**: 所有輸入都使用 Zod schema 驗證
5. **檔案驗證**: 頭像上傳需檢查檔案類型和大小
6. **Rate Limiting**: 密碼修改和帳號刪除需要限流
7. **CSRF 保護**: 使用 Next.js 內建的 CSRF token

## 📱 響應式設計

- **手機 (< 768px)**: 單欄布局,表單全寬
- **平板 (768px - 1024px)**: 雙欄布局,側邊欄可收合
- **桌面 (> 1024px)**: 固定側邊欄,多欄卡片布局

## ♿ 無障礙要求

- 所有表單欄位有 label
- 使用語意化 HTML
- 鍵盤可完整操作
- ARIA 屬性正確設定
- 色彩對比符合 WCAG AA 標準

## 🎯 效能目標

- 頁面載入時間 < 2 秒
- 表單提交回應 < 500ms
- 頭像上傳 < 3 秒 (5MB 檔案)
- 圖片壓縮後大小 < 200KB

## ✅ 驗收標準

1. [ ] 所有欄位都可以正確編輯和儲存
2. [ ] 頭像上傳功能正常,支援預覽和壓縮
3. [ ] BMI/BMR/TDEE 計算正確
4. [ ] 目標設定可以自動建議或手動調整
5. [ ] 主題切換即時生效且保存
6. [ ] 密碼修改需要舊密碼驗證
7. [ ] 帳號刪除有二次確認機制
8. [ ] 所有表單都有完整的錯誤處理
9. [ ] 響應式設計在各裝置正常運作
10. [ ] 無障礙性符合 WCAG AA 標準
