-- supabase/trigger_translate.sql
-- 신규 social_raw 행 발생 시 웹훅을 호출해 번역 작업을 요청하는 예시
-- http 확장 설치 필요

-- 1) http 확장 (이미 설치되어 있을 수도 있음)
CREATE EXTENSION IF NOT EXISTS http;

-- 2) 트리거 함수: 새 행 정보를 JSON으로 변환해 POST 요청
CREATE OR REPLACE FUNCTION public.call_translate_webhook()
RETURNS TRIGGER AS $$
DECLARE
  resp http_response;
BEGIN
    resp := http_post(
      'https://fgamdcaijqkkioafnqga.supabase.co/functions/v1/translate', -- 번역용 웹훅 주소
    json_build_object(
      'id', NEW.id,
      'text', NEW.text,
      'lang', COALESCE(NEW.lang, 'en')
    )::text,
    'application/json'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) social_raw 테이블에 AFTER INSERT 트리거 등록
CREATE TRIGGER trg_social_raw_translate
AFTER INSERT ON public.social_raw
FOR EACH ROW
EXECUTE FUNCTION public.call_translate_webhook();
