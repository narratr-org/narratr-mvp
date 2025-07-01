-- ========= Narratr v0.1 데이터베이스 스키마 =========
-- Postgres 기준 (다른 DB도 호환 용이)

-- KOL 정보
CREATE TABLE kols (
  id            SERIAL PRIMARY KEY,
  handle        VARCHAR(50) UNIQUE NOT NULL,    -- @이름
  display_name  VARCHAR(100),
  avatar_url    TEXT,
  opt_in        BOOLEAN DEFAULT TRUE,           -- KOL 허락 여부
  created_at    TIMESTAMP DEFAULT NOW()
);

-- 원본 글(트윗·미디엄·etc)
CREATE TABLE articles (
  id            SERIAL PRIMARY KEY,
  kol_id        INT            REFERENCES kols(id),
  title         TEXT,
  summary       TEXT,           -- 3줄 요약
  source_url    TEXT NOT NULL,
  source_site   VARCHAR(30),    -- twitter / medium / mirror …
  language      VARCHAR(10)     DEFAULT 'en',
  published_at  TIMESTAMP,      -- 원문 게시 시각
  ingested_at   TIMESTAMP DEFAULT NOW()
);

-- 태그(코인, 테마, 감정 등)
CREATE TABLE tags (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(50) UNIQUE,
  tag_type      VARCHAR(20)      -- coin / theme / sentiment
);

-- 글↔태그 N:M 관계
CREATE TABLE article_tag_map (
  article_id    INT REFERENCES articles(id),
  tag_id        INT REFERENCES tags(id),
  PRIMARY KEY(article_id, tag_id)
);

-- 클릭 이벤트(리다이렉트)
CREATE TABLE click_events (
  id            BIGSERIAL PRIMARY KEY,
  article_id    INT REFERENCES articles(id),
  referer       TEXT,
  user_agent    TEXT,
  clicked_at    TIMESTAMP DEFAULT NOW()
);

-- schema.sql 추가
CREATE TABLE IF NOT EXISTS price_candles (
  ts       INTEGER PRIMARY KEY, -- UNIX epoch (1분 봉 시작 시각)
  open     REAL NOT NULL,
  high     REAL NOT NULL,
  low      REAL NOT NULL,
  close    REAL NOT NULL,
  volume   REAL
);
