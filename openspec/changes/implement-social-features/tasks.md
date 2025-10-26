# 實作社交功能 - 任務清單

預估時間: 2-3 天 (選配功能)

## 1. 資料庫 Schema (6 tasks)
- [ ] 新增 Friendship model 與 FriendshipStatus enum
- [ ] 新增 Post model 與 PostType/Privacy enums
- [ ] 新增 Like model
- [ ] 新增 Comment model
- [ ] 新增 Challenge 與 ChallengeParticipant models
- [ ] 執行 migration

## 2. API Routes - 好友系統 (7 tasks)
- [ ] POST /api/friends/request - 發送好友邀請
- [ ] POST /api/friends/accept - 接受好友邀請
- [ ] POST /api/friends/reject - 拒絕好友邀請
- [ ] DELETE /api/friends/[id] - 刪除好友
- [ ] POST /api/friends/block - 封鎖使用者
- [ ] GET /api/friends - 取得好友列表
- [ ] GET /api/friends/requests - 取得好友邀請

## 3. API Routes - 動態發布 (6 tasks)
- [ ] POST /api/posts - 發布動態
- [ ] GET /api/posts/feed - 取得動態時間軸
- [ ] GET /api/posts/[id] - 取得動態詳情
- [ ] DELETE /api/posts/[id] - 刪除動態
- [ ] POST /api/posts/[id]/like - 點讚
- [ ] POST /api/posts/[id]/comment - 留言

## 4. API Routes - 排行榜 (4 tasks)
- [ ] GET /api/leaderboard/weight-loss?period=week|month - 減重排行
- [ ] GET /api/leaderboard/streak - 連續打卡排行
- [ ] GET /api/leaderboard/achievements - 成就排行
- [ ] GET /api/leaderboard/friends - 好友排行

## 5. API Routes - 挑戰賽 (6 tasks)
- [ ] POST /api/challenges - 創建挑戰
- [ ] GET /api/challenges - 取得挑戰列表
- [ ] GET /api/challenges/[id] - 取得挑戰詳情
- [ ] POST /api/challenges/[id]/join - 參加挑戰
- [ ] PATCH /api/challenges/[id]/progress - 更新進度
- [ ] GET /api/challenges/[id]/leaderboard - 挑戰排行

## 6. UI 元件 - 好友系統 (5 tasks)
- [ ] FriendSearchBar - 好友搜尋
- [ ] FriendCard - 好友卡片
- [ ] FriendRequestCard - 好友邀請卡片
- [ ] FriendsList - 好友列表
- [ ] AddFriendButton - 新增好友按鈕

## 7. UI 元件 - 動態 (8 tasks)
- [ ] PostCard - 動態卡片 (包含點讚、留言)
- [ ] PostComposer - 動態編輯器
- [ ] FeedTimeline - 動態時間軸
- [ ] LikeButton - 點讚按鈕
- [ ] CommentList - 留言列表
- [ ] CommentInput - 留言輸入框
- [ ] PrivacySelector - 隱私設定選擇器
- [ ] ShareMealButton - 分享飲食按鈕

## 8. UI 元件 - 排行榜 (4 tasks)
- [ ] LeaderboardTable - 排行榜表格
- [ ] LeaderboardCard - 排名卡片
- [ ] LeaderboardTabs - 排行榜分頁
- [ ] UserRankBadge - 使用者排名徽章

## 9. UI 元件 - 挑戰賽 (5 tasks)
- [ ] ChallengeCard - 挑戰卡片
- [ ] CreateChallengeDialog - 創建挑戰對話框
- [ ] ChallengeProgress - 挑戰進度條
- [ ] ChallengeFeed - 挑戰動態
- [ ] ChallengeParticipantsList - 參與者列表

## 10. 頁面實作 (6 tasks)
- [ ] app/(dashboard)/social/page.tsx - 社交首頁 (動態流)
- [ ] app/(dashboard)/friends/page.tsx - 好友頁面
- [ ] app/(dashboard)/leaderboard/page.tsx - 排行榜頁面
- [ ] app/(dashboard)/challenges/page.tsx - 挑戰賽列表
- [ ] app/(dashboard)/challenges/[id]/page.tsx - 挑戰詳情
- [ ] app/(dashboard)/profile/[userId]/page.tsx - 其他使用者檔案

## 11. 即時通知 (4 tasks)
- [ ] 安裝 pusher 或 socket.io
- [ ] 實作好友邀請通知
- [ ] 實作點讚/留言通知
- [ ] 實作挑戰更新通知

## 12. 隱私與安全 (5 tasks)
- [ ] 實作內容過濾機制
- [ ] 實作檢舉功能
- [ ] 實作封鎖邏輯
- [ ] 隱私設定權限檢查
- [ ] 敏感詞過濾

## 13. 效能優化 (4 tasks)
- [ ] 動態流分頁與無限滾動
- [ ] Redis 快取排行榜
- [ ] 資料庫查詢優化 (索引)
- [ ] 圖片 lazy loading

## 14. 測試 (6 tasks)
- [ ] API: 好友系統測試
- [ ] API: 動態發布與互動測試
- [ ] API: 排行榜計算測試
- [ ] API: 挑戰賽邏輯測試
- [ ] UI: 社交元件互動測試
- [ ] 整合: 隱私權限測試

---

**總任務數**: 76
**預估時間**: 2-3 天
**優先級**: Low (選配)
**依賴**: implement-analytics
