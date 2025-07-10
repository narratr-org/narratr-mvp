-- Supabase migration: create social_tags table
CREATE TABLE IF NOT EXISTS social_tags (
  id BIGSERIAL PRIMARY KEY,
  tweet_id BIGINT REFERENCES social_raw(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  confidence NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- add index on tweet_id for faster lookups
CREATE INDEX IF NOT EXISTS social_tags_tweet_id_idx ON social_tags(tweet_id);

