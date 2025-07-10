import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  try {
    // 최근 2개 캔들의 close 가격 조회
    const { data, error } = await supabase
      .from('price_candles')
      .select('ts, close')
      .order('ts', { ascending: false })
      .limit(2);

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No price data' });
    }

    const current = data[0].close;
    const prev    = data[1] ? data[1].close : current;
    const change  = prev ? ((current - prev) / prev) * 100 : 0;

    // 1 분 CDN 캐시
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');

    res.status(200).json({ price: current, change });
  } catch (err) {
    console.error('Unexpected error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
