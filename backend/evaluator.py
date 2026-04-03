import json
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel('gemini-2.0-flash')


def evaluate_website_data(scraped_data: dict, business_category: str = "") -> dict:
    """
    Audits a scraped website and returns flaws + improvement suggestions.

    Returns:
        {
            "overall_score": int (0-100, LOWER = worse website = better lead),
            "flaws": [...],
            "improvements": [...]
        }
    """
    niche_hint = f"This is a {business_category} business. " if business_category else ""

    prompt = f"""
You are a website auditor for a digital marketing agency hunting for clients.
{niche_hint}Analyze this scraped website data and identify what's wrong with it.

A LOW score means the website is bad — which means it's a GOOD lead for us.

Website Data:
{json.dumps(scraped_data, indent=2)}

Evaluate based on:
1. Missing or weak SEO (title, meta description, headers)
2. Poor content (thin text, no CTAs, outdated content)
3. Technical issues (broken links, no SSL, no mobile viewport, missing alt text)
4. Missing features a {business_category or "local"} business should have (booking, contact form, reviews section, etc.)

You MUST return ONLY a valid JSON object:
{{
  "overall_score": 40,
  "flaws": [
    "Missing meta description",
    "No online booking CTA despite being a clinic",
    "3 images missing alt text"
  ],
  "improvements": [
    "Add a prominent 'Book Appointment' button above the fold",
    "Write a meta description targeting local search keywords",
    "Add patient testimonials section to build trust"
  ]
}}
"""

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.2
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"    Website evaluation error: {e}")
        return {"overall_score": 50, "flaws": [], "improvements": []}
