export const runtime = 'edge';
export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
const INTERVALS = [1, 5, 15, 60];

export async function GET(request: Request) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
  console.log(`🚀 [CRON] Job started at ${new Date().toISOString()}`);

  try {
    const pair = 'DOGUSD';

    for (const interval of INTERVALS) {
      console.log(`📊 Fetching OHLC for interval: ${interval}min`);

      const res = await fetch(`https://api.kraken.com/0/public/OHLC?pair=${pair}&interval=${interval}`);
      const data = await res.json();

      const key = Object.keys(data.result).find(k => k !== 'last') as string;
      const ohlc = data.result[key];

      const formatted = (ohlc as any[]).map(([ts, , , , close]) => ({
        ts: new Date(ts * 1000).toISOString(), // UTC ISO timestamp
        close: parseFloat(close),
        interval: interval.toString(),
      }));

      const { error } = await supabase
        .from('price_candles')
        .upsert(formatted as any, { onConflict: 'ts,interval' });

      if (error) {
        console.error(`❌ Supabase insert error (interval ${interval}):`, error.message);
        throw error;
      }

      console.log(`✅ Upserted ${formatted.length} rows for interval ${interval}`);
    }

    console.log('🎉 Cron job completed successfully');
    return NextResponse.json({ message: 'Success: Data fetched and inserted' });

  } catch (err) {
    const message = (err as Error).message;
    console.error('🔥 Cron job failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
