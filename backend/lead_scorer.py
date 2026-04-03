import json
import os
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

MODEL = "llama-3.3-70b-versatile"


def _get_client():
    return Groq(api_key=os.environ.get("GROQ_API_KEY"))


def build_profile(lead: dict) -> str:
    """
    Build a plain-text profile for the LLM.
    Only includes negative reviews (≤ 3.5 stars) and website flaws.
    """
    negative_reviews = [
        r for r in lead.get("reviews", [])
        if r.get("rating") is not None
        and r["rating"] <= 3.5
        and (r.get("text") or "").strip()
    ]
    reviews_combined = ". ".join(r["text"] for r in negative_reviews) if negative_reviews else "No negative reviews."

    website_flaws = lead.get("website_flaws", [])
    flaws_text = "; ".join(website_flaws) if website_flaws else "Website not available or not scraped."

    profile = (
        f"Business: {lead.get('name')}\n"
        f"Category: {lead.get('category', 'Unknown')}\n"
        f"Location: {lead.get('address', 'Unknown')}\n"
        f"Rating: {lead.get('rating')} from {lead.get('review_count')} reviews\n"
        f"Website: {'Yes — ' + lead['website'] if lead.get('website') else 'No website'}\n"
        f"Website flaws: {flaws_text}\n"
        f"Negative customer feedback: {reviews_combined}"
    )

    # Append service-specific enrichment signals if present
    enrichment_lines = []
    if "has_video_presence" in lead:
        if lead["has_video_presence"]:
            enrichment_lines.append(f"Video presence: Yes — platforms: {', '.join(lead.get('video_channels', []))}")
        else:
            enrichment_lines.append("Video presence: None detected")
    if "social_links" in lead:
        platforms = list(lead["social_links"].keys())
        enrichment_lines.append(f"Social platforms found: {', '.join(platforms) if platforms else 'None'}")
        if lead.get("missing_major_platforms"):
            enrichment_lines.append(f"Missing platforms: {', '.join(lead['missing_major_platforms'])}")
    if enrichment_lines:
        profile += "\nService-specific signals:\n" + "\n".join(enrichment_lines)

    return profile


def _score_lead(client: Groq, profile: str, llm_context: str) -> dict:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    f"{llm_context} "
                    "Always respond with ONLY a valid JSON object. No markdown, no extra text."
                ),
            },
            {
                "role": "user",
                "content": f"""Score this business as a potential outreach target.

Business Profile:
{profile}

Scoring criteria:
- High (70-100): clear need for your service — pain points visible in reviews or website flaws
- Mid (40-69): some opportunity, moderate need
- Low (0-39): strong presence, low need
- No website = +15 bonus

Respond with ONLY this JSON (one sentence each):
{{
  "score": 72,
  "why_approach": "specific reason WHY we should reach out based on their gaps",
  "why_not": "specific reason WHY we might skip this one"
}}"""
            },
        ],
        temperature=0.2,
        max_tokens=200,
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"```json|```", "", raw).strip()
    return json.loads(raw)


def score_leads(leads: list[dict], llm_context: str = "") -> list[dict]:
    client = _get_client()

    for i, lead in enumerate(leads, 1):
        name = lead.get("name", f"Lead #{i}")
        print(f"  [{i}/{len(leads)}] Scoring: {name}")

        try:
            profile = build_profile(lead)
            result = _score_lead(client, profile, llm_context)
            lead["llm_score"]    = result.get("score", 0)
            lead["why_approach"] = result.get("why_approach", "")
            lead["why_not"]      = result.get("why_not", "")
        except Exception as e:
            print(f"    Warning: scoring failed for '{name}': {e}")
            lead["llm_score"]    = 0
            lead["why_approach"] = ""
            lead["why_not"]      = "scoring error"

    return leads
