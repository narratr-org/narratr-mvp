// scripts/sniffer_or.ts

import "https://deno.land/std@0.224.0/async/delay.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  TWITTER_BEARER,
  TWEET_LIMIT = "10",   // 최소 10 (Twitter API), 최대 100
} = Deno.env.toObject();

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !TWITTER_BEARER) {
  throw new Error(
    "❌ env 가 비어 있습니다 (SUPABASE_URL / SUPABASE_SERVICE_KEY / TWITTER_BEARER)",
  );
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// ─── KOL 목록 ─────────────────────────
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

// ─── Leonidas만 특별 처리 ────────────────
const LEON = "LeonidasNFT";
const OTHER_KOLS = ALL_KOLS.filter((u) => u !== LEON);

// ─── 한 번에 가져올 최대 개수 ─────────────
const MAX_RESULTS = Math.min(Number(TWEET_LIMIT) || 10, 100);

// ─── 1. 마지막 since_id 가져오기 ───────────
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

// ─── 2. Twitter API 호출 ──────────────────
async function fetchTweets(sinceId: string | null) {
  // Leonidas: retweet/reply/quote 모두, DOG 키워드 포함
  const qLeon = `(from:${LEON}) (DOG OR dog)`;
  // 다른 KOL: retweet & reply 제외, DOG 키워드 포함
  const qOthers = `(${OTHER_KOLS.map((u) => `from:${u}`).join(" OR ")}) (DOG OR dog) -is:retweet -is:reply`;

  // 둘을 OR 로 결합
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
  const json = await res.json() as {
    data?: Array<{ id: string; text: string; author_id: string; created_at: string; lang: string }>;
  };
  console.log(`▶ fetched ${json.data?.length ?? 0} tweets from API`);
  return json.data ?? [];
}

// ─── 3. Supabase upsert & 로그 기록 ─────────
async function storeTweets(rows: Array<{
  id: string; text: string; author_id: string; created_at: string; lang: string;
}>, runAt: string) {
  if (!rows.length) {
    // 신규 없을 때도 로그 남기기
    await sb.from("sniffer_logs").insert({
      run_at: runAt, since_id: null, inserted: 0, error: null,
    });
    return 0;
  }

  const formatted = rows.map((t) => ({
    author_handle: t.author_id,
    text: t.text,
    lang: t.lang,
    source_url: `https://x.com/i/web/status/${t.id}`,
    created_at: t.created_at,
  }));

  // 중복 source_url 은 무시하고, 실패는 throw
  const { data: upserted, error: upsertErr } = await sb
    .from("social_raw")
    .upsert(formatted, { onConflict: ["source_url"] })
    .throwOnError();

  if (upsertErr) {
    console.error("❌ social_raw upsert error:", upsertErr.message);
    // 에러도 로그에 남기고
    await sb.from("sniffer_logs").insert({
      run_at: runAt, since_id: null, inserted: 0, error: upsertErr.message,
    });
    throw upsertErr;
  }

  console.log(`▶ upsert returned ${upserted?.length ?? 0} rows`);

  // 최신 ID 계산해서 since_id 로 저장
  const maxId = Math.max(...rows.map((t) => Number(t.id))).toString();
  await sb.from("sniffer_logs").insert({
    run_at: runAt,
    since_id: maxId,
    inserted: upserted?.length ?? 0,
    error: null,
  });

  return upserted?.length ?? 0;
}

// ─── 4. 메인 플로우 실행 ─────────────────
const START = new Date().toISOString();

try {
  const sinceId = await getSinceId();
  const tweets = await fetchTweets(sinceId);
  const count = await storeTweets(tweets, START);
  console.log(`✅ completed with ${count} tweets inserted/upserted`);
} catch (err) {
  console.error("❌ Sniffer 실패:", err);
  Deno.exit(1);
}
