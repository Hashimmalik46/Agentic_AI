import re
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "Mozilla/5.0"}
TIMEOUT = 8


def _normalize_url(url: str) -> str | None:
    if not url:
        return None
    url = url.strip()
    if not url:
        return None
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url.replace("http://", "https://")


def _is_likely_email(email: str) -> bool:
    e = (email or "").strip().lower()
    if not e or "@" not in e:
        return False
    if e.startswith(("info@", "support@", "hello@", "sales@", "contact@", "reservations@", "marketing@")):
        return True
    # Filter obvious placeholders/junk
    bad_substrings = ["example.com", "domain.com", "yourname@", "email@", "test@"]
    if any(b in e for b in bad_substrings):
        return False
    if e.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg")):
        return False
    return True


def _extract_from_html(html: str) -> list[str]:
    if not html:
        return []

    emails: set[str] = set()

    # Regex (covers most visible emails)
    for m in re.findall(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", html, flags=re.IGNORECASE):
        m = m.strip().lower().rstrip(".,;:)")
        if _is_likely_email(m):
            emails.add(m)

    # mailto: links (more precise)
    try:
        soup = BeautifulSoup(html, "lxml")
        for a in soup.find_all("a", href=True):
            href = a.get("href", "")
            if not href.lower().startswith("mailto:"):
                continue
            addr = href.split(":", 1)[1].split("?", 1)[0].strip().lower()
            if _is_likely_email(addr):
                emails.add(addr)
    except Exception:
        pass

    return sorted(emails)


def _safe_get(url: str) -> str | None:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True)
        if resp.status_code >= 400:
            return None
        return resp.text
    except Exception:
        return None


def extract_emails_from_url(url: str, max_pages: int = 3) -> list[str]:
    """
    Best-effort email extraction from a website.
    Tries homepage + a couple common "contact" pages.
    """
    url = _normalize_url(url)
    if not url:
        return []

    parsed = urlparse(url)
    if not parsed.netloc:
        return []

    candidates = [url]
    for path in ["/contact", "/contact-us", "/about", "/about-us", "/support"]:
        candidates.append(urljoin(url, path))

    emails: list[str] = []
    seen: set[str] = set()

    for candidate in candidates[: max(1, max_pages)]:
        html = _safe_get(candidate)
        for e in _extract_from_html(html or ""):
            if e not in seen:
                seen.add(e)
                emails.append(e)

    return emails

