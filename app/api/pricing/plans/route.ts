import { NextResponse } from 'next/server';

/**
 * GET /api/pricing/plans
 * 訂閱方案由後台管理，目前回傳空陣列。
 */
export function GET() {
  return NextResponse.json({ success: true, data: [] });
}
