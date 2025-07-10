import useSWR from 'swr';
import { useEffect } from 'react';

const fetcher = url => fetch(url).then(res => res.json());

export default function PriceTicker() {
  const { data, error, mutate } = useSWR('/api/prices', fetcher);

  useEffect(() => {
    const id = setInterval(() => mutate(), 30000);
    return () => clearInterval(id);
  }, [mutate]);

  if (error) return <div className="text-red-600">Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  const price = data.price ?? 0;
  const change = data.change ?? 0;
  const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-semibold">${price.toFixed(4)}</span>
      <span className={changeColor}>{change.toFixed(2)}%</span>
    </div>
  );
}
