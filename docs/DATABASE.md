# 資料庫管理指南

## 使用 Docker PostgreSQL

本專案使用 Docker 來運行 PostgreSQL 資料庫,方便開發和測試。

### 快速開始

1. **啟動資料庫**
```bash
./scripts/db.sh start
```

2. **檢查狀態**
```bash
./scripts/db.sh status
```

3. **執行資料庫遷移**
```bash
bunx prisma migrate dev
```

4. **查看資料**
```bash
./scripts/db.sh psql
```

### 其他指令

- **停止資料庫**: `./scripts/db.sh stop`
- **重啟資料庫**: `./scripts/db.sh restart`
- **查看日誌**: `./scripts/db.sh logs`
- **清除資料**: `./scripts/db.sh clean`

## 資料庫連接資訊

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/calorie_count?schema=public"
```

- **Host**: localhost
- **Port**: 5432
- **Database**: calorie_count
- **User**: postgres
- **Password**: postgres

## Prisma 常用指令

### 查看資料庫結構
```bash
bunx prisma db pull
```

### 生成 Prisma Client
```bash
bunx prisma generate
```

### 推送 schema 變更
```bash
bunx prisma db push
```

### 重置資料庫
```bash
bunx prisma migrate reset
```

### 開啟 Prisma Studio (資料庫 GUI)
```bash
bunx prisma studio
```

## 故障排除

### 資料庫無法連接
1. 確認 Docker 正在運行: `docker ps`
2. 檢查容器狀態: `./scripts/db.sh status`
3. 重啟容器: `./scripts/db.sh restart`

### 遷移失敗
1. 檢查 schema.prisma 語法
2. 查看錯誤日誌: `./scripts/db.sh logs`
3. 必要時重置資料庫: `bunx prisma migrate reset`

### 清除並重新開始
```bash
./scripts/db.sh clean
./scripts/db.sh start
bunx prisma migrate dev
```

## 生產環境

在生產環境中,建議使用託管的 PostgreSQL 服務:
- [Supabase](https://supabase.com/) (免費方案可用)
- [Neon](https://neon.tech/) (serverless PostgreSQL)
- [Railway](https://railway.app/)
- [Render](https://render.com/)

記得更新 `.env` 中的 `DATABASE_URL` 為生產環境的連接字串。
