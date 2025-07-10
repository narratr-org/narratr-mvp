# Vercel 프로젝트 설정 검토 포인트 (P6-1)

아래 항목을 통해 Vercel 프로젝트 구성을 점검한다.

## 1. 환경변수 세팅
- 프로젝트에서 사용하는 주요 키를 Vercel의 **Environment Variables** 섹션에 등록한다.
- 예시 변수
  - `OPENAI_API_KEY`
  - `TWITTER_BEARER`
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
  - `SUPABASE_ANON_KEY`

## 2. 빌드 커맨드 / 출력 디렉터리
- 기본 빌드 커맨드: `npm run build` (`next build`).
- Next.js 프로젝트는 기본적으로 `.next` 폴더에 결과가 생성된다.
- Vercel은 프레임워크를 자동 인식하므로 별도 설정이 없다면 이 경로가 자동 사용된다.

## 3. 스케줄 미드나잇 배포 확인
- Vercel **Scheduled Deployments** 또는 크론 설정을 활용해 매일 자정 배포가 이루어지는지 확인한다.
- 현재 `vercel.json`에는 다음과 같은 예시 크론 작업이 있다.
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/fetch_price",
        "schedule": "0 * * * *"
      }
    ]
  }
  ```
- 자정 배포가 필요하면 `"schedule": "0 0 * * *"` 형식으로 수정하거나 Vercel 대시보드에서 스케줄을 등록한다.
