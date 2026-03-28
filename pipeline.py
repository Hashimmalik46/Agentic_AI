"""
Full lead generation pipeline — service-aware.

Input:
  niche        : "restaurants in Delhi"
  service_type : "video_creation" | "website_development" | "seo" |
                 "social_media_management" | "digital_marketing"
  max_results  : int

Scoring:
  signals_score — hardcoded rules from service_configs.py  (service-aware)
  llm_score     — Groq LLM with service-specific prompt
  website_gap   — 100 - website_score  (bad website = better lead)

  final_score = (0.5 × llm_score) + (0.3 × website_gap) + (0.2 × signals_score)

Floor filter: rating < 2.5 OR review_count < 5 → dropped.
"""

import json
import functools
from concurrent.futures import ThreadPoolExecutor

from services.niche_parser import parse_niche
from services.query_generator import generate_queries
from scraper_apify import fetch_leads
from enrichment import enrich_lead
from lead_scorer import score_leads
from service_configs import get_service, list_services


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _priority(score: int) -> str:
    if score >= 70:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"


def _is_qualified(lead: dict) -> bool:
    rating       = lead.get("rating") or 0
    review_count = lead.get("review_count") or 0
    return rating >= 2.5 and review_count >= 5


def _signals_score(lead: dict, service_cfg: dict) -> tuple[int, list[str]]:
    """
    Rule-based score using the signal rules defined in service_configs.py.
    Returns (score, [matched rule descriptions]).
    """
    score    = 0
    matched  = []
    rating   = lead.get("rating") or 0
    reviews  = lead.get("reviews", [])
    review_count = lead.get("review_count") or 0
    website_gap  = lead.get("website_gap", 0)

    negative_count = sum(
        1 for r in reviews
        if (r.get("rating") or 5) <= 3.5
    )
    negative_ratio = negative_count / len(reviews) if reviews else 0

    for condition, points, description in service_cfg.get("signals", []):
        hit = False

        if condition == "no_website" and not lead.get("website"):
            hit = True
        elif condition == "bad_website_gap" and website_gap > 60:
            hit = True
        elif condition == "no_ssl" and lead.get("website_flaws"):
            if any("ssl" in f.lower() or "https" in f.lower() for f in lead["website_flaws"]):
                hit = True
        elif condition == "no_video_presence" and not lead.get("has_video_presence"):
            hit = True
        elif condition == "no_social_links" and lead.get("social_platform_count", 1) == 0:
            hit = True
        elif condition == "rating_sweet_spot" and 3.0 <= rating <= 4.2:
            hit = True
        elif condition == "low_review_count" and 0 < review_count < 20:
            hit = True
        elif condition == "high_review_count" and review_count > 50:
            hit = True
        elif condition == "negative_ratio" and negative_ratio > 0.2:
            hit = True

        if hit:
            score += points
            matched.append(description)

    return max(0, min(100, score)), matched


def _scrape_and_evaluate(lead: dict, service_type: str) -> dict:
    if not lead.get("website"):
        lead["website_score"]        = 0
        lead["website_flaws"]        = []
        lead["website_improvements"] = []
        return lead

    print(f"    [{service_type}] Enriching: {lead['website']}")
    return enrich_lead(lead, service_type)


def _slim(lead: dict) -> dict:
    negative_reviews = [
        {
            "author": r.get("author"),
            "rating": r.get("rating"),
            "text":   r.get("text"),
        }
        for r in lead.get("reviews", [])
        if r.get("rating") is not None
        and r["rating"] <= 3.5
        and (r.get("text") or "").strip()
    ]

    return {
        "name":                 lead.get("name"),
        "category":             lead.get("category"),
        "address":              lead.get("address"),
        "rating":               lead.get("rating"),
        "review_count":         lead.get("review_count"),
        "website":              lead.get("website"),
        "google_maps_url":      lead.get("google_maps_url"),
        "negative_reviews":     negative_reviews,
        "website_flaws":        lead.get("website_flaws", []),
        "website_improvements": lead.get("website_improvements", []),
        "signal_matches":       lead.get("signal_matches", []),
        # video_creation enrichment
        **( {"has_video_presence": lead["has_video_presence"],
             "video_channels":     lead.get("video_channels", []),
             "social_links":       lead.get("social_links", {})}
            if "has_video_presence" in lead else {} ),
        "scores": {
            "llm_score":     lead.get("llm_score", 0),
            "website_gap":   lead.get("website_gap", 0),
            "signals_score": lead.get("signals_score", 0),
            "final_score":   lead.get("final_score", 0),
        },
        "priority":     lead.get("priority"),
        "why_approach": lead.get("why_approach", ""),
        "why_not":      lead.get("why_not", ""),
    }


# ─── Main Pipeline ────────────────────────────────────────────────────────────

def run_pipeline(niche: str, service_type: str = "website_development", max_results: int = 20) -> dict:

    service_cfg = get_service(service_type)
    print(f"\n  Service: {service_cfg['label']}")

    # ── Step 1: Parse niche ──────────────────────────────────────────────────
    print("\n[1/7] Parsing niche...")
    parsed   = parse_niche(niche)
    industry = parsed["industry"]
    location = parsed["location"]
    print(f"      industry={industry}  location={location}")

    # ── Step 2: Generate queries ─────────────────────────────────────────────
    print("\n[2/7] Generating search queries...")
    queries = generate_queries(industry, location)
    print(f"      {len(queries)} queries generated")

    # ── Step 3: Scrape Google Maps ────────────────────────────────────────────
    print(f"\n[3/7] Scraping Google Maps for '{industry}' in '{location}'...")
    leads = fetch_leads(industry, location, max_results)
    print(f"      {len(leads)} leads scraped")

    if not leads:
        return {"meta": {"niche": niche, "service": service_cfg["label"], "parsed": parsed, "total_leads": 0}, "leads": []}

    # ── Floor filter ─────────────────────────────────────────────────────────
    before = len(leads)
    leads  = [l for l in leads if _is_qualified(l)]
    print(f"      {before - len(leads)} leads dropped (rating < 2.5 or < 5 reviews) → {len(leads)} remaining")

    if not leads:
        return {"meta": {"niche": niche, "service": service_cfg["label"], "parsed": parsed, "total_leads": 0}, "leads": []}

    # ── Steps 4+5: Scrape + evaluate websites (threaded) ─────────────────────
    print(f"\n[4/7] Scraping & evaluating websites (threaded)...")
    with ThreadPoolExecutor(max_workers=5) as executor:
        worker = functools.partial(_scrape_and_evaluate, service_type=service_type)
        leads = list(executor.map(worker, leads))

    # Pre-compute website_gap before signals scoring (signals use it)
    for lead in leads:
        if lead.get("website"):
            lead["website_gap"] = 100 - lead.get("website_score", 50)
        else:
            lead["website_gap"] = 100

    # ── Step 6: LLM scoring ──────────────────────────────────────────────────
    print("\n[5/7] LLM scoring leads...")
    leads = score_leads(leads, llm_context=service_cfg["llm_context"])

    # ── Step 7: Signals + final score ────────────────────────────────────────
    print("\n[6/7] Computing final scores...")
    for lead in leads:
        llm_score    = lead.get("llm_score", 0)
        website_gap  = lead.get("website_gap", 0)
        sig_score, matched = _signals_score(lead, service_cfg)

        final_score = round(
            (0.5 * llm_score) +
            (0.3 * website_gap) +
            (0.2 * sig_score)
        )
        final_score = max(0, min(100, final_score))

        lead["signals_score"]  = sig_score
        lead["signal_matches"] = matched
        lead["final_score"]    = final_score
        lead["priority"]       = _priority(final_score)

    leads.sort(key=lambda x: x["final_score"], reverse=True)

    # ── Step 8: Slim output + save ────────────────────────────────────────────
    print("\n[7/7] Saving final_leads.json...")
    slim_leads = [_slim(l) for l in leads]

    output = {
        "meta": {
            "niche":       niche,
            "service":     service_cfg["label"],
            "parsed":      parsed,
            "total_leads": len(slim_leads),
            "high":        sum(1 for l in slim_leads if l["priority"] == "HIGH"),
            "medium":      sum(1 for l in slim_leads if l["priority"] == "MEDIUM"),
            "low":         sum(1 for l in slim_leads if l["priority"] == "LOW"),
        },
        "leads": slim_leads,
    }

    with open("final_leads.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=4, ensure_ascii=False)

    print(f"\n      Done!  HIGH={output['meta']['high']}  MEDIUM={output['meta']['medium']}  LOW={output['meta']['low']}")
    if slim_leads:
        top = slim_leads[0]
        print(f"      Top lead: {top['name']}  final_score={top['scores']['final_score']}  ({top['priority']})")

    return output


if __name__ == "__main__":
    print(f"Available services: {', '.join(list_services())}\n")
    niche        = input("Niche (e.g. restaurants in Delhi): ").strip()
    service_type = input("Service type [website_development]: ").strip() or "website_development"
    max_results  = int(input("Max results [10]: ").strip() or "10")
    run_pipeline(niche, service_type, max_results)
