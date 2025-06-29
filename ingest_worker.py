"""
Narratr v0.1 - 간단 Ingestion 워커
---------------------------------
· Twitter API v2 샘플 (베어러 토큰 필요)
· 지정된 KOL 핸들 1명 → 최근 5트윗 수집
· 결과를 data/{handle}.json 로 저장
"""

import os, json, requests
from datetime import datetime

BEARER = os.getenv("TWITTER_BEARER")  # 환경변수에 넣어두기
HEADERS = {"Authorization": f"Bearer {BEARER}"}

KOL_HANDLE = "riotboy2024"           # PoC용, 필요시 교체
TWEET_LIMIT = 5

def fetch_tweets(handle: str, limit: int = 5):
    url = ("https://api.twitter.com/2/tweets/search/recent"
           f"?query=from:{handle}&max_results={limit}"
           "&tweet.fields=id,text,created_at,lang")
    rsp = requests.get(url, headers=HEADERS, timeout=10)
    rsp.raise_for_status()
    return rsp.json()["data"]

def save_json(handle: str, tweets):
    os.makedirs("data", exist_ok=True)
    fname = f"data/{handle}_{datetime.utcnow().strftime('%Y%m%dT%H%M')}.json"
    with open(fname, "w", encoding="utf8") as f:
        json.dump(tweets, f, ensure_ascii=False, indent=2)
    print("Saved", fname)

if __name__ == "__main__":
    tweets = fetch_tweets(KOL_HANDLE, TWEET_LIMIT)
    save_json(KOL_HANDLE, tweets)
