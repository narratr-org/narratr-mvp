import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase 클라이언트
 * - URL : 먼저 서버용(SUPABASE_URL)이 있으면 사용,
 *         없으면 NEXT_PUBLIC_SUPABASE_URL로 대체
 * - KEY : 브라우저 공개용 anon key만 사용
 */
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/prices/latest
 * └─ 가장 최근 종가(1건) 반환
 *    { close: number, time: string }
 */
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const { data, error } = await supabase
    .from('prices')
    .select('close, time')
    .order('time', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // 15초 동안 캐싱, 이후 60초 동안 stale-while-revalidate
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=60');
  return res.status(200).json(data);
}
