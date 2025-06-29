"""
Narratr GPT-4o 요약 & 키워드 추출 모듈
------------------------------------
· 함수 2개: summarize() / extract_keywords()
· OpenAI Key는 환경변수 OPENAI_API_KEY 사용
"""

import os, openai

openai.api_key = os.getenv("OPENAI_API_KEY")

def summarize(text: str, lang: str = "ko") -> str:
    prompt = (
        "다음 글을 3줄로 요약해줘. 각 줄은 60자 이하. 한국어로:\n\n"
        f"{text}\n\n요약:"
    ) if lang == "ko" else (
        f"Summarize the following text in 3 lines, each <80 chars:\n\n{text}\n\nSummary:"
    )
    resp = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return resp.choices[0].message.content.strip()

def extract_keywords(text: str, k: int = 5) -> list[str]:
    prompt = (
        "다음 글의 핵심 키워드 5개를 쉼표로 출력:\n\n" + text
    )
    resp = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    raw = resp.choices[0].message.content
    return [w.strip("# ").lower() for w in raw.split(",")][:k]

if __name__ == "__main__":
    sample = "비트코인은 2009년 등장한 탈중앙 디지털 자산으로..."
    print("요약:", summarize(sample, lang="ko"))
    print("키워드:", extract_keywords(sample))
