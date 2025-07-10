"""
간단 태그 분류 모듈
-----------------
· tags.yaml 로부터 태그 규칙 로딩
· classify(text) -> 일치하는 태그 목록 반환
"""

import re
import yaml
from pathlib import Path

_TAGS = None

def load_tags(path: str = "tags.yaml") -> list[dict]:
    global _TAGS
    if _TAGS is None:
        with open(Path(path), "r", encoding="utf8") as f:
            _TAGS = yaml.safe_load(f)
    return _TAGS

def classify(text: str, tags: list[dict] | None = None) -> list[str]:
    tags = tags or load_tags()
    text_l = text.lower()
    matched = []
    for t in tags:
        for kw in t.get("keywords", []):
            kw_l = kw.lower()
            if kw_l in text_l:
                matched.append(t["name"])
                break
    return matched

if __name__ == "__main__":
    sample = "DOG goes multi-chain with Operation DOG Domination"
    print(classify(sample))
