// scripts/sniffer_or.ts

// ❶ 딜레이 모듈 로드
import "https://deno.land/std@0.224.0/async/delay.ts";
// ❷ Supabase 클라이언트
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ❸ 환경변수 읽기 (GitHub Actions → 리포지토리 Variables/Secrets에 설정)
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  TWITTER_BEARER,
  TWEET_LIMIT = "5",           // 한 달 한도(15 000) 고려 1회당 기본 5개
} = Deno.env.toObject();

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !TWITTER_BEARER) {
  throw new Error(
    "❌ env 가 비어 있습니다 (SUPABASE_URL / SUPABASE_SERVICE_KEY / TWITTER_BEARER)",
  );
}

// ❹ Supabase 클라이언트 초기화
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// ❺ KOL 목록 & 최대 검색 개수
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
const MAX_RESULTS = Math.min(Number(TWEET_LIMIT) || 5, 100);

// ──────────── 함수 정의 ────────────

// 1) sniffer_logs에서 마지막 since_id 가져오기
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

// 2) Twitter API 에서 트윗 가져오기
async function fetchTweets(sinceId: string | null) {
  const query =
    `(${KOLS.map((u) => `from:${u}`).join(" OR ")}) (DOG OR dog) -is:retweet`;
  const params = new URLSearchParams({
    query,
    "tweet.fields": "author_id,created_at,lang",
    max_results: String(MAX_RESULTS),
  });
  if (sinceId) params.set("since_id", sinceId);

  const url = `https://api.twitter.com/2/tweets/search/recent?${params}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TWITTER_BEARER}` },
  });
  if (!res.ok) {
    throw new Error(`Twitter ${res.status}: ${await res.text()}`);
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

// 3) Supabase에 upsert + sniffer_logs에 기록
async function storeTweets(
  rows: Awaited<ReturnType<typeof fetchTweets>>["data"],
  runAt: string,
) {
  // 새 트윗 없으면, 로그만 남기고 종료
  if (!rows?.length) {
    await sb.from("sniffer_logs").insert({
      run_at: runAt,
      since_id: null,
      inserted: 0,
      error: null,
    });
    return 0;
  }

  // social_raw 형식에 맞게 변환
  const formatted = rows.map((t) => ({
    author_handle: t.author_id,
    text: t.text,
    lang: t.lang,
    source_url: `https://x.com/i/web/status/${t.id}`,
    created_at: t.created_at,
  }));

  // upsert(중복 source_url 무시), 실패 시 throw
  const { data: upserted, error: upsertErr } = await sb
    .from("social_raw")
    .upsert(formatted, { onConflict: ["source_url"] })
    .throwOnError();

  // 에러 나면 로그 남기고 즉시 실패 처리
  if (upsertErr) {
    console.error("❌ social_raw upsert error:", upsertErr.message);
    await sb.from("sniffer_logs").insert({
      run_at: runAt,
      since_id: null,
      inserted: 0,
      error: upsertErr.message,
    });
    throw upsertErr;
  }

  console.log(`▶ upsert returned ${upserted?.length ?? 0} rows`);

  // 가장 큰 트윗 ID 구해서 since_id로 저장
  const maxId = Math.max(...rows.map((t) => Number(t.id))).toString();
  await sb.from("sniffer_logs").insert({
    run_at: runAt,
    since_id: maxId,
    inserted: upserted?.length ?? 0,
    error: null,
  });

  return upserted?.length ?? 0;
}

// ──────────── 메인 플로우 ────────────

const START = new Date().toISOString();

try {
  const sinceId = await getSinceId();
  const resp = await fetchTweets(sinceId);
  console.log(`✅ fetched ${resp.data?.length ?? 0} tweets from API`);

  const upsertCount = await storeTweets(resp.data, START);
  console.log(`✅ completed with ${upsertCount} tweets inserted/upserted`);
} catch (err) {
  console.error("❌ Sniffer 실패:", err);
  Deno.exit(1);
}
