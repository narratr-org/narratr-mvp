import React from 'react';
import { useLatestPrice } from '@lib/usePrice';

export default function PriceTicker() {
  // 실시간 가격·변동률
  const { price, change } = useLatestPrice();

  const changeColor =
    change > 0 ? 'text-green-600'
    : change < 0 ? 'text-red-600'
    : 'text-gray-600';

  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-semibold">${price.toFixed(4)}</span>
      <span className={changeColor}>{change.toFixed(2)}%</span>
    </div>
  );
}
