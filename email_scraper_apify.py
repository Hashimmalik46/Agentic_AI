from apify_client import ApifyClient
import json
import os
from dotenv import load_dotenv
import re
import requests
from urllib.parse import urljoin
from concurrent.futures import ThreadPoolExecutor, as_completed
from playwright.sync_api import sync_playwright

load_dotenv()

APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")

# ---------------- EMAIL REGEX ----------------
EMAIL_REGEX = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"

# ---------------- REQUEST SCRAPER ----------------
def scrape_with_requests(url):
    emails = set()
    pages = ["", "/contact", "/about"]

    headers = {"User-Agent": "Mozilla/5.0"}

    for page in pages:
        try:
            full_url = urljoin(url, page)
            res = requests.get(full_url, headers=headers, timeout=5)

            if res.status_code != 200:
                continue

            text = res.text.lower()
            text = text.replace("[at]", "@").replace("[dot]", ".")

            found = re.findall(EMAIL_REGEX, text)
            emails.update(found)

        except:
            continue

    return emails

# ---------------- PLAYWRIGHT SCRAPER ----------------
def scrape_with_playwright(url):
    emails = set()

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            page.goto(url, timeout=10000)
            content = page.content().lower()

            content = content.replace("[at]", "@").replace("[dot]", ".")

            found = re.findall(EMAIL_REGEX, content)
            emails.update(found)

            browser.close()

    except:
        pass

    return emails

# ---------------- HYBRID EMAIL SCRAPER ----------------
def scrape_emails(url):
    emails = set()

    emails.update(scrape_with_requests(url))

    if not emails:
        emails.update(scrape_with_playwright(url))

    return list(emails)

# ---------------- THREAD WORKER ----------------
def process_lead(lead):
    website = lead.get("website")

    if website:
        emails = scrape_emails(website)
    else:
        emails = []

    print(f"✅ {lead.get('name')} → {len(emails)} emails")

    lead["emails"] = emails
    return lead

# ---------------- MAIN FUNCTION ----------------
def fetch_leads(business_type: str, city: str, max_results: int = 20) -> list[dict]:
    client = ApifyClient(APIFY_API_TOKEN)

    search_query = f"{business_type} in {city}"
    print(f"\nSearching: '{search_query}' (max {max_results} results)\n")

    run_input = {
        "searchStringsArray": [search_query],
        "maxCrawledPlacesPerSearch": max_results,
        "language": "en",
        "scrapePlaceDetailPage": True,
        "maxReviews": 10,
        "reviewsSort": "newest",
        "reviewsOrigin": "google",
        "scrapeReviewsPersonalData": True,
        "exportPlaceUrls": True,
    }

    run = client.actor("compass/crawler-google-places").call(run_input=run_input)

    leads = []

    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        lead = {
            "name": item.get("title"),
            "phone": item.get("phone"),
            "website": item.get("website"),
            "address": item.get("address"),
            "rating": item.get("totalScore"),
            "review_count": item.get("reviewsCount"),
            "category": item.get("categoryName"),
            "opening_hours": item.get("openingHours"),
            "google_maps_url": item.get("url"),
            "reviews": [
                {
                    "author": r.get("name"),
                    "rating": r.get("stars"),
                    "text": r.get("text"),
                    "date": r.get("publishedAtDate"),
                }
                for r in (item.get("reviews") or [])
            ],
        }

        leads.append(lead)
        print(f"  {lead['name']}  |  {lead['rating']}★  |  {lead['review_count']} reviews")

    print("\n⚡ Extracting emails (threaded)...\n")

    results = []

    # -------- THREADING START --------
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(process_lead, lead) for lead in leads]

        for future in as_completed(futures):
            results.append(future.result())
    # -------- THREADING END --------

    # Save final output
    with open("data.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4, ensure_ascii=False)

    print(f"\n✅ {len(results)} leads saved to data_with_emails.json")

    return results


# ---------------- RUN ----------------
if __name__ == "__main__":
    business_type = input("Business type (e.g. dental clinics): ").strip()
    city = input("City (e.g. Delhi): ").strip()
    max_results = int(input("Max results [20]: ").strip() or "20")

    fetch_leads(business_type, city, max_results)