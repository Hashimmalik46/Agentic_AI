from apify_client import ApifyClient
import json
import os
from dotenv import load_dotenv

load_dotenv()

APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")


def fetch_leads(business_type: str, city: str, max_results: int = 20) -> list[dict]:
    """
    Scrape Google Maps business listings via Apify.

    Returns a list of rich lead dicts and saves them to data.json.
    """
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


    # Run the actor and wait for it to finish
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

    with open("data.json", "w", encoding="utf-8") as f:
        json.dump(leads, f, indent=4, ensure_ascii=False)

    print(f"\n{len(leads)} leads saved to data.json")
    return leads


if __name__ == "__main__":
    business_type = input("Business type (e.g. dental clinics): ").strip()
    city = input("City (e.g. Delhi): ").strip()
    max_results = int(input("Max results [20]: ").strip() or "20")

    fetch_leads(business_type, city, max_results)
