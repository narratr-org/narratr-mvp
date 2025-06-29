from datetime import datetime, timezone
from dotenv import load_dotenv
import os
import requests
from supabase import create_client

# .env.local에서 환경변수 로드
load_dotenv(".env.local")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

assert SUPABASE_URL and SUPABASE_SERVICE_KEY, "환경변수가 누락됐어요!"

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

INTERVAL_MAP = {
    1: "1m",
    5: "5m",
    15: "15m",
    60: "1h",
}

def fetch_kraken_ohlc(pair="DOGUSD", interval=60):
    url = "https://api.kraken.com/0/public/OHLC"
    params = {
        "pair": pair,
        "interval": interval
    }
    try:
        res = requests.get(url, params=params, timeout=10)
        res.raise_for_status()
        data = res.json()
    except Exception as e:
        print(f"❌ Kraken 요청 실패 (interval={interval}):", e)
        return []

    result_key = next(iter(data["result"].keys()))
    candles = []

    for row in data["result"][result_key]:
        ts = datetime.utcfromtimestamp(int(row[0])).replace(tzinfo=timezone.utc).isoformat()
        close = float(row[4])
        candles.append({
            "ts": ts,
            "close": close,
            "interval": INTERVAL_MAP[interval]
        })

    return candles

def upsert_candle(candle):
    supabase.table("price_candles").upsert(candle, on_conflict=["ts", "interval"]).execute()

if __name__ == "__main__":
    total = 0
    for kraken_interval in [1, 5, 15, 60]:
        candles = fetch_kraken_ohlc(interval=kraken_interval)
        for c in candles:
            upsert_candle(c)
        print(f"✅ {INTERVAL_MAP[kraken_interval]}: {len(candles)}개 저장")
        total += len(candles)
    
    print(f"🎉 전체 저장 완료: {total}개 캔들")
