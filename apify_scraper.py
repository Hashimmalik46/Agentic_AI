from apify_client import ApifyClient
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import json
import os
from dotenv import load_dotenv

load_dotenv()

APIFY_TOKEN = os.getenv("APIFY_TOKEN")

client = ApifyClient(APIFY_TOKEN)


# Process each place (same as before)
def process_place(place):
    return {
        "name": place.get("title"),
        "phone": place.get("phone"),
        "website": place.get("website"),
        "rating": place.get("rating")
    }


def fetch_leads(query, max_results=20):
    leads = []

    print("\n🚀 Running Apify Actor...")

    run_input = {
        "searchStringsArray": [query],
        "maxCrawledPlacesPerSearch": max_results
    }

    # 🔥 Google Maps Scraper Actor
    run = client.actor("compass/crawler-google-places").call(run_input=run_input)

    dataset_id = run["defaultDatasetId"]

    items = list(client.dataset(dataset_id).iterate_items())

    if not items:
        print("❌ No results found")
        return leads

    # ⚡ THREADING (same logic as yours)
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(process_place, place) for place in items]

        for future in as_completed(futures):
            lead = future.result()
            leads.append(lead)

            print("✅", lead["name"])

            if len(leads) >= max_results:
                break

    return leads


# MAIN
if __name__ == "__main__":
    business_type = input("Business type: ")
    city = input("City: ")

    query = f"{business_type} in {city}"

    data = fetch_leads(query, max_results=20)

    with open("data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("\n✅ data saved to json")