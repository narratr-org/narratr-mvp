import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
});

export default function useFeed() {
  const { data, error, isLoading } = useSWR('/api/feed', fetcher);
  return {
    feed: data,
    isLoading,
    error,
  };
}
