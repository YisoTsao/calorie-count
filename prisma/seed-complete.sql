-- 完整種子資料腳本
-- 清除現有資料
DELETE FROM user_favorite_foods;
DELETE FROM foods;
DELETE FROM brands;
DELETE FROM food_categories;

-- ========== 插入食物分類 ==========
INSERT INTO food_categories (id, name, "nameEn", icon, "order", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), '蔬菜類', 'Vegetables', '🥬', 1, NOW(), NOW()),
  (gen_random_uuid(), '水果類', 'Fruits', '🍎', 2, NOW(), NOW()),
  (gen_random_uuid(), '肉類', 'Meat', '🍖', 3, NOW(), NOW()),
  (gen_random_uuid(), '海鮮類', 'Seafood', '🐟', 4, NOW(), NOW()),
  (gen_random_uuid(), '蛋奶類', 'Dairy & Eggs', '🥚', 5, NOW(), NOW()),
  (gen_random_uuid(), '五穀雜糧', 'Grains', '🌾', 6, NOW(), NOW()),
  (gen_random_uuid(), '豆類', 'Legumes', '🫘', 7, NOW(), NOW()),
  (gen_random_uuid(), '堅果類', 'Nuts & Seeds', '🥜', 8, NOW(), NOW()),
  (gen_random_uuid(), '飲料', 'Beverages', '🥤', 9, NOW(), NOW()),
  (gen_random_uuid(), '零食點心', 'Snacks', '🍪', 10, NOW(), NOW()),
  (gen_random_uuid(), '調味料', 'Condiments', '🧂', 11, NOW(), NOW()),
  (gen_random_uuid(), '速食', 'Fast Food', '🍔', 12, NOW(), NOW());

-- ========== 插入食物(使用 CTE 來獲取分類ID) ==========

-- 肉類
WITH category AS (SELECT id FROM food_categories WHERE name = '肉類')
INSERT INTO foods (id, name, "nameEn", calories, protein, carbs, fat, fiber, "servingSize", "servingUnit", source, "isVerified", "createdAt", "updatedAt", "categoryId")
SELECT gen_random_uuid(), '雞胸肉', 'Chicken Breast', 165, 31, 0, 3.6, 0, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '豬里肌肉', 'Pork Tenderloin', 143, 26, 0, 3.5, 0, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '牛肉', 'Beef', 250, 26, 0, 15, 0, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category;

-- 海鮮類
WITH category AS (SELECT id FROM food_categories WHERE name = '海鮮類')
INSERT INTO foods (id, name, "nameEn", calories, protein, carbs, fat, fiber, "servingSize", "servingUnit", source, "isVerified", "createdAt", "updatedAt", "categoryId")
SELECT gen_random_uuid(), '鮭魚', 'Salmon', 208, 20, 0, 13, 0, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '鱈魚', 'Cod', 82, 18, 0, 0.7, 0, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '蝦子', 'Shrimp', 99, 24, 0.2, 0.3, 0, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category;

-- 蛋奶類
WITH category AS (SELECT id FROM food_categories WHERE name = '蛋奶類')
INSERT INTO foods (id, name, "nameEn", calories, protein, carbs, fat, fiber, "servingSize", "servingUnit", source, "isVerified", "createdAt", "updatedAt", "categoryId")
SELECT gen_random_uuid(), '雞蛋', 'Egg', 155, 13, 1.1, 11, 0, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '牛奶', 'Milk', 61, 3.2, 4.8, 3.3, 0, 100, '毫升', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '希臘優格', 'Greek Yogurt', 59, 10, 3.6, 0.4, 0, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category;

-- 蔬菜類
WITH category AS (SELECT id FROM food_categories WHERE name = '蔬菜類')
INSERT INTO foods (id, name, "nameEn", calories, protein, carbs, fat, fiber, "servingSize", "servingUnit", source, "isVerified", "createdAt", "updatedAt", "categoryId")
SELECT gen_random_uuid(), '花椰菜', 'Broccoli', 34, 2.8, 7, 0.4, 2.6, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '菠菜', 'Spinach', 23, 2.9, 3.6, 0.4, 2.2, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '番茄', 'Tomato', 18, 0.9, 3.9, 0.2, 1.2, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '小黃瓜', 'Cucumber', 16, 0.7, 3.6, 0.1, 0.5, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '高麗菜', 'Cabbage', 25, 1.3, 5.8, 0.1, 2.5, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category;

-- 水果類
WITH category AS (SELECT id FROM food_categories WHERE name = '水果類')
INSERT INTO foods (id, name, "nameEn", calories, protein, carbs, fat, fiber, "servingSize", "servingUnit", source, "isVerified", "createdAt", "updatedAt", "categoryId")
SELECT gen_random_uuid(), '香蕉', 'Banana', 89, 1.1, 23, 0.3, 2.6, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '蘋果', 'Apple', 52, 0.3, 14, 0.2, 2.4, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '芭樂', 'Guava', 68, 2.6, 14, 1, 5.4, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '草莓', 'Strawberry', 32, 0.7, 7.7, 0.3, 2, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category;

-- 五穀雜糧
WITH category AS (SELECT id FROM food_categories WHERE name = '五穀雜糧')
INSERT INTO foods (id, name, "nameEn", calories, protein, carbs, fat, fiber, "servingSize", "servingUnit", source, "isVerified", "createdAt", "updatedAt", "categoryId")
SELECT gen_random_uuid(), '白飯', 'White Rice', 130, 2.7, 28, 0.3, 0.4, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '糙米飯', 'Brown Rice', 111, 2.6, 23, 0.9, 1.8, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '全麥吐司', 'Whole Wheat Bread', 247, 13, 41, 3.4, 7, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '燕麥', 'Oatmeal', 389, 17, 66, 6.9, 10.6, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '地瓜', 'Sweet Potato', 86, 1.6, 20, 0.1, 3, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category;

-- 豆類
WITH category AS (SELECT id FROM food_categories WHERE name = '豆類')
INSERT INTO foods (id, name, "nameEn", calories, protein, carbs, fat, fiber, "servingSize", "servingUnit", source, "isVerified", "createdAt", "updatedAt", "categoryId")
SELECT gen_random_uuid(), '豆腐', 'Tofu', 76, 8, 1.9, 4.8, 0.3, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '毛豆', 'Edamame', 122, 11, 9, 5.2, 5, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '黑豆', 'Black Beans', 341, 21, 63, 1.4, 16, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category;

-- 堅果類
WITH category AS (SELECT id FROM food_categories WHERE name = '堅果類')
INSERT INTO foods (id, name, "nameEn", calories, protein, carbs, fat, fiber, "servingSize", "servingUnit", source, "isVerified", "createdAt", "updatedAt", "categoryId")
SELECT gen_random_uuid(), '杏仁', 'Almonds', 579, 21, 22, 50, 12.5, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '核桃', 'Walnuts', 654, 15, 14, 65, 6.7, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '花生醬', 'Peanut Butter', 588, 25, 20, 50, 6, 100, '克', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category;

-- 飲料
WITH category AS (SELECT id FROM food_categories WHERE name = '飲料')
INSERT INTO foods (id, name, "nameEn", calories, protein, carbs, fat, fiber, "servingSize", "servingUnit", source, "isVerified", "createdAt", "updatedAt", "categoryId")
SELECT gen_random_uuid(), '黑咖啡', 'Black Coffee', 2, 0.3, 0, 0, 0, 240, '毫升', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '綠茶', 'Green Tea', 1, 0.2, 0, 0, 0, 240, '毫升', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '豆漿', 'Soy Milk', 54, 3.3, 6, 1.8, 0.6, 240, '毫升', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category
UNION ALL SELECT gen_random_uuid(), '柳橙汁', 'Orange Juice', 45, 0.7, 10, 0.2, 0.2, 240, '毫升', 'SYSTEM'::"FoodSource", true, NOW(), NOW(), id FROM category;

-- 顯示結果
SELECT '✅ 種子資料插入完成！' as status;
SELECT COUNT(*) as "分類數量" FROM food_categories;
SELECT COUNT(*) as "食物數量" FROM foods;
SELECT name as "分類名稱", (SELECT COUNT(*) FROM foods WHERE "categoryId" = fc.id) as "食物數量"
FROM food_categories fc
ORDER BY "order";
