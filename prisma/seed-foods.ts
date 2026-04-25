import { PrismaClient, FoodSource } from '@prisma/client';

const prisma = new PrismaClient();

// 食物分類資料
const categories = [
  { name: '蔬菜類', nameEn: 'Vegetables', icon: '🥬', order: 1 },
  { name: '水果類', nameEn: 'Fruits', icon: '🍎', order: 2 },
  { name: '肉類', nameEn: 'Meat', icon: '🍖', order: 3 },
  { name: '海鮮類', nameEn: 'Seafood', icon: '🐟', order: 4 },
  { name: '蛋奶類', nameEn: 'Dairy & Eggs', icon: '🥚', order: 5 },
  { name: '五穀雜糧', nameEn: 'Grains', icon: '🌾', order: 6 },
  { name: '豆類', nameEn: 'Legumes', icon: '🫘', order: 7 },
  { name: '堅果類', nameEn: 'Nuts & Seeds', icon: '🥜', order: 8 },
  { name: '飲料', nameEn: 'Beverages', icon: '🥤', order: 9 },
  { name: '零食點心', nameEn: 'Snacks', icon: '🍪', order: 10 },
  { name: '調味料', nameEn: 'Condiments', icon: '🧂', order: 11 },
  { name: '速食', nameEn: 'Fast Food', icon: '🍔', order: 12 },
];

// 常見食物資料 (每 100g 的營養素)
const foods = [
  // 肉類
  {
    name: '雞胸肉',
    nameEn: 'Chicken Breast',
    category: '肉類',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    servingSize: 100,
    servingUnit: '克',
  },
  {
    name: '豬里肌肉',
    nameEn: 'Pork Tenderloin',
    category: '肉類',
    calories: 143,
    protein: 26,
    carbs: 0,
    fat: 3.5,
    fiber: 0,
    servingSize: 100,
    servingUnit: '克',
  },
  {
    name: '牛肉',
    nameEn: 'Beef',
    category: '肉類',
    calories: 250,
    protein: 26,
    carbs: 0,
    fat: 17,
    fiber: 0,
    servingSize: 100,
    servingUnit: '克',
  },

  // 海鮮類
  {
    name: '鮭魚',
    nameEn: 'Salmon',
    category: '海鮮類',
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    fiber: 0,
    servingSize: 100,
    servingUnit: '克',
  },
  {
    name: '鱈魚',
    nameEn: 'Cod',
    category: '海鮮類',
    calories: 82,
    protein: 18,
    carbs: 0,
    fat: 0.7,
    fiber: 0,
    servingSize: 100,
    servingUnit: '克',
  },
  {
    name: '蝦子',
    nameEn: 'Shrimp',
    category: '海鮮類',
    calories: 99,
    protein: 24,
    carbs: 0.2,
    fat: 0.3,
    fiber: 0,
    servingSize: 100,
    servingUnit: '克',
  },

  // 蛋奶類
  {
    name: '雞蛋',
    nameEn: 'Egg',
    category: '蛋奶類',
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    fiber: 0,
    servingSize: 50,
    servingUnit: '個',
  },
  {
    name: '牛奶',
    nameEn: 'Milk',
    category: '蛋奶類',
    calories: 61,
    protein: 3.2,
    carbs: 4.8,
    fat: 3.3,
    fiber: 0,
    servingSize: 240,
    servingUnit: '毫升',
  },
  {
    name: '希臘優格',
    nameEn: 'Greek Yogurt',
    category: '蛋奶類',
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    fiber: 0,
    servingSize: 100,
    servingUnit: '克',
  },

  // 蔬菜類
  {
    name: '花椰菜',
    nameEn: 'Broccoli',
    category: '蔬菜類',
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6,
    servingSize: 100,
    servingUnit: '克',
  },
  {
    name: '菠菜',
    nameEn: 'Spinach',
    category: '蔬菜類',
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    servingSize: 100,
    servingUnit: '克',
  },
  {
    name: '番茄',
    nameEn: 'Tomato',
    category: '蔬菜類',
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    fiber: 1.2,
    sugar: 2.6,
    servingSize: 100,
    servingUnit: '克',
  },
  {
    name: '小黃瓜',
    nameEn: 'Cucumber',
    category: '蔬菜類',
    calories: 15,
    protein: 0.7,
    carbs: 3.6,
    fat: 0.1,
    fiber: 0.5,
    servingSize: 100,
    servingUnit: '克',
  },
  {
    name: '高麗菜',
    nameEn: 'Cabbage',
    category: '蔬菜類',
    calories: 25,
    protein: 1.3,
    carbs: 5.8,
    fat: 0.1,
    fiber: 2.5,
    servingSize: 100,
    servingUnit: '克',
  },

  // 水果類
  {
    name: '香蕉',
    nameEn: 'Banana',
    category: '水果類',
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    fiber: 2.6,
    sugar: 12,
    servingSize: 100,
    servingUnit: '克',
  },
  {
    name: '蘋果',
    nameEn: 'Apple',
    category: '水果類',
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    fiber: 2.4,
    sugar: 10,
    servingSize: 100,
    servingUnit: '克',
  },
  {
    name: '芭樂',
    nameEn: 'Guava',
    category: '水果類',
    calories: 68,
    protein: 2.6,
    carbs: 14,
    fat: 1,
    fiber: 5.4,
    sugar: 9,
    servingSize: 100,
    servingUnit: '克',
  },
  {
    name: '草莓',
    nameEn: 'Strawberry',
    category: '水果類',
    calories: 32,
    protein: 0.7,
    carbs: 7.7,
    fat: 0.3,
    fiber: 2,
    sugar: 4.9,
    servingSize: 100,
    servingUnit: '克',
  },

  // 五穀雜糧
  {
    name: '白飯',
    nameEn: 'White Rice',
    category: '五穀雜糧',
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    fiber: 0.4,
    servingSize: 100,
    servingUnit: '克',
  },
  {
    name: '糙米飯',
    nameEn: 'Brown Rice',
    category: '五穀雜糧',
    calories: 111,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    fiber: 1.8,
    servingSize: 100,
    servingUnit: '克',
  },
  {
    name: '全麥麵包',
    nameEn: 'Whole Wheat Bread',
    category: '五穀雜糧',
    calories: 247,
    protein: 13,
    carbs: 41,
    fat: 4.2,
    fiber: 7,
    servingSize: 100,
    servingUnit: '克',
  },
  {
    name: '燕麥',
    nameEn: 'Oatmeal',
    category: '五穀雜糧',
    calories: 389,
    protein: 17,
    carbs: 66,
    fat: 7,
    fiber: 11,
    servingSize: 100,
    servingUnit: '克',
  },
  {
    name: '地瓜',
    nameEn: 'Sweet Potato',
    category: '五穀雜糧',
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    fiber: 3,
    sugar: 4.2,
    servingSize: 100,
    servingUnit: '克',
  },

  // 豆類
  {
    name: '豆腐',
    nameEn: 'Tofu',
    category: '豆類',
    calories: 76,
    protein: 8,
    carbs: 1.9,
    fat: 4.8,
    fiber: 0.3,
    servingSize: 100,
    servingUnit: '克',
  },
  {
    name: '毛豆',
    nameEn: 'Edamame',
    category: '豆類',
    calories: 122,
    protein: 11,
    carbs: 10,
    fat: 5,
    fiber: 5,
    servingSize: 100,
    servingUnit: '克',
  },
  {
    name: '黑豆',
    nameEn: 'Black Beans',
    category: '豆類',
    calories: 132,
    protein: 8.9,
    carbs: 24,
    fat: 0.5,
    fiber: 7.5,
    servingSize: 100,
    servingUnit: '克',
  },

  // 堅果類
  {
    name: '杏仁',
    nameEn: 'Almonds',
    category: '堅果類',
    calories: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
    fiber: 12,
    servingSize: 28,
    servingUnit: '克',
  },
  {
    name: '核桃',
    nameEn: 'Walnuts',
    category: '堅果類',
    calories: 654,
    protein: 15,
    carbs: 14,
    fat: 65,
    fiber: 7,
    servingSize: 28,
    servingUnit: '克',
  },
  {
    name: '花生醬',
    nameEn: 'Peanut Butter',
    category: '堅果類',
    calories: 588,
    protein: 25,
    carbs: 20,
    fat: 50,
    fiber: 6,
    servingSize: 32,
    servingUnit: '克',
  },

  // 飲料
  {
    name: '黑咖啡',
    nameEn: 'Black Coffee',
    category: '飲料',
    calories: 2,
    protein: 0.3,
    carbs: 0,
    fat: 0,
    fiber: 0,
    servingSize: 240,
    servingUnit: '毫升',
  },
  {
    name: '綠茶',
    nameEn: 'Green Tea',
    category: '飲料',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    servingSize: 240,
    servingUnit: '毫升',
  },
  {
    name: '豆漿',
    nameEn: 'Soy Milk',
    category: '飲料',
    calories: 54,
    protein: 3.3,
    carbs: 6,
    fat: 1.8,
    fiber: 0.6,
    servingSize: 240,
    servingUnit: '毫升',
  },
  {
    name: '柳橙汁',
    nameEn: 'Orange Juice',
    category: '飲料',
    calories: 45,
    protein: 0.7,
    carbs: 10.4,
    fat: 0.2,
    fiber: 0.2,
    sugar: 8.4,
    servingSize: 240,
    servingUnit: '毫升',
  },
];

async function main() {
  console.log('🌱 開始種子資料植入...');

  try {
    // 清除現有資料 (開發環境)
    if (process.env.NODE_ENV !== 'production') {
      console.log('清除現有食物資料...');
      console.log('  - 刪除使用者最愛...');
      await prisma.userFavoriteFood.deleteMany({});
      console.log('  - 刪除食物資料...');
      await prisma.food.deleteMany({});
      console.log('  - 刪除品牌資料...');
      await prisma.brand.deleteMany({});
      console.log('  - 刪除分類資料...');
      await prisma.foodCategory.deleteMany({});
      console.log('✅ 清除完成！');
    }

    // 1. 建立分類
    console.log('建立食物分類...');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdCategories: Record<string, any> = {};

    for (const category of categories) {
      const created = await prisma.foodCategory.create({
        data: category,
      });
      createdCategories[category.name] = created;
      console.log(`✓ 建立分類: ${category.name}`);
    }

    // 2. 建立食物
    console.log('\n建立食物資料...');
    let foodCount = 0;

    for (const food of foods) {
      const categoryId = createdCategories[food.category]?.id;

      if (!categoryId) {
        console.warn(`⚠️ 找不到分類: ${food.category}`);
        continue;
      }

      await prisma.food.create({
        data: {
          name: food.name,
          nameEn: food.nameEn,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber || null,
          sugar: food.sugar || null,
          servingSize: food.servingSize,
          servingUnit: food.servingUnit,
          categoryId: categoryId,
          source: FoodSource.SYSTEM,
          isVerified: true,
        },
      });

      foodCount++;
      console.log(`✓ 建立食物: ${food.name}`);
    }

    console.log(`\n✅ 種子資料植入完成！`);
    console.log(`📊 統計:`);
    console.log(`   - 分類: ${categories.length} 個`);
    console.log(`   - 食物: ${foodCount} 個`);
  } catch (error) {
    console.error('❌ 種子資料植入失敗:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
