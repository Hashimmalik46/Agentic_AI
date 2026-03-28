from serpapi import GoogleSearch
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import json
import os
from dotenv import load_dotenv

load_dotenv()

SERPAPI_KEY = os.getenv("API_KEY")


# Retry wrapper for API calls
def safe_search(params, retries=3, delay=2):
    for attempt in range(retries):
        try:
            search = GoogleSearch(params)
            results = search.get_dict()

            # Handle API errors
            if "error" in results:
                print(f" API Error: {results['error']}")
                time.sleep(delay * (attempt + 1))
                continue

            return results

        except Exception as e:
            print(f" Exception: {e}")
            time.sleep(delay * (attempt + 1))

    return {}


#  Process each place (thread worker)
def process_place(place):
    return {
        "name": place.get("title"),
        "phone": place.get("phone"),
        "website": place.get("website"),
        "rating": place.get("rating")
    }


def fetch_leads(query, max_results=20):
    leads = []
    next_page_token = None
    page = 1

    while len(leads) < max_results:
        print(f"\n Fetching page {page}...")

        params = {
            "engine": "google_maps",
            "q": query,
            "api_key": SERPAPI_KEY
        }

        if next_page_token:
            params["next_page_token"] = next_page_token

        #  Safe API call
        results = safe_search(params)

        if not results:
            print(" Failed after retries")
            break

        local_results = results.get("local_results", [])

        if not local_results:
            print(" No results found")
            break

        # ⚡ THREADING START
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(process_place, place) for place in local_results]

            for future in as_completed(futures):
                lead = future.result()
                leads.append(lead)

                print("✅", lead["name"])

                if len(leads) >= max_results:
                    break
        #  THREADING END

        #  Pagination
        next_page_token = results.get("serpapi_pagination", {}).get("next_page_token")

        if not next_page_token:
            print("❌ No more pages")
            break

        page += 1

        #avoid rate limit
        time.sleep(1)

    return leads


# MAIN
if __name__ == "__main__":
    business_type = input("Business type: ")
    city = input("City: ")

    query = f"{business_type} in {city}"

    data = fetch_leads(query, max_results=20)

    # filename = f"{business_type}_{city}.json".replace(" ", "_")

    with open("data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("\n data saved to json")