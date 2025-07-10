import useSWR from 'swr'

interface PriceData {
  price: number
  change: number
}

const fetcher = async (url: string): Promise<PriceData> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Network response was not ok')
  }
  return res.json()
}

export function useLatestPrice() {
  const { data, error } = useSWR<PriceData>('/api/prices', fetcher, {
    refreshInterval: 30000,
  })

  return {
    price: data?.price ?? 0,
    change: data?.change ?? 0,
    isLoading: !data && !error,
    error,
  }
}

