import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch'; // Vercel에서 Node 18+이면 생략 가능

export const config = {
  schedule: '*/5 * * * *', // 매 5분마다 실행 (UTC 기준)
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const INTERVALS = [1, 5, 15, 60];

export default async function handler(request, context) {
  try {
    const pair = 'DOGUSD';

    for (const interval of INTERVALS) {
      const res = await fetch(`https://api.kraken.com/0/public/OHLC?pair=${pair}&interval=${interval}`);
      const data = await res.json();

      const key = Object.keys(data.result).find(k => k !== 'last');
      const ohlc = data.result[key];

      const formatted = ohlc.map(([ts, , , , close]) => ({
        ts: new Date(ts * 1000).toISOString(), // ISO format
        close: parseFloat(close),
        interval: interval.toString(),
      }));

      const { error } = await supabase
        .from('price_candles')
        .upsert(formatted, { onConflict: ['ts', 'interval'] });

      if (error) throw error;
    }

    return new Response(`✅ Success: Data fetched and inserted`, { status: 200 });
  } catch (err) {
    return new Response(`❌ Error: ${err.message}`, { status: 500 });
  }
}
