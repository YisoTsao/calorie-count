#!/bin/bash

# Docker PostgreSQL 管理腳本

CONTAINER_NAME="calorie-count-postgres"

case "$1" in
  start)
    echo "🚀 啟動 PostgreSQL 容器..."
    docker start $CONTAINER_NAME || docker run -d \
      --name $CONTAINER_NAME \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_DB=calorie_count \
      -p 5432:5432 \
      postgres:16-alpine
    echo "✅ PostgreSQL 已啟動在 localhost:5432"
    ;;
    
  stop)
    echo "🛑 停止 PostgreSQL 容器..."
    docker stop $CONTAINER_NAME
    echo "✅ PostgreSQL 已停止"
    ;;
    
  restart)
    echo "🔄 重啟 PostgreSQL 容器..."
    docker restart $CONTAINER_NAME
    echo "✅ PostgreSQL 已重啟"
    ;;
    
  status)
    echo "📊 PostgreSQL 容器狀態:"
    docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    ;;
    
  logs)
    echo "📝 PostgreSQL 日誌:"
    docker logs -f $CONTAINER_NAME
    ;;
    
  psql)
    echo "🔌 連接到 PostgreSQL..."
    docker exec -it $CONTAINER_NAME psql -U postgres -d calorie_count
    ;;
    
  clean)
    echo "🗑️  清除 PostgreSQL 容器和資料..."
    docker stop $CONTAINER_NAME 2>/dev/null
    docker rm $CONTAINER_NAME 2>/dev/null
    echo "✅ 已清除"
    ;;
    
  *)
    echo "使用方式: $0 {start|stop|restart|status|logs|psql|clean}"
    echo ""
    echo "指令說明:"
    echo "  start   - 啟動 PostgreSQL 容器"
    echo "  stop    - 停止 PostgreSQL 容器"
    echo "  restart - 重啟 PostgreSQL 容器"
    echo "  status  - 檢查容器狀態"
    echo "  logs    - 查看容器日誌"
    echo "  psql    - 連接到資料庫 (互動式)"
    echo "  clean   - 清除容器和資料"
    exit 1
    ;;
esac
