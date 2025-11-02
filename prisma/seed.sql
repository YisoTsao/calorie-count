-- 清除現有資料
DELETE FROM user_favorite_foods;
DELETE FROM foods;
DELETE FROM brands;
DELETE FROM food_categories;

-- 插入食物分類
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

SELECT '✅ 種子資料插入完成！' as status;
SELECT COUNT(*) as "分類數量" FROM food_categories;
SELECT COUNT(*) as "食物數量" FROM foods;
