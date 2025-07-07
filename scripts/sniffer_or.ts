// ────────────── 환경 준비 ──────────────
import "https://deno.land/std@0.224.0/async/delay.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

// .github/workflows/sniffer.yml 의 env → Actions 런타임으로 전달됨
const { SUPABASE_URL, SUPABASE_SERVICE_KEY, TWITTER_BEARER } = Deno.env.toObject();

// ▶︎ Supabase
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

// ▶︎ KOL 목록 (필요하면 수정)
const KOLS = [
  "LeonidasNFT", "MrKeyway", "cryptolution101",
  "vittopantoliano", "dogofbitcoin", "edmond_dantes_j",
  "Relentless_btc", "CoinWeb3",
];

// ────────────── 헬퍼 함수 ──────────────
/** state 테이블 (1 row) 에 마지막 트윗 id 를 저장/읽기 */
async function getLastId(): Promise<string | null> {
  const { data } = await supabase
    .from("sniffer_state")
    .select("last_id")
    .single();
  return data?.last_id ?? null;
}

async function setLastId(id: string) {
  await supabase.from("sniffer_state")
    .upsert({ id: 1, last_id: id });           // PK = 1 한 줄만 유지
}

/** Twitter API 호출 – 없는 경우 since_id 생략 */
async function fetchTweets(query: string, sinceId?: string) {
  const url = new URL("https://api.twitter.com/2/tweets/search/recent");
  url.searchParams.set("query", query);
  url.searchParams.set("max_results", "15");       // 첫 실행 과호출 방지
  if (sinceId) url.searchParams.set("since_id", sinceId);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TWITTER_BEARER}` },
  });
  if (!res.ok) throw new Error(`Twitter ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json?.data ?? [];
}

// ────────────── 메인 로직 ──────────────
const kolFilter = KOLS.map(u => `from:${u}`).join(" OR ");
const dogFilter = '"$DOG" OR "$dog"';
const query = `${kolFilter} ${dogFilter} -is:retweet`;

try {
  // 1) 마지막 id 읽기
  const sinceId = await getLastId();     // null 이면 생략

  // 2) 트윗 가져오기
  const tweets = await fetchTweets(query, sinceId);
  if (!tweets.length) {
    console.log("No new tweets 👌");
    Deno.exit(0);
  }

  // 3) DB 삽입 (중복은 Supabase PK 충돌로 자동 무시)
  const rows = tweets.map((t: any) => ({
    id: t.id,
    author_handle: t.author_id,
    text: t.text,
    lang: t.lang,
    source_url: `https://x.com/i/web/status/${t.id}`,
    created_at: t.created_at,
  }));
  await supabase.from("social_raw").upsert(rows);

  // 4) 가장 큰 id → state 업데이트
  const maxId = tweets.reduce((m: string, t: any) => (t.id > m ? t.id : m), sinceId ?? "0");
  await setLastId(maxId);

  console.log(`✅ stored ${rows.length} tweets, last_id=${maxId}`);
} catch (err) {
  // 에러는 로깅만 하고 0 반환 → 워크플로 “성공” 처리
  console.error("Sniffer error:", err.message);
}
