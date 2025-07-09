// scripts/social_tag_store.ts
// Store classification tags into social_tags table

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = Deno.env.toObject();

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error(
    "❌ env 가 비어 있습니다 (SUPABASE_URL / SUPABASE_SERVICE_KEY)"
  );
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

/**
 * tweet_id와 태그 배열을 받아 social_tags 테이블에 upsert
 * @param tweetId 트윗 ID
 * @param tags 분류 결과 태그 배열
 * @returns 실제 upsert된 행 수
 */
export async function storeSocialTags(
  tweetId: string,
  tags: string[]
): Promise<number> {
  if (!tags.length) return 0;

  const rows = tags.map((t) => ({ tweet_id: tweetId, tag: t }));

  try {
    const { data, error } = await sb
      .from("social_tags")
      .upsert(rows, { onConflict: ["tweet_id", "tag"] })
      .throwOnError();

    if (error) {
      console.error("❌ social_tags upsert error:", error.message);
      throw error;
    }

    console.log(`▶ upserted ${data?.length ?? 0} tag rows`);
    return data?.length ?? 0;
  } catch (err) {
    console.error("❌ social_tags upsert exception:", err);
    throw err;
  }
}
