import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 開始種子資料...');

  // 1. 建立食物分類
  console.log('📁 建立食物分類...');
  const categoryData = [
    { name: '主食類', description: '米飯、麵條、麵包等主食' },
    { name: '蔬菜類', description: '各種蔬菜' },
    { name: '水果類', description: '各種水果' },
    { name: '肉類', description: '豬肉、牛肉、雞肉等' },
    { name: '海鮮類', description: '魚類、貝類、蝦蟹等' },
    { name: '豆類', description: '豆腐、豆漿、豆製品' },
    { name: '乳製品', description: '牛奶、起司、優格等' },
    { name: '油脂類', description: '食用油、堅果等' },
    { name: '飲料類', description: '飲品、湯品等' },
    { name: '其他', description: '其他食品' }
  ];

  const categories = [];
  for (const cat of categoryData) {
    const existing = await prisma.foodCategory.findFirst({
      where: { name: cat.name }
    });
    
    if (!existing) {
      const created = await prisma.foodCategory.create({
        data: cat
      });
      categories.push(created);
    } else {
      categories.push(existing);
    }
  }
  console.log(`✅ 建立了 ${categories.length} 個食物分類`);

  // 2. 建立常見食物
  console.log('🍽️  建立常見食物...');
  
  const mainCategory = categories.find(c => c.name === '主食類');
  const veggieCategory = categories.find(c => c.name === '蔬菜類');
  const fruitCategory = categories.find(c => c.name === '水果類');
  const meatCategory = categories.find(c => c.name === '肉類');
  const seaCategory = categories.find(c => c.name === '海鮮類');
  const dairyCategory = categories.find(c => c.name === '乳製品');
  const drinkCategory = categories.find(c => c.name === '飲料類');

  const foods = [
    // 主食類
    { name: '白飯', categoryId: mainCategory?.id, servingUnit: '碗', servingSize: 200, calories: 280, protein: 5.2, carbs: 62.0, fat: 0.6, fiber: 0.6 },
    { name: '糙米飯', categoryId: mainCategory?.id, servingUnit: '碗', servingSize: 200, calories: 264, protein: 5.4, carbs: 55.8, fat: 2.0, fiber: 3.4 },
    { name: '白吐司', categoryId: mainCategory?.id, servingUnit: '片', servingSize: 30, calories: 80, protein: 2.5, carbs: 15.0, fat: 1.0, fiber: 0.8 },
    { name: '全麥吐司', categoryId: mainCategory?.id, servingUnit: '片', servingSize: 30, calories: 75, protein: 3.0, carbs: 13.5, fat: 1.2, fiber: 2.0 },
    { name: '陽春麵', categoryId: mainCategory?.id, servingUnit: '碗', servingSize: 250, calories: 330, protein: 10.5, carbs: 68.0, fat: 1.5, fiber: 2.5 },
    
    // 蔬菜類
    { name: '高麗菜', categoryId: veggieCategory?.id, servingUnit: '克', servingSize: 100, calories: 25, protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.5 },
    { name: '青江菜', categoryId: veggieCategory?.id, servingUnit: '克', servingSize: 100, calories: 13, protein: 1.5, carbs: 2.2, fat: 0.2, fiber: 1.0 },
    { name: '菠菜', categoryId: veggieCategory?.id, servingUnit: '克', servingSize: 100, calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
    { name: '花椰菜', categoryId: veggieCategory?.id, servingUnit: '克', servingSize: 100, calories: 34, protein: 2.8, carbs: 7.0, fat: 0.4, fiber: 2.6 },
    { name: '番茄', categoryId: veggieCategory?.id, servingUnit: '個', servingSize: 150, calories: 27, protein: 1.3, carbs: 5.8, fat: 0.3, fiber: 1.8 },
    
    // 水果類
    { name: '蘋果', categoryId: fruitCategory?.id, servingUnit: '個', servingSize: 180, calories: 95, protein: 0.5, carbs: 25.0, fat: 0.3, fiber: 4.4 },
    { name: '香蕉', categoryId: fruitCategory?.id, servingUnit: '個', servingSize: 120, calories: 105, protein: 1.3, carbs: 27.0, fat: 0.4, fiber: 3.1 },
    { name: '柳橙', categoryId: fruitCategory?.id, servingUnit: '個', servingSize: 130, calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2, fiber: 3.1 },
    { name: '草莓', categoryId: fruitCategory?.id, servingUnit: '克', servingSize: 100, calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2.0 },
    { name: '芭樂', categoryId: fruitCategory?.id, servingUnit: '個', servingSize: 160, calories: 68, protein: 2.6, carbs: 14.4, fat: 0.9, fiber: 8.0 },
    
    // 肉類
    { name: '雞胸肉', categoryId: meatCategory?.id, servingUnit: '克', servingSize: 100, calories: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0 },
    { name: '雞腿肉', categoryId: meatCategory?.id, servingUnit: '克', servingSize: 100, calories: 211, protein: 26.0, carbs: 0, fat: 11.0, fiber: 0 },
    { name: '豬里肌', categoryId: meatCategory?.id, servingUnit: '克', servingSize: 100, calories: 143, protein: 21.0, carbs: 0, fat: 6.0, fiber: 0 },
    { name: '牛腱', categoryId: meatCategory?.id, servingUnit: '克', servingSize: 100, calories: 179, protein: 31.0, carbs: 0, fat: 6.0, fiber: 0 },
    
    // 海鮮類
    { name: '鮭魚', categoryId: seaCategory?.id, servingUnit: '克', servingSize: 100, calories: 208, protein: 20.0, carbs: 0, fat: 13.0, fiber: 0 },
    { name: '鯖魚', categoryId: seaCategory?.id, servingUnit: '克', servingSize: 100, calories: 205, protein: 19.0, carbs: 0, fat: 14.0, fiber: 0 },
    { name: '蝦仁', categoryId: seaCategory?.id, servingUnit: '克', servingSize: 100, calories: 106, protein: 20.0, carbs: 0.9, fat: 1.7, fiber: 0 },
    
    // 乳製品
    { name: '全脂牛奶', categoryId: dairyCategory?.id, servingUnit: '毫升', servingSize: 240, calories: 149, protein: 7.7, carbs: 11.7, fat: 8.0, fiber: 0 },
    { name: '低脂牛奶', categoryId: dairyCategory?.id, servingUnit: '毫升', servingSize: 240, calories: 102, protein: 8.2, carbs: 12.2, fat: 2.4, fiber: 0 },
    { name: '無糖優格', categoryId: dairyCategory?.id, servingUnit: '杯', servingSize: 150, calories: 90, protein: 9.0, carbs: 6.0, fat: 3.0, fiber: 0 },
    
    // 飲料
    { name: '無糖豆漿', categoryId: drinkCategory?.id, servingUnit: '毫升', servingSize: 240, calories: 80, protein: 7.0, carbs: 4.0, fat: 4.0, fiber: 1.2 },
    { name: '美式咖啡', categoryId: drinkCategory?.id, servingUnit: '毫升', servingSize: 360, calories: 5, protein: 0.3, carbs: 0, fat: 0, fiber: 0 },
    { name: '綠茶', categoryId: drinkCategory?.id, servingUnit: '毫升', servingSize: 360, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  ];

  for (const food of foods) {
    if (food.categoryId) {
      const existing = await prisma.food.findFirst({
        where: { name: food.name }
      });
      
      if (!existing) {
        await prisma.food.create({
          data: {
            name: food.name,
            categoryId: food.categoryId,
            servingUnit: food.servingUnit,
            servingSize: food.servingSize,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            fiber: food.fiber,
            isVerified: true,
            source: 'SYSTEM'
          }
        });
      }
    }
  }
  
  console.log(`✅ 建立了 ${foods.length} 種常見食物`);
  console.log('🎉 種子資料完成！');
}

main()
  .catch((e) => {
    console.error('❌ 種子資料失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
