import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase 클라이언트
 * URL 우선순위 : SUPABASE_URL → NEXT_PUBLIC_SUPABASE_URL
 */
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/prices/ohlc?start=ISO&end=ISO
 * └─ 지정 구간의 OHLC 전부 반환
 *    [{ time, open, high, low, close, volume }, …]
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { start, end } = req.query;

  // 필수 파라미터 검사
  if (!start || !end) {
    return res.status(400).json({ error: 'start & end query required' });
  }

  // DB 조회
  const { data, error } = await supabase
    .from('prices')
    .select('*')
    .gte('time', start as string)
    .lte('time', end as string)
    .order('time');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // 60초 캐싱
  res.setHeader('Cache-Control', 's-maxage=60');
  return res.status(200).json(data);
}
