import React from 'react';
import FeedItem, { Feed } from './FeedItem';

interface FeedListProps {
  items: Feed[];
}

export default function FeedList({ items }: FeedListProps) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <FeedItem key={item.id} feed={item} />
      ))}
    </ul>
  );
}
