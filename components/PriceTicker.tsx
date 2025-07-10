import React from 'react';
import { useLatestPrice } from '../lib/usePrice';

export default function PriceTicker() {
  const { price, change, isLoading, error } = useLatestPrice();

  if (error) return <div className="text-red-600">Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-semibold">${price.toFixed(4)}</span>
      <span className={changeColor}>{change.toFixed(2)}%</span>
    </div>
  );
}

