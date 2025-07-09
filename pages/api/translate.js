import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  const { tag, kol, limit = 10, offset = 0 } = req.query;

  const parsedLimit = Number.parseInt(limit, 10) || 10;
  const parsedOffset = Number.parseInt(offset, 10) || 0;

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
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
}
