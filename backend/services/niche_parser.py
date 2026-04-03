# extracts industry + locations 
import os
import json
import re
from groq import Groq

def _get_client():
    return Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"  # Free, fast, very capable

# Fallback: simple regex for common "X in Y" patterns 
def _regex_parse(niche: str) -> dict | None:
    """
    Handles simple patterns like:
      - "dentists in Delhi"
      - "hotels in Kashmir"
      - "logistics startups in UAE"
    Returns None if pattern doesn't match → falls back to LLM.
    """
    pattern = r"^(.+?)\s+in\s+(.+)$"
    match = re.match(pattern, niche.strip(), re.IGNORECASE)
    if match:
        return {
            "industry": match.group(1).strip(),
            "location": match.group(2).strip()
        }
    return None


# ─── LLM parse for complex / ambiguous inputs ────────────────────────────────
def _llm_parse(niche: str) -> dict:
    
    """
    Uses Groq (Llama 3.3 70B) to extract industry and location
    from any niche string, including edge cases like:
      - "UAE logistics startups"   → industry: logistics startups, location: UAE
      - "SaaS companies"           → industry: SaaS companies, location: global
      - "restaurants near Bandra"  → industry: restaurants, location: Bandra
    """
    client = _get_client()
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a niche parser for a lead generation system. "
                    "Always respond with ONLY a valid JSON object. "
                    "No explanation, no markdown, no code fences, no extra text."
                )
            },
            {
                "role": "user",
                "content": f"""Extract the industry and location from this niche input.

Rules:
- "industry": the type of business or service (e.g. "dental clinics", "hotels", "logistics startups")
- "location": the city, region, or country. If none mentioned, use "global"

Input: "{niche}"

Respond with ONLY this JSON:
{{"industry": "...", "location": "..."}}"""
            }
        ],
        temperature=0.1,   # Low temp = consistent structured output
        max_tokens=100,
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"```json|```", "", raw).strip()
    return json.loads(raw)


#Public function 
def parse_niche(niche: str) -> dict:
    """
    Parses a raw niche string into { industry, location }.

    Strategy:
      1. Try fast regex (handles "X in Y" instantly, no API call)
      2. Fall back to Groq LLM for anything complex or ambiguous
    """
    result = _regex_parse(niche)
    if result:
        return result

    return _llm_parse(niche)