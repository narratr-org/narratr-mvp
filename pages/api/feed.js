import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  const { page = '1', limit = '20', tag, kol } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (isNaN(pageNum) || isNaN(limitNum)) {
    return res.status(400).json({ error: 'page and limit must be numbers' });
  }

  let query = supabase
    .from('social_raw')
    .select('*')
    .order('created_at', { ascending: false })
    .range((pageNum - 1) * limitNum, pageNum * limitNum - 1);

  if (tag) query = query.contains('tags', [tag]);
  if (kol) query = query.eq('author_handle', kol);

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
}
