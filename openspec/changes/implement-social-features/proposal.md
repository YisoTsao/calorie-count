# 變更提案: 實作社交功能 (選配)

## 📋 變更資訊
- **變更名稱**: implement-social-features
- **建立日期**: 2025-10-25
- **預估時間**: 2-3 天
- **優先級**: Low (可選)
- **依賴**: implement-analytics

## 🎯 為什麼要做這個變更?

社交功能可以增加使用者黏著度和動機,透過好友互動、排行榜、挑戰賽等機制,讓健康管理更有趣。

**注意**: 此功能為選配,可根據產品定位決定是否實作。

## 📦 主要功能

### 1. 好友系統
- 搜尋好友 (email/username)
- 發送/接受好友邀請
- 好友列表
- 查看好友動態

### 2. 社交動態
- 發布飲食記錄 (可設定隱私)
- 點讚與留言
- 分享成就
- 動態時間軸

### 3. 排行榜
- 週/月減重排行
- 連續打卡排行
- 成就排行
- 好友排行

### 4. 挑戰賽
- 創建挑戰 (例: 30 天健身挑戰)
- 邀請好友參加
- 挑戰進度追蹤
- 挑戰完成獎勵

### 5. 隱私控制
- 公開/好友可見/私人
- 封鎖使用者
- 隱藏特定動態

## 資料庫 Schema
```prisma
model Friendship {
  id          String   @id @default(cuid())
  userId      String
  friendId    String
  status      FriendshipStatus @default(PENDING)
  user        User @relation("UserFriendships", fields: [userId], references: [id])
  friend      User @relation("FriendOf", fields: [friendId], references: [id])
  createdAt   DateTime @default(now())
  
  @@unique([userId, friendId])
}

enum FriendshipStatus {
  PENDING
  ACCEPTED
  REJECTED
  BLOCKED
}

model Post {
  id          String   @id @default(cuid())
  userId      String
  content     String?
  type        PostType // MEAL, ACHIEVEMENT, WEIGHT_UPDATE, CHALLENGE
  privacy     Privacy  @default(FRIENDS)
  mealId      String?
  imageUrl    String?
  likes       Like[]
  comments    Comment[]
  user        User @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum PostType {
  MEAL
  ACHIEVEMENT
  WEIGHT_UPDATE
  CHALLENGE
}

enum Privacy {
  PUBLIC
  FRIENDS
  PRIVATE
}

model Like {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  user      User @relation(fields: [userId], references: [id])
  post      Post @relation(fields: [postId], references: [id])
  createdAt DateTime @default(now())
  
  @@unique([userId, postId])
}

model Comment {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  content   String
  user      User @relation(fields: [userId], references: [id])
  post      Post @relation(fields: [postId], references: [id])
  createdAt DateTime @default(now())
}

model Challenge {
  id              String   @id @default(cuid())
  name            String
  description     String
  startDate       DateTime
  endDate         DateTime
  type            String   // WEIGHT_LOSS, STREAK, EXERCISE
  goal            Float?
  creatorId       String
  isPublic        Boolean  @default(false)
  creator         User @relation(fields: [creatorId], references: [id])
  participants    ChallengeParticipant[]
  createdAt       DateTime @default(now())
}

model ChallengeParticipant {
  id            String   @id @default(cuid())
  challengeId   String
  userId        String
  progress      Float    @default(0)
  completed     Boolean  @default(false)
  challenge     Challenge @relation(fields: [challengeId], references: [id])
  user          User @relation(fields: [userId], references: [id])
  joinedAt      DateTime @default(now())
  
  @@unique([challengeId, userId])
}
```

## ✅ 成功標準
- [ ] 好友系統運作正常
- [ ] 動態發布與互動功能完整
- [ ] 排行榜即時更新
- [ ] 挑戰賽機制運作正確
- [ ] 隱私設定有效

## 🚨 注意事項
- 需考慮內容審核機制
- 需實作檢舉與封鎖功能
- 需遵守個資保護法規
- 需考慮效能優化 (動態流可能很大)
