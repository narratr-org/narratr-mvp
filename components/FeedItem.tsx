import React from 'react';

export interface Feed {
  id: number | string;
  author_handle: string;
  text: string;
  source_url: string;
  created_at: string;
}

interface FeedItemProps {
  feed: Feed;
}

export default function FeedItem({ feed }: FeedItemProps) {
  return (
    <li className="border rounded-md p-4 bg-white shadow">
      <div className="text-sm text-gray-500">{feed.author_handle}</div>
      <p className="mt-2 whitespace-pre-wrap">{feed.text}</p>
      <div className="mt-3 flex items-center justify-between">
        <a
          href={feed.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 text-sm hover:underline"
        >
          원문 링크
        </a>
        <span className="text-xs text-gray-400">
          {new Date(feed.created_at).toLocaleString()}
        </span>
      </div>
    </li>
  );
}
