export const runtime = 'experimental-edge';

import useFeed from '../hooks/useFeed';

export default function FeedPage() {
  const { feed, isLoading, error } = useFeed();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching feed: {error.message}</p>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold mb-4">Latest Feed</h1>
      {feed && feed.length > 0 ? (
        <ul className="space-y-2">
          {feed.map(item => (
            <li key={item.id} className="border p-2 rounded">
              <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="font-semibold">
                @{item.author_handle}
              </a>
              <p className="text-sm mt-1">{item.text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No feed data</p>
      )}
    </div>
  );
}
