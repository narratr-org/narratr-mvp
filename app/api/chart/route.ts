export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );
  try {
    const { searchParams } = new URL(request.url);
    const from = parseInt(searchParams.get('from') || '', 10);
    const to = parseInt(searchParams.get('to') || '', 10);

    if (isNaN(from) || isNaN(to)) {
      return NextResponse.json({ error: 'Invalid timestamp format' }, { status: 400 });
    }

    const fromISO = new Date(from * 1000).toISOString();
    const toISO = new Date(to * 1000).toISOString();

    const { data, error } = await supabase
      .from('price_candles')
      .select('*')
      .gte('ts', fromISO)
      .lte('ts', toISO)
      .order('ts', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
