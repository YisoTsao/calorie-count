import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/rbac';

/**
 * POST /api/admin/seed-ja
 * One-time endpoint to seed Japanese names for system food categories and foods.
 * Requires ADMIN role.
 */
export async function POST(_req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'ADMIN');
  if (deny) return deny;

  const categoryUpdates = [
    { id: 1, nameJa: '穀物・パン' },
    { id: 2, nameJa: '肉類' },
    { id: 3, nameJa: '魚介類' },
    { id: 4, nameJa: '野菜' },
    { id: 5, nameJa: '果物' },
    { id: 6, nameJa: '乳製品' },
    { id: 7, nameJa: '豆腐・大豆製品' },
    { id: 8, nameJa: '油脂・調味料' },
    { id: 9, nameJa: '飲み物' },
    { id: 10, nameJa: 'スナック・菓子' },
    { id: 11, nameJa: '加工食品' },
    { id: 12, nameJa: 'ファストフード' },
  ];

  const foodUpdates = [
    { name: '白飯', nameJa: '白米ご飯' },
    { name: '糙米飯', nameJa: '玄米ご飯' },
    { name: '全麥麵包', nameJa: '全粒粉パン' },
    { name: '白麵包', nameJa: '食パン' },
    { name: '燕麥片', nameJa: 'オートミール' },
    { name: '雞胸肉', nameJa: '鶏むね肉' },
    { name: '豬里肌', nameJa: '豚ヒレ肉' },
    { name: '牛肉(瘦)', nameJa: '牛肉（赤身）' },
    { name: '雞蛋', nameJa: '卵' },
    { name: '鮭魚', nameJa: 'サーモン' },
    { name: '鮪魚罐頭', nameJa: 'ツナ缶' },
    { name: '蝦仁', nameJa: 'えび' },
    { name: '花椰菜', nameJa: 'ブロッコリー' },
    { name: '菠菜', nameJa: 'ほうれん草' },
    { name: '胡蘿蔔', nameJa: 'にんじん' },
    { name: '番茄', nameJa: 'トマト' },
    { name: '小黃瓜', nameJa: 'きゅうり' },
    { name: '蘋果', nameJa: 'りんご' },
    { name: '香蕉', nameJa: 'バナナ' },
    { name: '橘子', nameJa: 'みかん' },
    { name: '牛奶(全脂)', nameJa: '牛乳（全脂）' },
    { name: '無糖優格', nameJa: '無糖ヨーグルト' },
    { name: '雞蛋豆腐', nameJa: '卵豆腐' },
    { name: '嫩豆腐', nameJa: '絹豆腐' },
    { name: '橄欖油', nameJa: 'オリーブオイル' },
    { name: '花生醬', nameJa: 'ピーナッツバター' },
    { name: '無糖綠茶', nameJa: '無糖緑茶' },
    { name: '黑咖啡', nameJa: 'ブラックコーヒー' },
    { name: '洋芋片', nameJa: 'ポテトチップス' },
    { name: '黑巧克力', nameJa: 'ダークチョコレート' },
    { name: '泡麵', nameJa: 'インスタントラーメン' },
    { name: '漢堡', nameJa: 'ハンバーガー' },
    { name: '薯條', nameJa: 'フライドポテト' },
  ];

  let categoriesUpdated = 0;
  let foodsUpdated = 0;

  for (const c of categoryUpdates) {
    try {
      await prisma.foodCategory.updateMany({
        where: { id: { equals: c.id } as never },
        data: { nameJa: c.nameJa },
      });
      categoriesUpdated++;
    } catch {
      // skip if category doesn't exist
    }
  }

  for (const f of foodUpdates) {
    try {
      const updated = await prisma.food.updateMany({
        where: { name: f.name, source: 'SYSTEM' },
        data: { nameJa: f.nameJa },
      });
      foodsUpdated += updated.count;
    } catch {
      // skip
    }
  }

  return NextResponse.json({ success: true, categoriesUpdated, foodsUpdated });
}
