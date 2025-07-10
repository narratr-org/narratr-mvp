import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  try {
    // 최신 시세 한 개 조회
    const { data, error } = await supabase
      .from('prices')
      .select('*')
      .order('time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Supabase query error', error.message);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!data) {
      return res.status(404).json({ error: 'Price not found' });
    }

    // 캐싱 헤더: 1분간 CDN 캐시, 브라우저 캐시는 없음
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');

    return res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
