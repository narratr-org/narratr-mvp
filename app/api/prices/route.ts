export const runtime = 'edge';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // use the lightweight ESM build
  const { createClient } = await import('@supabase/supabase-js/dist/module/index.js');
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { error: 'Missing SUPABASE_URL or SUPABASE_KEY' },
      { status: 400 }
    );
  }
  const supabase = createClient(
    url!,
    key!
  )
  try {
    // 최근 2개 캔들의 close 가격 조회
    const { data, error } = await supabase
      .from('price_candles')
      .select('ts, close')
      .order('ts', { ascending: false })
      .limit(2);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No price data' }, { status: 404 });
    }

    const current = data[0].close;
    const prev    = data[1] ? data[1].close : current;
    const change  = prev ? ((current - prev) / prev) * 100 : 0;

    // 1 분 CDN 캐시
    const headers = { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60' };
    return NextResponse.json({ price: current, change }, { headers });
  } catch (err) {
    console.error('Unexpected error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
