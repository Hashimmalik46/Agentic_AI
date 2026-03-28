from apify_client import ApifyClient
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
import re
from urllib.parse import urljoin
from playwright.sync_api import sync_playwright
import json
import os
from dotenv import load_dotenv

load_dotenv()

APIFY_TOKEN = os.getenv("APIFY_API_TOKEN")
client = ApifyClient(APIFY_TOKEN)

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

# ---------------- HYBRID SCRAPER ----------------
def scrape_emails(url):
    emails = set()

    # Step 1: fast scrape
    emails.update(scrape_with_requests(url))

    # Step 2: fallback to Playwright
    if not emails:
        emails.update(scrape_with_playwright(url))

    return list(emails)

# ---------------- FETCH LEADS FROM APIFY ----------------
def fetch_leads(query, max_results=20):
    run_input = {
        "searchStringsArray": [query],
        "maxCrawledPlacesPerSearch": max_results
    }

    run = client.actor("compass/crawler-google-places").call(run_input=run_input)

    dataset_id = run["defaultDatasetId"]
    leads = list(client.dataset(dataset_id).iterate_items())

    return leads

# ---------------- THREAD WORKER ----------------
def process_lead(lead):
    website = lead.get("website")

    if not website:
        return {
            "name": lead.get("title"),
            "website": None,
            "emails": []
        }

    emails = scrape_emails(website)

    print(f"✅ {lead.get('title')} → {len(emails)} emails")

    return {
        "name": lead.get("title"),
        "website": website,
        "emails": emails
    }

# ---------------- MAIN ----------------
def main():
    # business_type = input("Business type: ")
    # city = input("City: ")

    # query = f"{business_type} in {city}"

    # print("\n🚀 Fetching data from Apify...")
    # leads = fetch_leads(query, max_results=20)






    # Load your existing scraped data
    with open("data.json", encoding="utf-8") as f:
        data = json.load(f)

    results = []

    print("\n🚀 Extracting emails ...\n")

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(process_lead, item) for item in data]

        for future in as_completed(futures):
            results.append(future.result())

    # Save output
    with open("emails.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4, ensure_ascii=False)

    print("\n✅ Emails saved to emails.json")










    # results = []

    # print("\n⚡ Extracting emails (threaded)...")

    # with ThreadPoolExecutor(max_workers=8) as executor:
    #     futures = [executor.submit(process_lead, lead) for lead in leads]

    #     for future in as_completed(futures):
    #         results.append(future.result())

    # Save output
    # with open("data_with_emails.json", "w", encoding="utf-8") as f:
    #     json.dump(results, f, indent=4, ensure_ascii=False)

    # print("\n✅ Saved to data_with_emails.json")

# ---------------- RUN ----------------
if __name__ == "__main__":
    main()