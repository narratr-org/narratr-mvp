# narratr-mvp
Narratr MVP – auto-summary &amp; KOL traffic hub

▶ 자세한 구조 문서: [docs/architecture.md](docs/architecture.md)

## Quick start (dev)

```bash
# 1. 클론 & 가상환경
git clone https://github.com/narratr-org/narratr-mvp.git
cd narratr-mvp && python -m venv venv && source venv/bin/activate

# 2. 의존 패키지
pip install openai python-dotenv requests

# 3. 환경변수
echo 'OPENAI_API_KEY=sk-...' > .env
echo 'TWITTER_BEARER=...'   >> .env

# 4. 테스트
python ingest_worker.py          # 트윗 JSON 생성
python summarizer.py             # 요약·키워드 확인


## Deployment
2025-07-14: API Routes migrated to Edge runtime to fix Vercel size limit.

