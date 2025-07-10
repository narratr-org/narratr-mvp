# Supabase Function 실행 로그 모니터링 설정

다음 예시는 Supabase Functions 의 실행 로그를 외부 서비스로 전달하고, 실패 시 웹훅 알림을 받는 기본적인 방법을 설명합니다. 실제 명령은 `supabase` CLI에서 실행해야 하며, 프로젝트와 키 값 등은 환경에 맞게 변경하세요.

## 1. Log forwarding 설정 예시

### Datadog 으로 전달
```bash
# Datadog 로그 드레인 생성
supabase logdrains create datadog \
  --name datadog-drain \
  --api-key $DATADOG_API_KEY \
  --region us5               # 필요에 따라 eu 등으로 변경
```

### Papertrail 로 전달
```bash
# Papertrail 은 HTTP 드레인을 사용합니다
supabase logdrains create http \
  --name papertrail-drain \
  --endpoint https://logsN.papertrailapp.com/YOUR_TOKEN \
  --format rfc5424
```

위 명령이 성공하면 Supabase Functions 의 로그가 지정한 서비스로 실시간 전송됩니다.

## 2. 실패 알림 웹훅 설정 예시

로그 드레인을 이용해 HTTP 엔드포인트로 로그를 전달하면, 실패 로그만 골라서 별도 알림을 보낼 수 있습니다. 예시로 간단한 Cloudflare Worker 코드를 보여줍니다.

```ts
// webhook-handler.ts
export default {
  async fetch(req: Request): Promise<Response> {
    const logs = await req.json();

    // error 레벨만 추려서 Slack 으로 전송
    const errors = logs.entries?.filter((e: any) => e.level === 'error');
    if (errors.length) {
      await fetch(process.env.SLACK_WEBHOOK!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `Supabase 오류 발생: ${errors.length}건` })
      });
    }

    return new Response('ok');
  }
}
```

웹훅 URL 은 `SLACK_WEBHOOK` 환경변수로 관리하고, `supabase logdrains create http` 명령의 `--endpoint` 값에 이 워커 URL 을 사용합니다. 이렇게 하면 함수 실패 시 알림을 받아볼 수 있습니다.
