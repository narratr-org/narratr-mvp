import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch'; // Node 18+ 환경이면 생략해도 됨

// 크론 스케줄: 매 5분마다 실행 (UTC 기준)
export const config = {
  schedule: '*/5 * * * *',
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const INTERVALS = [1, 5, 15, 60];

export default async function handler(request, context) {
  console.log(`🚀 [CRON] Job started at ${new Date().toISOString()}`);

  try {
    const pair = 'DOGUSD';

    for (const interval of INTERVALS) {
      console.log(`📊 Fetching OHLC for interval: ${interval}min`);

      const res = await fetch(`https://api.kraken.com/0/public/OHLC?pair=${pair}&interval=${interval}`);
      const data = await res.json();

      const key = Object.keys(data.result).find(k => k !== 'last');
      const ohlc = data.result[key];

      const formatted = ohlc.map(([ts, , , , close]) => ({
        ts: new Date(ts * 1000).toISOString(), // UTC ISO timestamp
        close: parseFloat(close),
        interval: interval.toString(),
      }));

      const { error } = await supabase
        .from('price_candles')
        .upsert(formatted, { onConflict: ['ts', 'interval'] });

      if (error) {
        console.error(`❌ Supabase insert error (interval ${interval}):`, error.message);
        throw error;
      }

      console.log(`✅ Upserted ${formatted.length} rows for interval ${interval}`);
    }

    console.log('🎉 Cron job completed successfully');
    return new Response(`✅ Success: Data fetched and inserted`, { status: 200 });

  } catch (err) {
    console.error("🔥 Cron job failed:", err.message);
    return new Response(`❌ Error: ${err.message}`, { status: 500 });
  }
}
