# expands into 10 search queries
import os
import json
import re
from groq import Groq

def _get_client():
    return Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"


def generate_queries(industry: str, location: str) -> list[str]:
    """
    Takes structured industry + location and generates multiple
    search queries to maximize lead discovery coverage.

    Example:
      industry = "dental clinics"
      location = "Delhi"

    Returns:
      [
        "dental clinic Delhi",
        "dentist near me Delhi",
        "orthodontist in Delhi",
        "teeth whitening clinic Delhi",
        ...
      ]
    """
    client = _get_client()

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a lead generation specialist for a digital agency. "
                    "Always respond with ONLY a valid JSON array of strings. "
                    "No explanation, no markdown, no code fences, no extra text."
                )
            },
            {
                "role": "user",
                "content": f"""Generate 10 diverse search queries to find real businesses.

Industry: {industry}
Location: {location}

Rules:
- Mix broad and specific queries
- Include synonyms and related services
- Include sub-location variants (neighborhoods, areas, districts)
- Include intent-based queries (e.g. "dentist appointment booking Delhi")
- Vary query formats for both Google Maps and web search
- All queries should be in English

Respond with ONLY a JSON array:
["query one", "query two", "query three", ...]"""
            }
        ],
        temperature=0.7,   # Slightly higher for creative query diversity
        max_tokens=400,
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"```json|```", "", raw).strip()
    queries = json.loads(raw)

    # Deduplicate while preserving order
    seen = set()
    unique = []
    for q in queries:
        q_clean = q.strip()
        if q_clean.lower() not in seen:
            seen.add(q_clean.lower())
            unique.append(q_clean)

    return unique