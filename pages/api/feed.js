import { supabase } from '../../lib/supabaseClient';

/**
 * /api/feed?page=1&limit=20&tag=BitcoinEco&kol=LeonidasNFT
 */
export default async function handler(req, res) {
  try {
    const { page = '1', limit = '20', tag, kol } = req.query;

    // 1) page → offset 계산
    const pageNum = Math.max(parseInt(page, 10), 1);
    const limitNum = Math.max(parseInt(limit, 10), 1);
    const offset = (pageNum - 1) * limitNum;

    // 기본 SELECT (KOL 조인)
    let query = supabase
      .from('articles')
      .select(
        `id, title, summary, source_url, source_site, language, published_at,
         kols!inner(handle, display_name),
         article_tag_map(tags(name))`,
        { count: 'exact' }
      )
      .order('published_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    // 2) tag, kol 파라미터에 따라 where절 추가
    if (kol) query = query.eq('kols.handle', kol);
    if (tag) query = query.eq('tags.name', tag);

    const { data, count, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ total: count, items: data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 3) total count 조회 예시 (별도 호출)
// const { count } = await supabase
//   .from('articles')
//   .select('id', { count: 'exact', head: true })
//   .eq('tags.name', 'BitcoinEco');
