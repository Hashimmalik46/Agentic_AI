import json
import re
from pathlib import Path
from typing import Any, Dict, List

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

# ---------------- PAIN POINT DETECTION ----------------
def detect_pain_points(text: str) -> int:
    pain_keywords = [
        "slow", "delay", "late", "bad", "poor", "worst",
        "expensive", "overpriced", "costly",
        "rude", "unprofessional", "dirty",
        "disappoint", "issue", "problem", "complaint"
    ]

    tokens = tokenize(text)
    return sum(1 for word in tokens if word in pain_keywords)

# ---------------- BUILD PROFILE (LIKE LLM FILE) ----------------
def build_profile(lead: dict) -> str:
    reviews = lead.get("reviews", [])
    review_text = " ".join(
        str(r.get("text") or "") for r in reviews if isinstance(r, dict)
    )

    return f"{lead.get('name')} | Rating: {lead.get('rating')} | Reviews: {review_text}"

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

        pain_points = detect_pain_points(review_text)

        # ---------------- FINAL SCORE ----------------
        score = 0

        # Website
        if has_website:
            score += 0
        else:
            score += 30   # same as LLM rule

        # Pain Points
        score += min(pain_points * 5, 40)

        # Rating Adjustment
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


        # Add details
        lead["score"] = score
        lead["category"] = category
        lead["pain_points"] = pain_points
    

        scored.append(lead)

    # Sort
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

    # Save top results
    output_file.write_text(
        json.dumps(results, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )

    print("✅ score.json created successfully")

# ---------------- RUN ----------------
if __name__ == "__main__":
    main()