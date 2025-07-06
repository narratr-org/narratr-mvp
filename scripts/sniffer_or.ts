// scripts/sniffer_or.ts
// deno run --allow-net --allow-env scripts/sniffer_or.ts

import { delay } from "https://deno.land/std@0.224.0/async/delay.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------- 환경 변수 ----------
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_KEY")!;
const BEARER        = Deno.env.get("TWITTER_BEARER")!;

// 8 KOL 핸들 (소문자, @ 없이)
const KOLS = [
  "leonidasnft", "mrkeyway", "cryptolution101", "vittopantoliano",
  "dogofbitcoin", "edmond_dantes_j", "relentless_btc", "coinweb3",
] as const;

// ---------- Supabase ----------
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// social_raw 테이블에서 마지막 tweet_id 가져오기
async function getSinceId() {
  const { data, error } = await supabase
    .from("social_raw")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) { console.warn("since_id query error", error.message); }
  return data?.id as string | undefined;
}

// ---------- Twitter ----------
function buildQuery() {
  const fromPart = KOLS.map(u => `from:${u}`).join(" OR ");
  return `(${fromPart}) ($DOG OR $dog) -is:retweet lang:en`;
}

async function fetchTweets(since_id?: string) {
  const params = new URLSearchParams({
    query: buildQuery(),
    "tweet.fields": "author_id,created_at,lang",
    max_results: "100",
  });
  if (since_id) params.append("since_id", since_id);

  const res = await fetch(`https://api.twitter.com/2/tweets/search/recent?${params}`, {
    headers: { Authorization: `Bearer ${BEARER}` },
  });
  if (!res.ok) throw new Error(`Twitter ${res.status}: ${await res.text()}`);
  return (await res.json()) as {
    data?: { id: string; author_id: string; text: string; lang: string; created_at: string }[];
    meta: { newest_id?: string; next_token?: string };
  };
}

// ---------- Main ----------
const sinceId = await getSinceId();
const firstPage = await fetchTweets(sinceId);
const pages = [firstPage];

// (옵션) 더 읽고 싶으면 next_token 루프
while (pages.at(-1)?.meta.next_token && pages.length < 5) {
  await delay(700); // rate-limit 안전 대기
  const more = await fetchTweets();
  more && pages.push(more);
}

const tweets = pages.flatMap(p => p.data ?? []);
if (!tweets.length) {
  console.log("😴 No new tweets");
  Deno.exit(0);
}

// ---------- Supabase Insert ----------
const rows = tweets.map(t => ({
  id:               Number(t.id),               // bigint PK
  author_handle:    t.author_id,
  text:             t.text,
  lang:             t.lang,
  source_url:       `https://x.com/i/web/status/${t.id}`,
  created_at:       t.created_at,
}));

const { error } = await supabase
  .from("social_raw")
  .upsert(rows, { ignoreDuplicates: true });

if (error) throw error;
console.log(`✅ Inserted ${rows.length} new tweets`);
