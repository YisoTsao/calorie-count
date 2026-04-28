/**
 * Seed Japanese names for system foods and categories
 * Run: bun run prisma/seed-ja.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoryJaNames: Record<string, string> = {
  蔬菜類: '野菜類',
  水果類: '果物類',
  肉類: '肉類',
  海鮮類: '海鮮類',
  蛋奶類: '卵・乳製品',
  五穀雜糧: '穀物類',
  豆類: '豆類',
  堅果類: 'ナッツ類',
  飲料: '飲み物',
  零食點心: 'お菓子・スナック',
  調味料: '調味料',
  速食: 'ファストフード',
};

const foodJaNames: Record<string, string> = {
  // 肉類
  雞胸肉: '鶏むね肉',
  豬里肌肉: '豚ヒレ肉',
  牛肉: '牛肉',
  // 海鮮類
  鮭魚: 'サーモン',
  鱈魚: 'タラ',
  蝦子: 'エビ',
  // 蛋奶類
  雞蛋: '卵',
  牛奶: '牛乳',
  希臘優格: 'ギリシャヨーグルト',
  // 蔬菜類
  花椰菜: 'ブロッコリー',
  菠菜: 'ほうれん草',
  番茄: 'トマト',
  小黃瓜: 'きゅうり',
  高麗菜: 'キャベツ',
  // 水果類
  香蕉: 'バナナ',
  蘋果: 'りんご',
  芭樂: 'グアバ',
  草莓: 'いちご',
  // 五穀雜糧
  白飯: '白米ご飯',
  糙米飯: '玄米ご飯',
  全麥麵包: '全粒粉パン',
  燕麥: 'オートミール',
  地瓜: 'さつまいも',
  // 豆類
  豆腐: '豆腐',
  毛豆: '枝豆',
  黑豆: '黒豆',
  // 堅果類
  杏仁: 'アーモンド',
  核桃: 'くるみ',
  花生醬: 'ピーナッツバター',
  // 飲料
  黑咖啡: 'ブラックコーヒー',
  綠茶: '緑茶',
  豆漿: '豆乳',
  柳橙汁: 'オレンジジュース',
};

async function main() {
  console.log('🌸 Seeding Japanese names...');

  // Test connection first
  try {
    const catCount = await prisma.foodCategory.count();
    const foodCount = await prisma.food.count();
    console.log(`Connected. Categories: ${catCount}, Foods: ${foodCount}`);
  } catch (e) {
    console.error('DB connection failed:', e);
    process.exit(1);
  }

  // Update categories in one batch
  const catUpdates = Object.entries(categoryJaNames).map(([name, nameJa]) =>
    prisma.foodCategory.updateMany({ where: { name }, data: { nameJa } })
  );
  const catResults = await Promise.all(catUpdates);
  const catTotal = catResults.reduce((s, r) => s + r.count, 0);
  console.log(`✓ Updated ${catTotal} categories`);

  // Update foods in one batch (without source filter for safety)
  const foodUpdates = Object.entries(foodJaNames).map(([name, nameJa]) =>
    prisma.food.updateMany({ where: { name }, data: { nameJa } })
  );
  const foodResults = await Promise.all(foodUpdates);
  const foodTotal = foodResults.reduce((s, r) => s + r.count, 0);
  console.log(`✓ Updated ${foodTotal} foods`);

  console.log('\n✅ Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
