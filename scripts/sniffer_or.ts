/**
 * scripts/sniffer_or.ts
 * --------------------------------------------------
 * 1) GitHub Actions (cron) 으로 5 분마다 실행
 * 2) 지정한 KOL 8명의 트윗 중 $DOG·$dog 포함 글을 수집
 * 3) Supabase social_raw 테이블에 upsert
 * 4) 실행 건수를 sniffer_logs 테이블에 기록  ← NEW!
 * --------------------------------------------------
 *  ⚠️  사전 준비
 *   - .github/workflows/sniffer.yml 에 SUPABASE_URL, SUPABASE_SERVICE_KEY,
 *     TWITTER_BEARER 세 개의 secret 이 있어야 함.
 */

import "https://deno.land/std@0.224.0/async/delay.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "../supabase/types.ts"; // ① 타입 생성기 돌린 경우만

/* ---------- 1. 환경 변수 ---------- */
const SUPABASE_URL   = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY   = Deno.env.get("SUPABASE_SERVICE_KEY")!;
const TWITTER_BEARER = Deno.env.get("TWITTER_BEARER")!;

/* ---------- 2. Supabase 클라이언트 ---------- */
const supabase = /** @type {import("@supabase/supabase-js").SupabaseClient<Database>} */
  (createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false }}));

/* ---------- 3. KOL 목록 ---------- */
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

/* ---------- 4. since_id 보정 로직 ---------- */
async function loadSinceId(): Promise<string | undefined> {
  const { data, error } = await supabase
    .from("social_raw")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) console.error("loadSinceId:", error.message);
  return data?.id?.toString();          // 없으면 undefined 반환
}

/* ---------- 5. Twitter Recent Search ---------- */
async function fetchTweets(sinceId?: string) {
  // (from:user1 OR from:user2 ...) AND ($DOG OR $dog)
  const query =
    `(${KOLS.map((h) => `from:${h}`).join(" OR ")}) ($DOG OR $dog) -is:retweet`;

  const params = new URLSearchParams({
    query,
    "tweet.fields": "author_id,created_at,lang",
    max_results: "100",
  });
  if (sinceId) params.set("since_id", sinceId);

  const res = await fetch(`https://api.twitter.com/2/tweets/search/recent?${params}`, {
    headers: { Authorization: `Bearer ${TWITTER_BEARER}` },
  });
  if (!res.ok) throw new Error(`Twitter ${res.status}: ${await res.text()}`);

  type TwitterResp = {
    data?: { id: string; author_id: string; text: string; lang: string; created_at: string }[];
  };
  const json = (await res.json()) as TwitterResp;
  return json.data ?? [];
}

/* ---------- 6. 메인 실행 ---------- */
(async () => {
  try {
    const sinceId = await loadSinceId();
    const tweets  = await fetchTweets(sinceId);

    if (tweets.length) {
      const rows = tweets.map((t) => ({
        id:          Number(t.id),             // social_raw PK
        author_handle: t.author_id,
        text:        t.text,
        lang:        t.lang,
        source_url:  `https://x.com/i/web/status/${t.id}`,
        created_at:  t.created_at,
      }));

      // upsert + ignoreDuplicates → PK(id) 겹치면 무시
      const { error } = await supabase
        .from("social_raw")
        .upsert(rows, { ignoreDuplicates: true });
      if (error) throw error;

      /* ------------- NEW: 실행 건수 로그 ------------- */
      await supabase.from("sniffer_logs").insert({ inserted: rows.length });
      /* ---------------------------------------------- */

      console.log(`✅ stored ${rows.length} tweets`);
    } else {
      console.log("✅ no new tweets");
    }
  } catch (err) {
    console.error("❌", err);
    Deno.exit(1);                       // GitHub Actions fail 표시
  }
})();
