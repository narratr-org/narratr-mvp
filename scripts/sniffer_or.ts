// scripts/sniffer_or.ts

import "https://deno.land/std@0.224.0/async/delay.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  TWITTER_BEARER,
  TWEET_LIMIT = "100",   // 페이지당 최대 100, 최소 10
} = Deno.env.toObject();

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !TWITTER_BEARER) {
  throw new Error(
    "❌ env 가 비어 있습니다 (SUPABASE_URL / SUPABASE_SERVICE_KEY / TWITTER_BEARER)",
  );
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// ─── KOL 설정 ───────────────────────────
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

// ─── 한 번에 가져올 개수 ─────────────────
const MAX_RESULTS = Math.min(Math.max(Number(TWEET_LIMIT) || 10, 10), 100);

// ─── 1. 마지막 since_id 조회 ────────────────
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

// ─── 2. 페이지 1회분만 가져오기 ─────────────
async function fetchOnePage(sinceId: string | null) {
  // Leonidas: 리트윗·인용·답글 모두, DOG 키워드 포함
  const qLeon = `(from:${LEON}) (DOG OR dog)`;
  // 나머지 7명: 리트윗·답글 제외, DOG 키워드 포함
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

// ─── 3. Supabase upsert & 로그 기록 ─────────
async function storeTweets(rows: Array<{
  id: string; text: string; author_id: string; created_at: string; lang: string;
}>, runAt: string) {
  if (!rows.length) {
    // 신규 없으면 since_id 그대로 기록(로그만)
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

  const { data: upserted, error: upsertErr } = await sb
    .from("social_raw")
    .upsert(formatted, { onConflict: ["source_url"] })
    .throwOnError();

  if (upsertErr) {
    console.error("❌ social_raw upsert error:", upsertErr.message);
    await sb.from("sniffer_logs").insert({
      run_at: runAt, since_id: null, inserted: 0, error: upsertErr.message,
    });
    throw upsertErr;
  }

  console.log(`▶ upsert returned ${upserted?.length ?? 0} rows`);

  // 페이지 내 최신 ID를 since_id로 기록
  const maxId = Math.max(...rows.map((t) => Number(t.id))).toString();
  await sb.from("sniffer_logs").insert({
    run_at: runAt,
    since_id: maxId,
    inserted: upserted?.length ?? 0,
    error: null,
  });

  return upserted?.length ?? 0;
}

// ─── 4. 메인 실행 ─────────────────────────
(async () => {
  const START = new Date().toISOString();
  try {
    const sinceId = await getSinceId();
    const tweets = await fetchOnePage(sinceId);
    const count = await storeTweets(tweets, START);
    console.log(`✅ completed with ${count} tweets inserted/upserted`);
  } catch (err) {
    console.error("❌ Sniffer 실패:", err);
    Deno.exit(1);
  }
})();
