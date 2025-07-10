import { supabase } from '../../lib/supabaseClient'

/**
 * GET /api/feed?page=1&limit=20&tag=BitcoinEco&kol=LeonidasNFT
 *
 * - page, limit  : 페이지네이션 (기본 1·20)
 * - tag          : social_raw.tags 배열에 포함된 태그
 * - kol          : author_handle (= KOL 트위터 핸들)
 *
 * 응답 형태 { total, items[] }
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  try {
    const { page = '1', limit = '20', tag, kol } = req.query

    /* 1) page → offset 계산 */
    const pageNum  = Math.max(parseInt(page, 10), 1)
    const limitNum = Math.max(parseInt(limit, 10), 1)
    const offset   = (pageNum - 1) * limitNum

    /* 2) 기본 SELECT */
    let query = supabase
      .from('social_raw')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1)

    /* 3) 파라미터별 필터 */
    if (kol) query = query.eq('author_handle', kol)
    if (tag) query = query.contains('tags', [tag])      // tags[] 컬럼 가정

    /* 4) 실행 */
    const { data, count, error } = await query
    if (error) return res.status(500).json({ error: error.message })

    return res.status(200).json({ total: count, items: data })
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
