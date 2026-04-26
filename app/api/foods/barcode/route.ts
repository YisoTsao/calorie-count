import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface OFFNutriments {
  'energy-kcal_100g'?: number;
  energy_100g?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
  sugars_100g?: number;
  sodium_100g?: number;
}

interface OFFProduct {
  product_name?: string;
  product_name_zh?: string;
  product_name_en?: string;
  product_name_ja?: string;
  brands?: string;
  serving_size?: string;
  quantity?: string;
  nutriments?: OFFNutriments;
  url?: string;
  code?: string;
}

function parseServingSize(raw?: string): { servingSize: number | null; servingUnit: string | null } {
  if (!raw) return { servingSize: null, servingUnit: null };
  const m = raw.match(/^([\d.]+)\s*([a-zA-Z]+)/);
  if (!m) return { servingSize: null, servingUnit: raw };
  return { servingSize: parseFloat(m[1]), servingUnit: m[2].toLowerCase() };
}

function mapOFFToFood(product: OFFProduct, barcode: string) {
  const n = product.nutriments ?? {};

  // Energy: prefer kcal directly, otherwise convert from kJ
  const calories =
    n['energy-kcal_100g'] != null
      ? Math.round(n['energy-kcal_100g'])
      : n.energy_100g != null
      ? Math.round(n.energy_100g / 4.184)
      : 0;

  const { servingSize, servingUnit } = parseServingSize(product.serving_size);

  // Name: prefer zh/local over generic
  const name =
    product.product_name_zh ||
    product.product_name ||
    product.product_name_en ||
    `條碼 ${barcode}`;

  return {
    name,
    nameEn: product.product_name_en || null,
    nameJa: product.product_name_ja || null,
    calories,
    protein: Math.round((n.proteins_100g ?? 0) * 10) / 10,
    carbs: Math.round((n.carbohydrates_100g ?? 0) * 10) / 10,
    fat: Math.round((n.fat_100g ?? 0) * 10) / 10,
    fiber: n.fiber_100g != null ? Math.round(n.fiber_100g * 10) / 10 : null,
    sugar: n.sugars_100g != null ? Math.round(n.sugars_100g * 10) / 10 : null,
    // OFoFacts sodium is in g/100g — convert to mg
    sodium: n.sodium_100g != null ? Math.round(n.sodium_100g * 1000 * 10) / 10 : null,
    servingSize,
    servingUnit,
    source: 'API' as const,
    barcode,
    openFoodFactsId: product.code ?? barcode,
    openFoodFactsUrl: product.url ?? `https://world.openfoodfacts.org/product/${barcode}`,
  };
}

const FOOD_SELECT = {
  id: true, name: true, nameEn: true,
  calories: true, protein: true, carbs: true, fat: true,
  fiber: true, sugar: true, sodium: true,
  servingSize: true, servingUnit: true,
  barcode: true, openFoodFactsUrl: true,
} as const;

/** GET /api/foods/barcode?barcode=4902102081399 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登入' }, { status: 401 });
  }

  const barcode = new URL(req.url).searchParams.get('barcode')?.trim() ?? '';

  // Validate: 8–14 digits
  if (!/^\d{8,14}$/.test(barcode)) {
    return NextResponse.json({ error: '無效條碼格式（需 8–14 位數字）' }, { status: 400 });
  }

  // 1. Local cache lookup
  try {
    const cached = await prisma.food.findUnique({
      where: { barcode },
      select: FOOD_SELECT,
    });
    if (cached) {
      return NextResponse.json({ food: cached, cached: true });
    }
  } catch (err) {
    // DB cache miss is non-fatal — continue to Open Food Facts
    console.error('[Barcode] DB cache lookup error:', err);
  }

  // 2. Open Food Facts API
  let product: OFFProduct;
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,product_name_zh,product_name_en,product_name_ja,brands,serving_size,quantity,nutriments,url,code`,
      {
        headers: { 'User-Agent': 'CalorieCountApp/1.0 (contact@example.com)' },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) {
      return NextResponse.json({ error: `Open Food Facts 回傳錯誤 ${res.status}` }, { status: 502 });
    }
    const data = (await res.json()) as { status: number; product?: OFFProduct };
    if (data.status !== 1 || !data.product) {
      return NextResponse.json(
        { error: '此條碼在 Open Food Facts 資料庫中找不到，台灣在地商品建議手動新增' },
        { status: 404 }
      );
    }
    product = data.product;
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      return NextResponse.json({ error: '查詢逾時，請稍後再試' }, { status: 504 });
    }
    console.error('[Barcode] OFoFacts fetch error:', err);
    return NextResponse.json({ error: '無法連線 Open Food Facts' }, { status: 502 });
  }

  // 3. Save to DB and return
  const foodData = mapOFFToFood(product, barcode);
  try {
    const food = await prisma.food.upsert({
      where: { barcode },
      create: foodData,
      update: foodData,
      select: FOOD_SELECT,
    });
    return NextResponse.json({ food, cached: false });
  } catch (err) {
    // DB write failed — still return the data we fetched from OFoFacts
    console.error('[Barcode] DB upsert error:', err);
    return NextResponse.json({ food: { ...foodData, id: '' }, cached: false });
  }
}
