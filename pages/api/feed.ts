import type { NextApiRequest, NextApiResponse } from 'next'

/** Item returned in the feed response */
export interface FeedItem {
  id: number
  title: string
  summary: string
  source_url: string
  published_at: string
}

/** Shape of the /api/feed response */
export interface FeedResponse {
  page: number
  tag?: string
  kol?: string
  items: FeedItem[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FeedResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  const { page = '1', tag, kol } = req.query

  const pageNum = parseInt(Array.isArray(page) ? page[0] : page, 10)
  const tagStr = Array.isArray(tag) ? tag[0] : tag
  const kolStr = Array.isArray(kol) ? kol[0] : kol

  // TODO: fetch items from database using pageNum, tagStr and kolStr
  const items: FeedItem[] = []

  const response: FeedResponse = {
    page: Number.isNaN(pageNum) ? 1 : pageNum,
    tag: tagStr || undefined,
    kol: kolStr || undefined,
    items,
  }

  return res.status(200).json(response)
}
