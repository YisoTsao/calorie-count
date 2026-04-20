# 資料庫設置指南

## 前置需求

- PostgreSQL 16+ 
- Bun (或 Node.js 18+)

## 快速開始

### 1. 使用 Docker 啟動 PostgreSQL

```bash
# 啟動資料庫
./scripts/db.sh start

# 檢查狀態
./scripts/db.sh status

# 查看日誌
./scripts/db.sh logs

# 連接到資料庫
./scripts/db.sh psql
```

### 2. 設定環境變數

複製 `.env.example` 到 `.env` 並填入必要資訊：

```bash
cp .env.example .env
```

必要的環境變數：
- `DATABASE_URL` - PostgreSQL 連線字串
- `NEXTAUTH_SECRET` - NextAuth 密鑰（至少 32 字元）
- `NEXTAUTH_URL` - 應用程式 URL

### 3. 執行資料庫遷移

```bash
# 同步資料庫 schema（開發環境）
bun run db:push

# 或執行 migrations（生產環境建議）
bun run db:migrate
```

### 4. 生成 Prisma Client

```bash
bun run db:generate
```

### 5. 執行種子資料

```bash
bun run db:seed
```

這會建立：
- 食物分類（FoodCategory）
- 單位（Unit）
- 常見食物資料（約 50+ 種）

## 常用指令

```bash
# 打開 Prisma Studio（視覺化資料庫管理）
bun run db:studio

# 重置資料庫（⚠️ 會刪除所有資料）
bun run db:reset

# 檢查資料庫狀態
./scripts/db.sh status

# 停止資料庫
./scripts/db.sh stop

# 重啟資料庫
./scripts/db.sh restart
```

## 故障排除

### 無法連接資料庫

1. 確認 PostgreSQL 已啟動：
   ```bash
   ./scripts/db.sh status
   ```

2. 檢查 `.env` 中的 `DATABASE_URL` 是否正確

3. 確認 port 5432 沒有被佔用：
   ```bash
   lsof -i :5432
   ```

### Prisma Client 未生成

執行：
```bash
bun run db:generate
```

### 種子資料執行失敗

1. 確認資料庫已建立並執行過 migration
2. 檢查 `prisma/seed.ts` 檔案是否存在
3. 查看錯誤訊息並修正

## 生產環境部署

### Vercel

1. 在 Vercel 專案設定中加入環境變數
2. 使用 `db:migrate:deploy` 而非 `db:push`：
   ```bash
   bun run db:migrate:deploy
   ```

### 其他平台

1. 確保環境變數正確設定
2. 執行 migrations：
   ```bash
   DATABASE_URL="your-production-url" bun run db:migrate:deploy
   ```
3. 執行種子資料（僅首次）：
   ```bash
   DATABASE_URL="your-production-url" bun run db:seed
   ```

## Schema 變更流程

1. 修改 `prisma/schema.prisma`
2. 建立 migration：
   ```bash
   bun run db:migrate
   ```
3. 重新生成 Client：
   ```bash
   bun run db:generate
   ```
4. 更新種子資料（如需要）

## 備份與還原

### 備份

```bash
docker exec calorie-count-postgres pg_dump -U postgres calorie_count > backup.sql
```

### 還原

```bash
docker exec -i calorie-count-postgres psql -U postgres calorie_count < backup.sql
```

## 參考資源

- [Prisma 文件](https://www.prisma.io/docs)
- [PostgreSQL 文件](https://www.postgresql.org/docs/)
- [NextAuth.js 文件](https://next-auth.js.org)
