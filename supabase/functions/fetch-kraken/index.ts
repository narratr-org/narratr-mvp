/**
 * Edge Function: fetch-kraken (1 분 봉)
 * - Kraken OHLC → price_candles UPSERT
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const PAIR            = "DOGEUSD";
const INTERVAL_MINUTE = 1;     // 1 분 봉
const CANDLES_FETCH   = 720;   // 최근 12 시간

const kraken = (since?: number) => {
  const p = new URLSearchParams({
    pair: PAIR,
    interval: INTERVAL_MINUTE.toString(),
  });
  if (since) p.append("since", since.toString());
  return `https://api.kraken.com/0/public/OHLC?${p.toString()}`;
};

serve(async () => {
  /* 1) 최근 시각 */
  const { data: latest } = await supabase
    .from("price_candles")
    .select("ts")
    .eq("interval", INTERVAL_MINUTE.toString())
    .order("ts", { ascending: false })
    .limit(1)
    .maybeSingle();

  const since = latest
    ? Math.floor(new Date(latest.ts).getTime() / 1000)
    : undefined;

  /* 2) Kraken 호출 */
  const res  = await fetch(kraken(since));
  const json = await res.json();
  if (json.error?.length) {
    console.error("Kraken error:", json.error);
    return new Response("Kraken API error", { status: 502 });
  }

  /* 3) 데이터 가공 */
  const rows = (json.result[PAIR] as unknown[])
    .slice(-CANDLES_FETCH)
    .map(([ts, , , , close]: any) => ({
      ts:       new Date(Number(ts) * 1000).toISOString(),
      close:    Number(close),
      interval: INTERVAL_MINUTE.toString(),
    }));

  /* 4) UPSERT */
  const { error } = await supabase
    .from("price_candles")
    .upsert(rows, { onConflict: "ts,interval" });

  if (error) return new Response(error.message, { status: 500 });
  return new Response(`OK — ${rows.length} rows`, { status: 200 });
});
