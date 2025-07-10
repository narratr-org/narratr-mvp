import useSWR from 'swr';

export interface PriceData {
  price: number;
  change: number;
}

// 가격 API 호출 함수
const fetcher = async (url: string): Promise<PriceData> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

/**
 * 60 초마다 /api/prices 를 호출해 최신 시세를 가져오는 SWR 훅
 */
export function useLatestPrice(refreshMs = 60_000): PriceData {
  const { data, error } = useSWR<PriceData>('/api/prices', fetcher, {
    refreshInterval: refreshMs,
  });

  if (error) throw error;

  return {
    price: data?.price ?? 0,
    change: data?.change ?? 0,
  };
}
