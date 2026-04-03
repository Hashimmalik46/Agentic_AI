import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from concurrent.futures import ThreadPoolExecutor
from playwright.sync_api import sync_playwright
from datetime import datetime, timezone
import json

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

# -----------------------------
# 🎭 Playwright Fallback
# -----------------------------
def scrape_with_playwright(url):
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)  #browser = p.chromium.launch(headless=True)
            page = p.chromium.launch().new_page()       #if error found use: page = browser.new_page()
            page.goto(url, timeout=15000)
            content = page.content()
            return content
    except Exception as e:
        print(" Playwright error:", url, e)
        return None


# -----------------------------
# 🧠 CORE SCRAPER
# -----------------------------
def scrape_site_advanced(url):
    if not url:
        return None

    try:
        response = requests.get(url, headers=HEADERS, timeout=7)
        html = response.text
        soup = BeautifulSoup(html, "lxml")

        # if fallback detection
        if len(soup.get_text(strip=True)) < 200:
            print(" fallback Using Playwright:", url)
            html = scrape_with_playwright(url)
            if not html:
                return None
            soup = BeautifulSoup(html, "lxml")

        domain = urlparse(url).netloc

        # -----------------------------
        # 📄 PAGE METADATA
        # -----------------------------
        metadata = {
            "url": url,
            # "Scrape_timestamp"
            "timestamp" : datetime.now(timezone.utc).isoformat(),
            "title_tag": soup.title.string.strip() if soup.title else None,
            "meta_description": None,
            "language": soup.html.get("lang") if soup.html else None
        }

        desc = soup.find("meta", attrs={"name": "description"})
        if desc:
            metadata["meta_description"] = desc.get("content")

        # -----------------------------
        # 🏗️ SITE ARCHITECTURE
        # -----------------------------
        internal_links, external_links = [], []
        valid_links = []
        for a in soup.find_all("a", href=True):
            href = a.get("href")
            # Skip junk links
            if href.startswith("#"):
                continue
            if href.startswith("javascript"):
                continue
            if href.startswith("mailto"):
                continue
            if href.startswith("tel"):
                continue

            full = urljoin(url, href)
            valid_links.append(full)

            # links.append(urljoin(url, a["href"]))
            # full = urljoin(url, a["href"])

            if domain in urlparse(full).netloc:
                internal_links.append(full)
            else:
                external_links.append(full)

        nav_items = []
        for nav in soup.find_all("nav"):
            nav_items.extend([a.get_text(strip=True) for a in nav.find_all("a")])

        architecture = {
            "main_navigation": list(set(nav_items)),
            "sample_links": valid_links[:15],
            "total_links": len(valid_links),
            "internal_links_count": len(set(internal_links)),
            "external_links_count": len(set(external_links))
        }

        # -----------------------------
        # 🧠 SEMANTIC CONTENT
        # -----------------------------
        text = soup.get_text(separator=" ", strip=True)

        semantic = {
            "h1": [h.get_text(strip=True) for h in soup.find_all("h1")],
            "h2": [h.get_text(strip=True) for h in soup.find_all("h2")],
            "h3": [h.get_text(strip=True) for h in soup.find_all("h3")],
            "main_body_text": text[:500],
            "call_to_action_texts": []
        }

        cta_keywords = ["contact", "buy", "join", "sign up", "get started", "book"]

        for btn in soup.find_all(["a", "button"]):
            txt = btn.get_text(strip=True).lower()
            if any(k in txt for k in cta_keywords):
                semantic["call_to_action_texts"].append(txt)

        semantic["call_to_action_texts"] = list(set(semantic["call_to_action_texts"]))

        # -----------------------------
        # ⚙️ TECHNICAL HEALTH & UX
        # -----------------------------
        images = soup.find_all("img")

        broken = 0
        for link in internal_links[:5]:
            try:
                r = requests.head(link, timeout=3)
                if r.status_code >= 400:
                    broken += 1
            except:
                broken += 1

        ux = {
            "status_code": response.status_code,
            "no_of_images": len(images),
            "images_without_alt_text": sum(1 for img in images if not img.get("alt")),
            "broken_links_found": broken,
            "word_count": len(text.split()),
            "has_ssl": url.startswith("https"),
            "mobile_viewport_tag_present": bool(soup.find("meta", attrs={"name": "viewport"}))
        }

        return {
            "page_metadata": metadata,
            "site_architecture": architecture,
            "semantic_content": semantic,
            "technical_health_and_ux_indicators": ux
        }

    except Exception as e:
        print(" Error:", url, e)
        return None


# -----------------------------
# 🧵 THREAD WORKER
# -----------------------------
def process_lead(lead):
    website = lead.get("website")

    print(" Scraping:", website)

    analysis = scrape_site_advanced(website)

    lead["analysis"] = analysis

    return lead


# -----------------------------
# 🚀 MAIN PIPELINE
# -----------------------------
if __name__ == "__main__":
    with open("data.json", "r", encoding="utf-8") as f:
        leads = json.load(f)

    print(f" Total websites: {len(leads)}")

    # ⚡ THREADING
    with ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(process_lead, leads))

    # 💾 SAVE
    with open("analyzed_data.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4)

    print("\n✅ Done! Saved to analyzed_data.json")