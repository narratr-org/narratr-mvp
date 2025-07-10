import Link from 'next/link';
export default function Home() {
  return (
    <main className='min-h-screen flex flex-col items-center justify-center bg-brand text-black'>
      <h1 className='text-4xl font-bold mb-4'>DOGNarratr Beta</h1>
      <p className='mb-6 text-center max-w-md'>
        $DOG 가격 · 공지 · KOL 멘션을 한 눈에!<br/>
        현재는 $DOG 전용 피드만 제공합니다.
      </p>
      <Link href='/dog/feed' className="px-6 py-3 bg-accent rounded-xl text-white font-semibold hover:opacity-90">
        Go to $DOG Feed
      </Link>
    </main>
  );
}
