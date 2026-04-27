import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkAdminAccess } from '@/lib/rbac';

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

/** Key nutrient IDs from USDA FoodData Central */
const NUTRIENT_IDS = {
  calories: 1008, // Energy (kcal)
  protein: 1003, // Protein (g)
  carbs: 1005, // Carbohydrate, by difference (g)
  fat: 1004, // Total lipid (fat) (g)
  fiber: 1079, // Fiber, total dietary (g)
  sugar: 2000, // Sugars, total including NLEA (g)
  sodium: 1093, // Sodium (mg)
} as const;

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function extractNutrient(
  nutrients: Array<{ nutrientId: number; value?: number }>,
  id: number
): number {
  return round1(nutrients.find((n) => n.nutrientId === id)?.value ?? 0);
}

/** GET /api/admin/usda?q=apple — search USDA FoodData Central */
export async function GET(req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'EDITOR');
  if (deny) return deny;

  const q = new URL(req.url).searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ foods: [], totalHits: 0 });
  }

  const apiKey = process.env.USDA_API_KEY ?? 'DEMO_KEY';
  const url = new URL(`${USDA_BASE}/foods/search`);
  url.searchParams.set('query', q);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('pageSize', '25');
  // Foundation + SR Legacy = well-structured nutrient data
  url.searchParams.set('dataType', 'Foundation,SR Legacy');

  let raw;
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ error: `USDA API error: ${res.status}` }, { status: 502 });
    }
    raw = await res.json();
  } catch (err) {
    console.error('[USDA API]', err);
    return NextResponse.json({ error: '無法連線 USDA API' }, { status: 502 });
  }

  // Normalize into a leaner shape
  const foods = (raw.foods ?? []).map(
    (f: {
      fdcId: number;
      description: string;
      brandOwner?: string;
      foodCategory?: string;
      dataType: string;
      foodNutrients: Array<{ nutrientId: number; value?: number }>;
    }) => ({
      fdcId: f.fdcId,
      description: f.description,
      brandOwner: f.brandOwner ?? null,
      foodCategory: f.foodCategory ?? null,
      dataType: f.dataType,
      calories: extractNutrient(f.foodNutrients, NUTRIENT_IDS.calories),
      protein: extractNutrient(f.foodNutrients, NUTRIENT_IDS.protein),
      carbs: extractNutrient(f.foodNutrients, NUTRIENT_IDS.carbs),
      fat: extractNutrient(f.foodNutrients, NUTRIENT_IDS.fat),
      fiber: extractNutrient(f.foodNutrients, NUTRIENT_IDS.fiber) || null,
      sugar: extractNutrient(f.foodNutrients, NUTRIENT_IDS.sugar) || null,
      sodium: extractNutrient(f.foodNutrients, NUTRIENT_IDS.sodium) || null,
    })
  );

  return NextResponse.json({ foods, totalHits: raw.totalHits ?? 0 });
}
