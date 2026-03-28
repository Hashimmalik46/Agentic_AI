#!/usr/bin/env python3

import json
import re
from pathlib import Path
from typing import Any, Dict, List

# Vector libs
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# ---------------- LOAD MODEL ----------------
model = SentenceTransformer("all-MiniLM-L6-v2")

# Pain point reference sentences
PAIN_EXAMPLES = [
    "slow service",
    "bad customer service",
    "rude staff",
    "overpriced food",
    "poor quality",
    "long waiting time",
    "dirty environment",
    "unprofessional behavior"
]

PAIN_VECTORS = model.encode(PAIN_EXAMPLES)

# ---------------- TOKENIZER ----------------
TOKEN_RE = re.compile(r"[a-z0-9]+")

def tokenize(text: str | None) -> List[str]:
    if not text:
        return []
    return TOKEN_RE.findall(text.lower())

# ---------------- SAFE HELPERS ----------------
def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except:
        return default

# ---------------- SEMANTIC PAIN DETECTION ----------------
def semantic_pain_score(review_text: str) -> int:
    if not review_text.strip():
        return 0

    review_vec = model.encode([review_text])[0]

    score = 0
    for pain_vec in PAIN_VECTORS:
        sim = cosine_similarity([review_vec], [pain_vec])[0][0]
        if sim > 0.5:   # threshold
            score += 1

    return score

# ---------------- SCORING ----------------
def score_leads(leads: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    scored = []

    for lead in leads:
        rating = safe_float(lead.get("rating"))
        has_website = bool(lead.get("website"))

        # Combine reviews
        reviews = lead.get("reviews") or []
        review_text = " ".join(
            str(r.get("text") or "") for r in reviews if isinstance(r, dict)
        )

        # 🔥 Semantic pain detection
        pain_points = semantic_pain_score(review_text)

        # ---------------- FINAL SCORE ----------------
        score = 0

        # Website
        if has_website:
            score += 30
        else:
            score += 15   # no website bonus

        # Pain points (semantic)
        score += min(pain_points * 8, 40)

        # Rating adjustment
        if rating >= 4.5:
            score -= 20
        elif rating >= 4.0:
            score -= 10
        elif rating >= 3.0:
            score += 5
        else:
            score += 15

        # Clamp
        score = max(0, min(100, score))

        # ---------------- CATEGORY ----------------
        if score >= 70:
            category = "High Opportunity"
        elif score >= 40:
            category = "Medium Opportunity"
        else:
            category = "Low Opportunity"

        # ---------------- REASON ----------------
        if score >= 70:
            reason = "Has strong online presence but clear customer dissatisfaction."
        elif score >= 40:
            reason = "Mixed customer feedback with some improvement opportunities."
        else:
            reason = "Good reputation with minimal issues."

        lead["score"] = score
        lead["category"] = category
        lead["pain_points"] = pain_points
        lead["reason"] = reason

        scored.append(lead)

    # Sort by score
    scored.sort(key=lambda x: x["score"], reverse=True)

    # Rank
    for i, item in enumerate(scored, 1):
        item["rank"] = i

    return scored

# ---------------- MAIN ----------------
def main():
    input_file = Path("data.json")
    output_file = Path("score.json")

    if not input_file.exists():
        print("❌ data.json not found")
        return

    with open(input_file, encoding="utf-8") as f:
        leads = json.load(f)

    results = score_leads(leads)

    output_file.write_text(
        json.dumps(results, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )

    print("✅ score.json created successfully")

# ---------------- RUN ----------------
if __name__ == "__main__":
    main()