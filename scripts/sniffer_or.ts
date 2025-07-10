// scripts/sniffer_or.ts

import "https://deno.land/std@0.224.0/async/delay.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  TWITTER_BEARER,
  TWEET_LIMIT = "100",
} = Deno.env.toObject();

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !TWITTER_BEARER) {
  throw new Error(
    "❌ env 가 비어 있습니다 (SUPABASE_URL / SUPABASE_SERVICE_KEY / TWITTER_BEARER)",
  );
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// KOL 설정
const ALL_KOLS = [
  "LeonidasNFT",
  "MrKeyway",
  "cryptolution101",
  "vittopantoliano",
  "dogofbitcoin",
  "edmond_dantes_j",
  "Relentless_btc",
  "CoinWeb3",
];
const LEON = "LeonidasNFT";
const OTHER_KOLS = ALL_KOLS.filter((u) => u !== LEON);

// 한 페이지당 최대 가져올 수
const MAX_RESULTS = Math.min(Math.max(Number(TWEET_LIMIT) || 10, 10), 100);

// 1) 마지막 since_id 조회
async function getSinceId(): Promise<string | null> {
  const { data, error } = await sb
    .from("sniffer_logs")
    .select("since_id")
    .order("run_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) console.warn("sniffer_logs 조회 오류:", error.message);
  return data?.since_id ?? null;
}

// 2) 1페이지만 가져오기
async function fetchOnePage(sinceId: string | null) {
  const qLeon = `(from:${LEON}) (DOG OR dog)`;
  const qOthers = `(${OTHER_KOLS.map((u) => `from:${u}`).join(" OR ")}) (DOG OR dog) -is:retweet -is:reply`;
  const fullQuery = `(${qLeon}) OR (${qOthers})`;

  const params = new URLSearchParams({
    query: fullQuery,
    "tweet.fields": "author_id,created_at,lang",
    max_results: String(MAX_RESULTS),
  });
  if (sinceId) params.set("since_id", sinceId);

  const url = `https://api.twitter.com/2/tweets/search/recent?${params}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TWITTER_BEARER}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Twitter ${res.status}: ${body}`);
  }
  const json = (await res.json()) as {
    data?: Array<{
      id: string;
      text: string;
      author_id: string;
      created_at: string;
      lang: string;
    }>;
  };
  console.log(`▶ fetched ${json.data?.length ?? 0} tweets from API (1 page)`);
  return json.data ?? [];
}

// 3) upsert + since_id 갱신 & 로그
async function storeTweets(
  rows: Array<{
    id: string; text: string; author_id: string; created_at: string; lang: string;
  }>,
  runAt: string,
  prevSinceId: string | null,
) {
  // 페이지 내 최대 ID를 계산해서, 신규 or 미신규 여부 상관없이 since_id로 삼는다
  const newSinceId =
    rows.length > 0
      ? Math.max(...rows.map((t) => Number(t.id))).toString()
      : prevSinceId;

  let insertedCount = 0;

  if (rows.length > 0) {
    const formatted = rows.map((t) => ({
      author_handle: t.author_id,
      text: t.text,
      lang: t.lang,
      source_url: `https://x.com/i/web/status/${t.id}`,
      created_at: t.created_at,
    }));

    const { data: upserted, error: upsertErr } = await sb
      .from("social_raw")
      .upsert(formatted, { onConflict: ["source_url"] })
      .throwOnError();

    if (upsertErr) {
      console.error("❌ social_raw upsert error:", upsertErr.message);
      throw upsertErr;
    }

    insertedCount = upserted?.length ?? 0;
    console.log(`▶ upsert returned ${insertedCount} rows`);
  } else {
    console.log("▶ no new rows to upsert");
  }

  // 항상 since_id를 기록 (rows 없을 땐 prevSinceId 유지)
  await sb.from("sniffer_logs").insert({
    run_at: runAt,
    since_id: newSinceId,
    inserted: insertedCount,
    error: null,
  });

  return insertedCount;
}

// 4) 메인
(async () => {
  const START = new Date().toISOString();
  try {
    const prevSinceId = await getSinceId();
    const tweets = await fetchOnePage(prevSinceId);
    const count = await storeTweets(tweets, START, prevSinceId);
    console.log(`✅ completed with ${count} tweets inserted/upserted`);
  } catch (err) {
    console.error("❌ Sniffer 실패:", err);
    Deno.exit(1);
  }
})();
