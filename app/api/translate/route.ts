export const runtime = 'edge';
export const dynamic = 'force-dynamic';
import { getSupabase } from '@/lib/supabaseEdge';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await getSupabase();
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag') || undefined;
  const kol = searchParams.get('kol') || undefined;
  const parsedLimit = Number.parseInt(searchParams.get('limit') || '10', 10) || 10;
  const parsedOffset = Number.parseInt(searchParams.get('offset') || '0', 10) || 0;

  // 기본 SELECT with join
  let query = supabase
    .from('translate')
    .select(
      `*, tags:tags(*), prices:prices(*)`
    );

  if (tag) query = query.eq('tags.name', tag);
  if (kol) query = query.eq('kol', kol);

  // 페이지네이션
  query = query.range(parsedOffset, parsedOffset + parsedLimit - 1);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
