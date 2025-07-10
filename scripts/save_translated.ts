// scripts/save_translated.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = Deno.env.toObject();

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error("❌ env 가 비어 있습니다 (SUPABASE_URL / SUPABASE_SERVICE_KEY)");
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

type TranslatedRow = {
  tweet_id: string;
  translated_text: string;
};

/**
 * 번역된 트윗을 social_translated 테이블에 저장합니다.
 * @param rows tweet_id 와 번역 텍스트 배열
 * @returns upsert 된 row 수
 */
export async function storeTranslated(rows: TranslatedRow[]): Promise<number> {
  if (!rows.length) return 0;

  const formatted = rows.map((r) => ({
    tweet_id: r.tweet_id,
    translated_text: r.translated_text,
  }));

  try {
    const { data, error } = await sb
      .from("social_translated")
      .upsert(formatted, { onConflict: ["tweet_id"] })
      .throwOnError();

    if (error) {
      console.error("❌ social_translated upsert error:", error.message);
      return 0;
    }

    console.log(`▶ stored ${data?.length ?? 0} translated tweets`);
    return data?.length ?? 0;
  } catch (err) {
    console.error("❌ social_translated upsert fail:", err);
    return 0;
  }
}
