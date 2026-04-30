import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * 伺服器端管理員 client，使用 service role key 繞過 RLS。
 * ⚠️ 只能在 server-side（API routes / Server Components）使用，嚴禁暴露給前端。
 */
export function createAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY 未設定。\n' +
        '請至 Supabase Dashboard → Settings → API → service_role secret 複製並加入 .env.local。'
    );
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
