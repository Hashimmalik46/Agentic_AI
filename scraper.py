from serpapi import GoogleSearch
import time
import json
import os
from dotenv import load_dotenv

load_dotenv()

SERPAPI_KEY = os.getenv("SAPI_KEY")

def fetch_leads(query, max_results=20):
    leads = []
    next_page_token = None
    page = 1

    while len(leads) < max_results:
        print(f"\n📄 Fetching page {page}...")

        params = {
            "engine": "google_maps",
            "q": query,
            "api_key": SERPAPI_KEY
        }

        if next_page_token:
            params["next_page_token"] = next_page_token

        search = GoogleSearch(params)
        results = search.get_dict()

        if "error" in results:
            print("API Error:", results["error"])
            break

        local_results = results.get("local_results", [])

        if not local_results:
            print("No results found")
            break
        for place in local_results:
            lead = {
                "name": place.get("title"),
                "phone": place.get("phone"),
                "website": place.get("website"),
                "rating": place.get("rating")
            }
            leads.append(lead)

            print("✅", lead["name"])

            if len(leads) >= max_results:
                break

        # Pagination
        next_page_token = results.get("serpapi_pagination", {}).get("next_page_token")

        if not next_page_token:
            print("❌ Maximum Result Occur... No more pages")
            break

        page += 1
        time.sleep(2)


    # Save to JSON file
    with open("data.json", "w", encoding="utf-8") as f:
        json.dump(leads, f, indent=4)



    return leads


# 🚀 TEST
# if __name__ == "__main__":
#     data = fetch_leads("restaurants in Delhi", max_results=10)

#     print("\n🎯 FINAL OUTPUT:\n")
#     for d in data:
#         print(d)

# Test 2
if __name__ == "__main__":
    business_type = input("Business type: ") # eg software companies
    city = input("City: ") # eg bangalore

    query = f"{business_type} in {city}"

    data = fetch_leads(query, max_results=10)

    # Save to JSON file
    with open("data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("\n data saved to data.json")