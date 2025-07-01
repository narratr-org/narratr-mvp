/*
  components/PriceTicker.tsx
  실시간 가격 위젯 (+마지막 갱신 시각)
*/
import { useLatestPrice } from '@/lib/usePrice';

export default function PriceTicker() {
  const { data, error } = useLatestPrice();

  if (error)
    return <p className="text-red-500">가격을 불러올 수 없습니다.</p>;
  if (!data)
    return <p className="text-zinc-400 animate-pulse">Loading…</p>;

  const price   = Number(data.close).toFixed(5);
  const updated = new Date(data.time);
  const now     = new Date();
  const minutesAgo = Math.round((now.getTime() - updated.getTime()) / 60000); // 분 단위

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl font-bold">${price}</span>
      <span className="text-sm text-zinc-500">
        업데이트 {minutesAgo === 0 ? '방금 전' : `${minutesAgo}분 전`} (
        {updated.toLocaleTimeString()})
      </span>
    </div>
  );
}
