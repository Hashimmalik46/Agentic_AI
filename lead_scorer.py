import json
import os
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

MODEL = "llama-3.3-70b-versatile"


def _get_client():
    return Groq(api_key=os.environ.get("GROQ_API_KEY"))


# ==========================================
# 1. Profile Builder
# ==========================================
def build_profile(lead: dict) -> str:
    """Convert a single Apify lead dict into a plain-text profile for the LLM."""
    review_texts = [
        r["text"] for r in lead.get("reviews", [])
        if r.get("text") and r["text"].strip()
    ]
    reviews_combined = ". ".join(review_texts)

    city = lead.get("address", "").split(",")[-2].strip() if lead.get("address") else "Unknown"

    profile = (
        f"{lead['name']} — {lead.get('category', 'Unknown')} in {city} — "
        f"Rating: {lead.get('rating')} from {lead.get('review_count')} reviews — "
        f"Customer feedback: {reviews_combined}"
    )
    return profile


# ==========================================
# 2. LLM Scorer (single lead)
# ==========================================
def _score_lead(client: Groq, profile: str) -> dict:
    """
    Ask the LLM to score one lead as a potential outreach target.

    Returns:
        { "score": int (0-100), "reason": str }
    """
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a lead qualification specialist for a digital marketing agency. "
                    "Score businesses as outreach targets based on their online presence gaps, "
                    "customer sentiment, and growth potential. "
                    "Always respond with ONLY a valid JSON object. No markdown, no extra text."
                ),
            },
            {
                "role": "user",
                "content": f"""Score this business as a potential outreach target for a digital agency.

Business Profile:
{profile}

Scoring criteria:
- High score (70-100): has a website but reviews reveal clear pain points (slow service, pricing complaints, rude staff) — easy sales pitch
- Mid score (40-69): decent presence, mixed reviews, moderate opportunity
- Low score (0-39): no obvious pain points or very strong reputation with no gaps

No website = +15 bonus (they need digital help).

Respond with ONLY this JSON:
{{"score": 72, "reason": "one sentence explaining the score"}}"""
            },
        ],
        temperature=0.2,
        max_tokens=120,
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"```json|```", "", raw).strip()
    return json.loads(raw)


# ==========================================
# 3. Pipeline: score all leads
# ==========================================
def score_leads(leads: list[dict]) -> list[dict]:
    """
    Score every lead in the list and return them sorted by score descending.

    Each returned lead gets two extra keys:
        "score"  — int 0-100
        "reason" — one-line explanation from the LLM
    """
    client = _get_client()
    scored = []

    for i, lead in enumerate(leads, 1):
        name = lead.get("name", f"Lead #{i}")
        print(f"  [{i}/{len(leads)}] Scoring: {name}")

        try:
            profile = build_profile(lead)
            result = _score_lead(client, profile)
            lead["score"] = result.get("score", 0)
            reason = result.get("reason", "")
            lead["reason"] = reason.split(".")[0].strip() + "." if reason else ""
        except Exception as e:
            print(f"    Warning: scoring failed for '{name}': {e}")
            lead["score"] = 0
            lead["reason"] = "scoring error"

        scored.append(lead)

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored


# ==========================================
# 4. Standalone entry point
# ==========================================
if __name__ == "__main__":
    input_file = "data.json"
    output_file = "scored_leads.json"

    with open(input_file, encoding="utf-8") as f:
        leads = json.load(f)

    print(f"\nScoring {len(leads)} leads...\n")
    scored = score_leads(leads)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(scored, f, indent=4, ensure_ascii=False)

    print(f"\nTop 5 leads:")
    for lead in scored[:5]:
        print(f"  {lead['score']:>3}  {lead['name']}  — {lead['reason']}")

    print(f"\nAll scored leads saved to {output_file}")
