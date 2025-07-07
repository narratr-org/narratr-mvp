// scripts/sniffer_or.ts
/**
 * 1. KOL 8인 OR 검색
 * 2. 'DOG' 키워드만 필터
 * 3. Supabase → social_raw 에 INSERT (중복 무시)
 * 4. 마지막 since_id 는 sniffer_logs 테이블에 저장
 */

import "https://deno.land/std@0.224.0/async/delay.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  TWITTER_BEARER,
} = Deno.env.toObject();

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !TWITTER_BEARER) {
  throw new Error("❌ env 가 비어 있습니다 (SUPABASE_URL / SUPABASE_SERVICE_KEY / TWITTER_BEARER)");
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

const KOLS = [
  "LeonidasNFT",
  "MrKeyway",
  "cryptolution101",
  "vittopantoliano",
  "dogofbitcoin",
  "edmond_dantes_j",
  "Relentless_btc",
  "CoinWeb3",
];

/** ▒▒▒ ❶ 마지막 since_id 가져오기 ▒▒▒ */
async function getSinceId(): Promise<string | null> {
  const { data } = await sb
    .from("sniffer_logs")
    .select("since_id")
    .order("inserted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.since_id ?? null;
}

/** ▒▒▒ ❷ Twitter API 호출 ▒▒▒ */
async function fetchTweets(sinceId: string | null) {
  const query =
    `(${KOLS.map((u) => `from:${u}`).join(" OR ")}) (DOG OR dog) -is:retweet`;
  const params = new URLSearchParams({
    query,
    "tweet.fields": "author_id,created_at,lang",
    max_results: "10",
  });
  if (sinceId) params.set("since_id", sinceId);

  const url = `https://api.twitter.com/2/tweets/search/recent?${params}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TWITTER_BEARER}` },
  });
  if (!res.ok) {
    throw new Error(
      `Twitter ${res.status}: ${await res.text()}`,
    );
  }
  return (await res.json()) as {
    data?: Array<{
      id: string;
      text: string;
      author_id: string;
      created_at: string;
      lang: string;
    }>;
  };
}

/** ▒▒▒ ❸ Supabase INSERT + since_id 저장 ▒▒▒ */
async function storeTweets(rows: Awaited<ReturnType<typeof fetchTweets>>["data"]) {
  if (!rows?.length) return 0;

  const formatted = rows.map((t) => ({
    id: t.id,
    author_handle: t.author_id,
    text: t.text,
    lang: t.lang,
    source_url: `https://x.com/i/web/status/${t.id}`,
    created_at: t.created_at,
  }));

  await sb.from("social_raw").upsert(formatted, { ignoreDuplicates: true });

  // 로그 테이블에 가장 큰 id 기록
  const maxId = Math.max(...rows.map((t) => Number(t.id))).toString();
  await sb.from("sniffer_logs").insert({ since_id: maxId });

  return formatted.length;
}

/** ▒▒▒ ❹ 메인 플로우 ▒▒▒ */
const sinceId = await getSinceId();
const resp = await fetchTweets(sinceId);
const inserted = await storeTweets(resp.data);

console.log(`✅ stored ${inserted} tweets`);
