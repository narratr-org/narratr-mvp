/* lib/usePrice.ts
   실시간 가격을 15초마다 불러오는 SWR 훅  */

import useSWR from 'swr';

// fetcher 함수
const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * 가장 최근 가격 1건을 가져옵니다.
 * refreshInterval: 15,000ms (15초)
 */
export const useLatestPrice = () =>
  useSWR('/api/prices/latest', fetcher, {
    refreshInterval: 15_000,
  });
