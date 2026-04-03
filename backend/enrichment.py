"""
enrichment.py

Service-specific data enrichment. Each enricher runs on a lead's website
and adds service-relevant signals to the lead dict.

Public function:
    enrich_lead(lead, service_type) → lead (modified in-place)
"""

import re
import requests
from bs4 import BeautifulSoup

from backend.website_scraper import scrape_site_advanced
from backend.evaluator import evaluate_website_data

HEADERS = {"User-Agent": "Mozilla/5.0"}
TIMEOUT = 7

MAJOR_SOCIAL_PLATFORMS = ["youtube", "instagram", "facebook", "tiktok", "twitter", "linkedin"]


def _fetch_soup(url: str):
    """Fetch URL and return BeautifulSoup object, or None on failure."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        return BeautifulSoup(resp.text, "lxml")
    except Exception:
        return None


# ─── website_development ────────────────────────────────────────────────────

def _enrich_website_development(lead: dict) -> dict:
    """Full website audit — same as before."""
    url = lead["website"]
    analysis = scrape_site_advanced(url)

    if analysis:
        try:
            evaluation = evaluate_website_data(analysis, lead.get("category", ""))
            lead["website_score"]        = evaluation.get("overall_score", 50)
            lead["website_flaws"]        = evaluation.get("flaws", [])
            lead["website_improvements"] = evaluation.get("improvements", [])
        except Exception as e:
            print(f"    Evaluation error: {e}")
            lead["website_score"]        = 50
            lead["website_flaws"]        = []
            lead["website_improvements"] = []
    else:
        lead["website_score"]        = 50
        lead["website_flaws"]        = []
        lead["website_improvements"] = []

    return lead


# ─── video_creation ──────────────────────────────────────────────────────────

def _enrich_video_creation(lead: dict) -> dict:
    """
    Detect video and social media presence on the business website.

    Adds:
        has_video_presence      bool
        video_channels          list[str]  — platform names found
        social_links            dict       — { platform: url }
        website_score           int        — 0 (no presence) to 100 (full presence)
        website_flaws           list[str]
        website_improvements    list[str]
    """
    url = lead["website"]
    soup = _fetch_soup(url)

    if not soup:
        lead["has_video_presence"]   = False
        lead["video_channels"]       = []
        lead["social_links"]         = {}
        lead["website_score"]        = 50
        lead["website_flaws"]        = ["Could not load website"]
        lead["website_improvements"] = []
        return lead

    page_text = soup.get_text().lower()
    all_links = [a.get("href", "") for a in soup.find_all("a", href=True)]
    all_links_text = " ".join(all_links).lower()
    iframes = [f.get("src", "") for f in soup.find_all("iframe", src=True)]
    iframes_text = " ".join(iframes).lower()

    # ── Detect video platforms ───────────────────────────────────────────────
    video_channels = []

    if any("youtube.com" in l for l in all_links + iframes):
        video_channels.append("youtube")
    if any("instagram.com" in l for l in all_links):
        video_channels.append("instagram")
    if any("tiktok.com" in l for l in all_links):
        video_channels.append("tiktok")
    if any("facebook.com" in l for l in all_links) and (
        "video" in all_links_text or "reel" in all_links_text
    ):
        video_channels.append("facebook_video")
    if any("vimeo.com" in l for l in all_links + iframes):
        video_channels.append("vimeo")
    if soup.find_all("video"):  # native <video> tags
        video_channels.append("embedded_video")

    has_video_presence = len(video_channels) > 0

    # ── Detect all social links ──────────────────────────────────────────────
    social_links = {}
    platform_patterns = {
        "youtube":   r"youtube\.com/(channel|@|c/)",
        "instagram": r"instagram\.com/",
        "facebook":  r"facebook\.com/",
        "tiktok":    r"tiktok\.com/@",
        "twitter":   r"(twitter|x)\.com/",
        "linkedin":  r"linkedin\.com/(company|in)/",
    }
    for a in soup.find_all("a", href=True):
        href = a["href"]
        for platform, pattern in platform_patterns.items():
            if re.search(pattern, href, re.IGNORECASE) and platform not in social_links:
                social_links[platform] = href

    # ── Flaws + improvements ─────────────────────────────────────────────────
    flaws = []
    improvements = []

    if not has_video_presence:
        flaws.append("No video content or video platform links found on website")
        improvements.append("Add a YouTube channel link or embed a brand video on the homepage")

    missing_social = [p for p in MAJOR_SOCIAL_PLATFORMS if p not in social_links]
    if missing_social:
        flaws.append(f"Missing social platforms: {', '.join(missing_social)}")
        improvements.append(f"Add links to {', '.join(missing_social[:3])} profiles in the footer")

    if "instagram" not in social_links and "tiktok" not in social_links:
        flaws.append("No short-form visual content platforms (Instagram/TikTok) linked")
        improvements.append("Create Instagram Reels or TikTok videos showcasing the business")

    # ── Website score: invert — less presence = worse site = better lead ─────
    presence_count = len(video_channels) + len(social_links)
    if presence_count == 0:
        website_score = 10   # terrible — great lead
    elif presence_count <= 2:
        website_score = 35
    elif presence_count <= 4:
        website_score = 60
    else:
        website_score = 85   # strong presence — weak lead

    lead["has_video_presence"]   = has_video_presence
    lead["video_channels"]       = video_channels
    lead["social_links"]         = social_links
    lead["website_score"]        = website_score
    lead["website_flaws"]        = flaws
    lead["website_improvements"] = improvements

    return lead


# ─── Dispatcher ──────────────────────────────────────────────────────────────

_ENRICHERS = {
    "website_development":      _enrich_website_development,
    "video_creation":           _enrich_video_creation,
    # other services fall back to website_development enrichment for now
}


def enrich_lead(lead: dict, service_type: str) -> dict:
    """
    Run the appropriate enricher for the given service type.
    Always returns the lead — never raises.
    """
    enricher = _ENRICHERS.get(service_type, _enrich_website_development)
    try:
        return enricher(lead)
    except Exception as e:
        print(f"    Enrichment failed ({service_type}) for {lead.get('website')}: {e}")
        lead.setdefault("website_score", 50)
        lead.setdefault("website_flaws", [])
        lead.setdefault("website_improvements", [])
        return lead
