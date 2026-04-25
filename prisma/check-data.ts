import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 檢查資料庫資料...\n');

  const categoryCount = await prisma.foodCategory.count();
  const foodCount = await prisma.food.count();

  console.log(`✅ 食物分類數量: ${categoryCount}`);
  console.log(`✅ 食物數量: ${foodCount}\n`);

  if (categoryCount > 0) {
    const categories = await prisma.foodCategory.findMany({
      select: { name: true, icon: true },
    });
    console.log('📁 分類列表:');
    categories.forEach((cat) => {
      console.log(`  ${cat.icon} ${cat.name}`);
    });
  }

  if (foodCount > 0) {
    console.log('\n🍽️  部分食物範例:');
    const foods = await prisma.food.findMany({
      take: 5,
      select: { name: true, calories: true, protein: true },
    });
    foods.forEach((food) => {
      console.log(`  • ${food.name}: ${food.calories} kcal, 蛋白質 ${food.protein}g`);
    });
  }

  if (categoryCount === 0 || foodCount === 0) {
    console.log('\n⚠️  資料庫為空,需要執行種子腳本!');
    console.log('請執行: bun run db:seed');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
