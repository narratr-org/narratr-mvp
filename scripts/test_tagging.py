"""P2-4 테스트용 샘플 데이터로 태그 분류 검증 스크립트"""

from tag_classifier import classify

sample_tweets = [
    "DOG goes multi-chain! It's Operation DOG Domination time.",
    "Mass adoption is coming with better onboarding and crypto adoption.",
    "Check out this new dog meme taking over the community!",
]

expected = [
    ["Operation DOG Domination"],
    ["Crypto Adoption"],
    ["Meme"],
]

for text, exp in zip(sample_tweets, expected):
    predicted = classify(text)
    print(f"Tweet: {text}\n → predicted: {predicted} | expected: {exp}\n")
