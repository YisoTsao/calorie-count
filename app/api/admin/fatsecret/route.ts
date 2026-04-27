import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkAdminAccess } from '@/lib/rbac';

const FS_TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';
const FS_SEARCH_URL = 'https://platform.fatsecret.com/rest/foods/search/v1';

/** In-memory token cache (process-scoped, reset on cold start) */
let tokenCache: { token: string; expiresAt: number } | null = null;

async function getFatSecretToken(): Promise<string> {
  const clientId = process.env.FATSECRET_CLIENT_ID;
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('FATSECRET_CLIENT_ID / FATSECRET_CLIENT_SECRET 未設定');
  }

  // Return cached token if still valid (60s buffer)
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(FS_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=basic',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FatSecret token error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return tokenCache.token;
}

interface FSFood {
  food_id: string;
  food_name: string;
  food_type: string;
  brand_name?: string;
  food_description: string;
}

/** Parse FatSecret food_description: "Per 100g - Calories: 52kcal | Fat: 0.17g | Carbs: 13.81g | Protein: 0.26g" */
function parseDescription(desc: string) {
  const get = (label: string) => {
    const m = desc.match(new RegExp(`${label}:\\s*([\\d.]+)`));
    return m ? Math.round(parseFloat(m[1]) * 10) / 10 : 0;
  };
  return {
    calories: get('Calories'),
    fat: get('Fat'),
    carbs: get('Carbs'),
    protein: get('Protein'),
  };
}

/** GET /api/admin/fatsecret?q=apple */
export async function GET(req: NextRequest) {
  const session = await auth();
  const deny = checkAdminAccess(session, 'EDITOR');
  if (deny) return deny;

  const q = new URL(req.url).searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ foods: [], totalResults: 0 });
  }

  let token: string;
  try {
    token = await getFatSecretToken();
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 503 });
  }

  const url = new URL(FS_SEARCH_URL);
  url.searchParams.set('search_expression', q);
  url.searchParams.set('format', 'json');
  url.searchParams.set('max_results', '25');
  url.searchParams.set('page_number', '0');
  // NOTE: region / language / include_food_images are Premier Exclusive for v1 — omit them

  let raw: unknown;
  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 },
    });
    const text = await res.text();
    if (!res.ok) {
      console.error('[FatSecret] HTTP', res.status, text);
      return NextResponse.json({ error: `FatSecret API error: ${res.status}` }, { status: 502 });
    }
    try {
      raw = JSON.parse(text);
    } catch {
      console.error('[FatSecret] Non-JSON response:', text.slice(0, 500));
      return NextResponse.json(
        { error: 'FatSecret 回傳非 JSON', detail: text.slice(0, 200) },
        { status: 502 }
      );
    }
  } catch (err) {
    return NextResponse.json({ error: '無法連線 FatSecret API' }, { status: 502 });
  }

  const data = raw as {
    foods?: { food?: FSFood | FSFood[]; total_results?: string };
    error?: { code: number; message: string };
  };

  // FatSecret returns HTTP 200 even for errors (e.g. IP whitelist) — surface them
  if (data.error) {
    console.error('[FatSecret] API error body:', data.error);
    return NextResponse.json(
      { error: `FatSecret 錯誤 (code ${data.error.code}): ${data.error.message}` },
      { status: 502 }
    );
  }

  const foodsRaw: FSFood[] = data?.foods?.food ? ([] as FSFood[]).concat(data.foods.food) : [];
  const totalResults: number = parseInt(data?.foods?.total_results ?? '0', 10);

  const foods = foodsRaw.map((f) => {
    const nutrition = parseDescription(f.food_description ?? '');
    return {
      foodId: f.food_id,
      name: f.food_name,
      brandName: f.brand_name ?? null,
      foodType: f.food_type ?? null,
      description: f.food_description ?? null,
      ...nutrition,
    };
  });

  return NextResponse.json({ foods, totalResults });
}
