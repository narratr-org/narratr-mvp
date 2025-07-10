"""
Rule-based classifier using tag keywords.
- Input: text (already translated)
- Output: list of {tag, confidence}
"""

from pathlib import Path
import yaml

TAG_FILE = Path(__file__).resolve().parent / "tags.yaml"

# Load tag definitions at module import
with TAG_FILE.open("r", encoding="utf8") as f:
    TAGS = yaml.safe_load(f)


def classify(text: str) -> list[dict[str, float]]:
    """Return confidence for each tag based on keyword matches."""
    text_lower = text.lower()
    results: list[dict[str, float]] = []

    for tag in TAGS:
        keywords = [kw.lower() for kw in tag.get("keywords", [])]
        matches = sum(1 for kw in keywords if kw in text_lower)
        confidence = round(matches / len(keywords), 2) if keywords else 0.0
        results.append({"tag": tag.get("name", ""), "confidence": confidence})

    return results


if __name__ == "__main__":
    sample = "Listing on major exchange!"  # 테스트 예시
    print(classify(sample))
