import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  try {
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
    const prev = data[1] ? data[1].close : current;
    const change = prev ? ((current - prev) / prev) * 100 : 0;

    res.status(200).json({ price: current, change });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
