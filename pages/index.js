/* pages/index.js
   홈 → 기존 베타 안내 + 실시간 가격 위젯 */

import Head from 'next/head';
import Link from 'next/link';
import PriceTicker from '@/components/PriceTicker';

export default function Home() {
  return (
    <>
      <Head>
        <title>DogNarratr Beta – $DOG Price & Feed</title>
        <meta
          name="description"
          content="$DOG 가격 · 공지 · KOL 멘션을 한 눈에!"
        />
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-brand text-black">
        {/* 기존 타이틀 */}
        <h1 className="text-4xl font-bold">DOGNarratr Beta</h1>

        {/* 🎯 새로 추가한 가격 위젯 */}
        <PriceTicker />

        {/* 기존 설명 문구 */}
        <p className="text-center max-w-md">
          $DOG 가격 · 공지 · KOL 멘션을 한 눈에!
          <br />
          현재는 $DOG 전용 피드만 제공합니다.
        </p>

        {/* 기존 링크 버튼 */}
        <Link
          href="/dog"
          className="px-6 py-3 bg-accent rounded-xl text-white font-semibold hover:opacity-90"
        >
          Go to $DOG Feed
        </Link>
      </main>
    </>
  );
}
