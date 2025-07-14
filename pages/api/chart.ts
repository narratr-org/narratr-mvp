export const runtime = 'edge';
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const from = parseInt(req.query.from as string, 10);
    const to = parseInt(req.query.to as string, 10);

    if (isNaN(from) || isNaN(to)) {
      return res.status(400).json({ error: 'Invalid timestamp format' });
    }

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
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
