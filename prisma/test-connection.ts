import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function test() {
  console.log('🔍 測試 Prisma 連線...');

  try {
    // 測試連線
    await prisma.$connect();
    console.log('✅ Prisma 連線成功！');

    // 測試查詢
    console.log('📊 測試查詢 User 表...');
    const userCount = await prisma.user.count();
    console.log(`   用戶數量: ${userCount}`);

    // 測試查詢 FoodCategory 表
    console.log('📊 測試查詢 FoodCategory 表...');
    const categoryCount = await prisma.foodCategory.count();
    console.log(`   分類數量: ${categoryCount}`);

    // 測試刪除操作
    console.log('🗑️  測試刪除 UserFavoriteFood...');
    const deleteResult = await prisma.userFavoriteFood.deleteMany({});
    console.log(`   刪除了 ${deleteResult.count} 筆資料`);

    console.log('\n✅ 所有測試通過！');
  } catch (error) {
    console.error('❌ 測試失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

test();
