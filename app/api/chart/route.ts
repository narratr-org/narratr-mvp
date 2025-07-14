export const runtime = 'edge';
export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * GET /api/chart?from=1700000000&to=1710000000
 */
export async function GET(request: Request) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  try {
    const { searchParams } = new URL(request.url);
    const from = parseInt(searchParams.get('from') ?? '', 10);
    const to = parseInt(searchParams.get('to') ?? '', 10);

    if (Number.isNaN(from) || Number.isNaN(to)) {
      return NextResponse.json({ error: 'Invalid timestamp format' }, { status: 400 });
    }

    // Unix timestamp → ISO 8601로 변환
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
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
