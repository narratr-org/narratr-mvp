import { supabase } from '../../lib/supabaseClient';

/**
 * GET /api/chart?from=1700000000&to=1710000000
 */
export default async function handler(req, res) {
  try {
    const from = parseInt(req.query.from, 10);
    const to = parseInt(req.query.to, 10);

    if (isNaN(from) || isNaN(to)) {
      return res.status(400).json({ error: 'Invalid timestamp format' });
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

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
